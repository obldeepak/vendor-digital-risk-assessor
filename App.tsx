
import React, { useState, useCallback } from 'react';
import { VendorInput } from './components/VendorInput';
import { ChecklistItemDisplay } from './components/ChecklistItemDisplay';
import { RiskSummaryDisplay } from './components/RiskSummaryDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { type ChecklistItemResult, type VendorRiskProfile } from './types';
import { ChecklistItemId, CHECKLIST_CONFIG, MAX_POSSIBLE_SCORE_POST_QUALIFICATION, PASS_THRESHOLD_PERCENTAGE } from './constants';
import { analyzeDomainPresence, analyzeDmarc, analyzeWebsiteSecurity, analyzeGrcPolicies, analyzeBreaches, analyzeLitigation, analyzeOnlineReviews, analyzeYearsInBusiness, analyzeVulnerabilities } from './services/riskAnalysisService';

const App: React.FC = () => {
  const [vendorDomain, setVendorDomain] = useState<string>('');
  const [riskProfile, setRiskProfile] = useState<VendorRiskProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);

  React.useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
      setError("Gemini API Key (API_KEY environment variable) is not configured. Please set it up to use the analyzer.");
    }
  }, []);

  const initializeChecklist = (): ChecklistItemResult[] => {
    return Object.values(CHECKLIST_CONFIG).map(item => ({
      id: item.id,
      question: item.question,
      finding: 'Pending analysis...',
      points: 0,
      justification: '',
      status: 'pending',
    }));
  };

  const updateChecklistItem = (
    prevResults: ChecklistItemResult[],
    id: ChecklistItemId,
    updates: Partial<ChecklistItemResult>
  ): ChecklistItemResult[] => {
    return prevResults.map(item => (item.id === id ? { ...item, ...updates, status: 'completed' } : item));
  };
  
  const calculateTotalScore = (results: ChecklistItemResult[]): number => {
    return results.reduce((sum, item) => sum + item.points, 0);
  };

  const handleAnalyze = useCallback(async (domain: string) => {
    if (apiKeyMissing) {
      setError("Cannot analyze: Gemini API Key is missing.");
      return;
    }
    if (!domain.trim()) {
      setError("Please enter a vendor domain.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setVendorDomain(domain);

    let currentResults = initializeChecklist();
    let currentTotalScore = 0;
    let isDisqualified = false;
    let summaryMessage = '';

    try {
      // 1. Domain Presence (Critical Check)
      let result = await analyzeDomainPresence(domain);
      currentResults = updateChecklistItem(currentResults, ChecklistItemId.DOMAIN_PRESENCE, result);
      if (result.points < 0) { // Disqualification
        isDisqualified = true;
        currentTotalScore = result.points;
        summaryMessage = "Vendor does not meet basic criteria (domain presence). Risk assessment terminated. FAILED.";
      } else {
         // If not disqualified, proceed with other checks
        result = await analyzeDmarc(domain);
        currentResults = updateChecklistItem(currentResults, ChecklistItemId.DMARC, result);

        result = await analyzeWebsiteSecurity(domain);
        currentResults = updateChecklistItem(currentResults, ChecklistItemId.WEBSITE_SECURITY, result);

        result = await analyzeGrcPolicies(domain);
        currentResults = updateChecklistItem(currentResults, ChecklistItemId.GRC_POLICIES, result);
        
        result = await analyzeBreaches(domain);
        currentResults = updateChecklistItem(currentResults, ChecklistItemId.BREACHES, result);

        result = await analyzeLitigation(domain);
        currentResults = updateChecklistItem(currentResults, ChecklistItemId.LITIGATION, result);

        result = await analyzeOnlineReviews(domain);
        currentResults = updateChecklistItem(currentResults, ChecklistItemId.ONLINE_REVIEWS, result);

        result = await analyzeYearsInBusiness(domain);
        currentResults = updateChecklistItem(currentResults, ChecklistItemId.YEARS_IN_BUSINESS, result);

        result = await analyzeVulnerabilities(domain);
        currentResults = updateChecklistItem(currentResults, ChecklistItemId.VULNERABILITIES, result);
        
        currentTotalScore = calculateTotalScore(currentResults.filter(item => item.id !== ChecklistItemId.DOMAIN_PRESENCE)); // Exclude domain presence from sum if passed
      }


      if (!isDisqualified) {
        const percentageScore = MAX_POSSIBLE_SCORE_POST_QUALIFICATION > 0 ? (currentTotalScore / MAX_POSSIBLE_SCORE_POST_QUALIFICATION) * 100 : 0;
        if (percentageScore >= PASS_THRESHOLD_PERCENTAGE) {
          summaryMessage = `Vendor PASSES with ${currentTotalScore} points (${percentageScore.toFixed(1)}%). Strengths observed in DMARC, security posture, and GRC. Continuous monitoring advised.`;
        } else {
          summaryMessage = `Vendor FAILS with ${currentTotalScore} points (${percentageScore.toFixed(1)}%). Shortcomings identified in areas such as ${currentResults.filter(r => r.points < 0 && r.id !== ChecklistItemId.DOMAIN_PRESENCE).map(r => r.question.split(' - ')[0]).join(', ') || 'various criteria'}. Further investigation needed.`;
        }
      }
      
      setRiskProfile({
        domain,
        checklistResults: currentResults,
        totalScore: currentTotalScore,
        summary: summaryMessage,
        isDisqualified,
      });

    } catch (e: any) {
      console.error("Analysis failed:", e);
      setError(`Analysis failed: ${e.message || 'An unknown error occurred.'}`);
      // Set all pending items to error
      const errorResults: ChecklistItemResult[] = currentResults.map(
        (item: ChecklistItemResult): ChecklistItemResult => {
          if (item.status === 'pending') {
            return { 
              ...item, 
              status: 'error', // Explicitly 'error' literal type, part of ChecklistItemResult['status']
              finding: 'Error during analysis' 
            };
          }
          return item;
        }
      );
      setRiskProfile({
        domain,
        checklistResults: errorResults,
        totalScore: calculateTotalScore(errorResults.filter(item => item.id !== ChecklistItemId.DOMAIN_PRESENCE && !isDisqualified)),
        summary: 'Analysis could not be completed due to an error.',
        isDisqualified,
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiKeyMissing]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-4xl mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
          Third-Party Digital Risk Analyzer
        </h1>
        <p className="mt-2 text-slate-400">
          AI-powered insights into vendor digital footprints. (Simulated Analysis)
        </p>
         {apiKeyMissing && (
          <p className="mt-4 text-sm text-amber-400 bg-amber-900 bg-opacity-50 p-3 rounded-md border border-amber-700">
            <strong>Warning:</strong> The Gemini API Key (API_KEY environment variable) is not detected. Analysis functionality will be disabled. Please ensure it's correctly configured in your environment.
          </p>
        )}
      </header>

      <main className="w-full max-w-4xl bg-slate-800 shadow-2xl rounded-lg p-6 md:p-8">
        <VendorInput onAnalyze={handleAnalyze} isLoading={isLoading} disabled={apiKeyMissing} />

        {isLoading && <LoadingSpinner />}
        
        {error && !isLoading && (
          <div className="mt-6 p-4 bg-red-800 bg-opacity-50 text-red-300 border border-red-700 rounded-md">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {riskProfile && !isLoading && (
          <div className="mt-8 space-y-6">
            <RiskSummaryDisplay profile={riskProfile} />
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-sky-400">Detailed Checklist:</h3>
              <div className="space-y-4">
                {riskProfile.checklistResults.map((item) => (
                  <ChecklistItemDisplay key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} AI Risk Insights. For demonstration purposes only.</p>
        <p>Ensure API_KEY environment variable is set for Gemini API access.</p>
      </footer>
    </div>
  );
};

export default App;