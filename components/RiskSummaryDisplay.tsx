
import React from 'react';
import { type VendorRiskProfile } from '../types';
import { MAX_POSSIBLE_SCORE_POST_QUALIFICATION, PASS_THRESHOLD_PERCENTAGE } from '../constants';

interface RiskSummaryDisplayProps {
  profile: VendorRiskProfile;
}

export const RiskSummaryDisplay: React.FC<RiskSummaryDisplayProps> = ({ profile }) => {
  const { totalScore, summary, domain, isDisqualified } = profile;

  let percentageScore = 0;
  if (!isDisqualified && MAX_POSSIBLE_SCORE_POST_QUALIFICATION > 0) {
    percentageScore = (totalScore / MAX_POSSIBLE_SCORE_POST_QUALIFICATION) * 100;
  } else if (isDisqualified) {
    percentageScore = 0; // Or some indicator of disqualification
  }
  
  const isPass = !isDisqualified && percentageScore >= PASS_THRESHOLD_PERCENTAGE;

  const scoreColor = isDisqualified ? 'text-red-400' : isPass ? 'text-green-400' : 'text-red-400';
  const summaryBgColor = isDisqualified ? 'bg-red-900 bg-opacity-40 border-red-700' : isPass ? 'bg-green-900 bg-opacity-40 border-green-700' : 'bg-red-900 bg-opacity-40 border-red-700';

  return (
    <div className={`p-6 rounded-lg shadow-xl border ${summaryBgColor}`}>
      <h2 className="text-2xl font-bold text-center text-slate-100 mb-1">
        Risk Assessment for: <span className="text-sky-400">{domain}</span>
      </h2>
      
      {isDisqualified ? (
        <div className="text-center my-4">
          <p className={`text-5xl font-extrabold ${scoreColor}`}>DISQUALIFIED</p>
          <p className="text-lg text-slate-300 mt-1">Score: {totalScore} points</p>
        </div>
      ) : (
        <div className="text-center my-4">
          <p className={`text-5xl font-extrabold ${scoreColor}`}>{totalScore} <span className="text-3xl">pts</span></p>
          <p className={`text-xl font-semibold ${scoreColor}`}>({percentageScore.toFixed(1)}%)</p>
          <p className={`text-2xl mt-2 font-bold ${isPass ? 'text-green-400' : 'text-red-400'}`}>
            {isPass ? 'Overall Result: PASS' : 'Overall Result: FAIL'}
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-700">
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Summary:</h3>
        <p className="text-slate-300 whitespace-pre-wrap">{summary}</p>
      </div>
    </div>
  );
};