
import { generateText } from './geminiService';
import { type ChecklistItemResult } from '../types';
import { ChecklistItemId } from '../constants';

const createResult = (id: ChecklistItemId, question: string, finding: string, points: number, justification: string): ChecklistItemResult => ({
  id,
  question,
  finding,
  points,
  justification,
  status: 'completed',
});

const createErrorResult = (id: ChecklistItemId, question: string, errorMsg: string): ChecklistItemResult => ({
  id,
  question,
  finding: 'Error in analysis',
  points: 0,
  justification: errorMsg,
  status: 'error',
});

export const analyzeDomainPresence = async (domain: string): Promise<ChecklistItemResult> => {
  const question = "Own Domain, Email & Website Presence";
  const prompt = `Based on public information, does '${domain}' appear to be a legitimate, active company domain with an associated website and likely email system? Respond with only 'Yes' or 'No'.`;
  const res = await generateText(prompt);
  if (res.error) return createErrorResult(ChecklistItemId.DOMAIN_PRESENCE, question, res.error);

  const finding = res.text.trim().toLowerCase();
  if (finding.includes('yes')) {
    return createResult(ChecklistItemId.DOMAIN_PRESENCE, question, "Vendor appears to have own domain, email, and website.", 0, "Base requirement met. Analysis continues.");
  }
  return createResult(ChecklistItemId.DOMAIN_PRESENCE, question, "Vendor does NOT appear to have own domain, email, or website.", -10, "Critical failure. Risk assessment terminated.");
};

export const analyzeDmarc = async (domain: string): Promise<ChecklistItemResult> => {
  const question = "DMARC Compliance (p=reject)";
  const prompt = `What is the DMARC policy (p=) for the domain '${domain}'? Check common DNS records. Respond with 'reject', 'quarantine', 'none', or 'unknown'.`;
  const res = await generateText(prompt);
  if (res.error) return createErrorResult(ChecklistItemId.DMARC, question, res.error);
  
  const finding = res.text.trim().toLowerCase();
  if (finding.includes('reject')) {
    return createResult(ChecklistItemId.DMARC, question, `DMARC policy is p=reject.`, 10, "Full DMARC compliance with reject policy enhances email security.");
  }
  return createResult(ChecklistItemId.DMARC, question, `DMARC policy is '${finding}' (not p=reject).`, -10, "DMARC policy is not 'reject', indicating potential email spoofing risks.");
};

export const analyzeWebsiteSecurity = async (domain: string): Promise<ChecklistItemResult> => {
  const question = "Reasonable Website Security";
  const prompt = `Briefly assess the general website security of 'https://${domain}'. Does it robustly use HTTPS? Are there any obvious, easily identifiable major security issues from a quick public check (e.g., mixed content, very outdated ciphers, certificate errors, no HSTS)? Respond with 'Secure', 'Moderately Secure', or 'Insecure', followed by a brief justification.`;
  const res = await generateText(prompt);
  if (res.error) return createErrorResult(ChecklistItemId.WEBSITE_SECURITY, question, res.error);

  const findingText = res.text.trim().toLowerCase();
  const justification = res.text.trim();
  if (findingText.startsWith('insecure')) {
    return createResult(ChecklistItemId.WEBSITE_SECURITY, question, "Website appears insecure.", -10, justification);
  }
  if (findingText.startsWith('secure') || findingText.startsWith('moderately secure')) {
    return createResult(ChecklistItemId.WEBSITE_SECURITY, question, "Website appears reasonably secure.", 5, justification);
  }
  return createResult(ChecklistItemId.WEBSITE_SECURITY, question, "Could not definitively assess website security.", 0, justification);
};

export const analyzeGrcPolicies = async (domain: string): Promise<ChecklistItemResult> => {
  const question = "Declared Policies & GRC Status";
  const policies = ["ISO 27001 certification", "SOC attestations", "a comprehensive Privacy Policy", "an Information Security Policy"];
  const prompt = `Does the website for '${domain}' visibly declare or have dedicated, easily findable sections for any of the following: ${policies.join(', ')}? List which of these four categories are clearly present and seem substantial. Respond with a comma-separated list of found items (e.g., 'ISO 27001 certification, Privacy Policy') or 'None found'.`;
  const res = await generateText(prompt);
  if (res.error) return createErrorResult(ChecklistItemId.GRC_POLICIES, question, res.error);

  const findingText = res.text.trim().toLowerCase();
  let points = 0;
  let foundPolicies: string[] = [];

  if (!findingText.includes('none found')) {
    policies.forEach(policy => {
      if (findingText.includes(policy.toLowerCase().replace("a comprehensive ", "").replace(" certification", "").replace(" attestations",""))) { // simplified matching
        points += 2.5;
        foundPolicies.push(policy.replace("a comprehensive ", ""));
      }
    });
  }
  points = Math.min(points, 10); // Cap at 10
  const finding = foundPolicies.length > 0 ? `Found: ${foundPolicies.join(', ')}.` : "No clear GRC policies found or declared prominently.";
  return createResult(ChecklistItemId.GRC_POLICIES, question, finding, points, `Awarded ${points} points for declared GRC policies. ${res.text.trim()}`);
};

export const analyzeBreaches = async (domain: string): Promise<ChecklistItemResult> => {
  const question = "History of Cyber/Privacy Breaches";
  const prompt = `Based on publicly available information, how many distinct major publicly reported cybersecurity or privacy breaches are associated with the company operating '${domain}' in the last 5-7 years? Respond with a number (0, 1, 2, 3, etc.) and a brief summary if any are found.`;
  const res = await generateText(prompt);
  if (res.error) return createErrorResult(ChecklistItemId.BREACHES, question, res.error);

  const findingText = res.text.trim();
  const match = findingText.match(/\d+/); // Find the first number
  let breachCount = 0;
  if (match) {
    breachCount = parseInt(match[0], 10);
  }

  let points = 0;
  let justification = `Gemini's assessment: ${findingText}`;
  if (breachCount === 0) {
    points = 0;
    justification = `No major breaches reported. ${justification}`;
  } else if (breachCount === 1) {
    points = -5;
     justification = `One major breach reported. ${justification}`;
  } else { // >= 2 breaches
    points = -10;
     justification = `${breachCount} major breaches reported. ${justification}`;
  }
  return createResult(ChecklistItemId.BREACHES, question, `${breachCount} major breach(es) found.`, points, justification);
};

export const analyzeLitigation = async (domain: string): Promise<ChecklistItemResult> => {
  const question = "History of Significant Litigation";
  const prompt = `Is there a significant public record of more than two major litigation cases (e.g., class-action lawsuits related to business practices, data privacy, major contract disputes, regulatory fines) against the company operating '${domain}' in recent years (last 5-7 years)? Respond 'Yes' or 'No', and briefly state why if 'Yes'.`;
  const res = await generateText(prompt);
  if (res.error) return createErrorResult(ChecklistItemId.LITIGATION, question, res.error);

  const findingText = res.text.trim().toLowerCase();
  const justification = res.text.trim();
  if (findingText.startsWith('yes')) {
    return createResult(ChecklistItemId.LITIGATION, question, "History of significant litigation found.", -3, justification);
  }
  return createResult(ChecklistItemId.LITIGATION, question, "No significant history of >2 major litigation cases found.", 0, justification);
};

export const analyzeOnlineReviews = async (domain: string): Promise<ChecklistItemResult> => {
  const question = "Online Comments/Reviews Sentiment";
  const prompt = `What is the general public sentiment from online comments, news articles, and reviews about the organization '${domain}'? Respond with 'Positive', 'Negative', 'Neutral', or 'Mixed', and a very brief summary.`;
  const res = await generateText(prompt);
  if (res.error) return createErrorResult(ChecklistItemId.ONLINE_REVIEWS, question, res.error);
  
  const findingText = res.text.trim().toLowerCase();
  const justification = res.text.trim();
  let points = 0;
  let finding = "Neutral/Mixed sentiment.";

  if (findingText.startsWith('positive')) {
    points = 3;
    finding = "Positive sentiment.";
  } else if (findingText.startsWith('negative')) {
    points = -2;
    finding = "Negative sentiment.";
  }
  return createResult(ChecklistItemId.ONLINE_REVIEWS, question, finding, points, justification);
};

export const analyzeYearsInBusiness = async (domain: string): Promise<ChecklistItemResult> => {
  const question = "Years in Business";
  const prompt = `Approximately how many years has the company primarily associated with the domain '${domain}' been in business or operation? Respond with a number (e.g., '15') or 'Unknown'.`;
  const res = await generateText(prompt);
  if (res.error) return createErrorResult(ChecklistItemId.YEARS_IN_BUSINESS, question, res.error);

  const findingText = res.text.trim();
  const match = findingText.match(/\d+/);
  let years = 0;
  if (match) {
    years = parseInt(match[0], 10);
  }
  
  if (years > 5) {
    return createResult(ChecklistItemId.YEARS_IN_BUSINESS, question, `In business for approx ${years} years.`, 1, `Company established for over 5 years.`);
  }
  return createResult(ChecklistItemId.YEARS_IN_BUSINESS, question, `In business for approx ${years} years (or unknown/less than 5).`, 0, `Company established for 5 years or less, or age unknown from this check.`);
};

export const analyzeVulnerabilities = async (domain: string): Promise<ChecklistItemResult> => {
  const question = "Identified Vulnerabilities (Simulated Scan)";
  const prompt = `Based on a hypothetical, non-invasive online scan of public-facing assets for '${domain}' (website, known services), are any critical or high-severity vulnerabilities commonly found (e.g., unpatched critical CVEs in exposed software, severe SSL/TLS misconfigurations, SQL injection possibilities based on URL patterns, exposed sensitive directories)? Respond 'None found', 'Minor issues found', or 'Serious/Critical vulnerabilities likely', with a brief explanation.`;
  const res = await generateText(prompt);
  if (res.error) return createErrorResult(ChecklistItemId.VULNERABILITIES, question, res.error);

  const findingText = res.text.trim().toLowerCase();
  const justification = res.text.trim();
  if (findingText.startsWith('serious/critical vulnerabilities likely') || findingText.startsWith('critical vulnerabilities likely') || findingText.startsWith('serious vulnerabilities likely')) {
    return createResult(ChecklistItemId.VULNERABILITIES, question, "Serious/Critical vulnerabilities likely.", -10, justification);
  }
  if (findingText.startsWith('none found')) {
    return createResult(ChecklistItemId.VULNERABILITIES, question, "No serious/critical vulnerabilities identified.", 10, justification);
  }
  // Includes "Minor issues found" or other neutral/unclear responses
  return createResult(ChecklistItemId.VULNERABILITIES, question, "Minor or no critical vulnerabilities identified from simulated scan.", 0, justification);
};