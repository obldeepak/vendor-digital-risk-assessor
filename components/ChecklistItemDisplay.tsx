
import React from 'react';
import { type ChecklistItemResult } from '../types';
import { CheckCircleIcon, XCircleIcon, MinusCircleIcon, InformationCircleIcon, ClockIcon } from '@heroicons/react/24/solid'; // Using Heroicons for better UI

// Helper to get icon and color based on points and status
const getStatusVisuals = (points: number, status: ChecklistItemResult['status']) => {
  if (status === 'pending') return { icon: <ClockIcon className="h-6 w-6 text-slate-500" />, color: 'text-slate-400', bgColor: 'bg-slate-700' };
  if (status === 'error') return { icon: <XCircleIcon className="h-6 w-6 text-red-400" />, color: 'text-red-400', bgColor: 'bg-red-900 bg-opacity-30' };
  if (status === 'skipped') return { icon: <InformationCircleIcon className="h-6 w-6 text-slate-500" />, color: 'text-slate-500', bgColor: 'bg-slate-700' };
  
  if (points > 0) return { icon: <CheckCircleIcon className="h-6 w-6 text-green-400" />, color: 'text-green-400', bgColor: 'bg-green-900 bg-opacity-30' };
  if (points < 0) return { icon: <XCircleIcon className="h-6 w-6 text-red-400" />, color: 'text-red-400', bgColor: 'bg-red-900 bg-opacity-30' };
  return { icon: <MinusCircleIcon className="h-6 w-6 text-slate-500" />, color: 'text-slate-400', bgColor: 'bg-slate-700' }; // Neutral or 0 points
};


export const ChecklistItemDisplay: React.FC<{ item: ChecklistItemResult }> = ({ item }) => {
  const { icon, color, bgColor } = getStatusVisuals(item.points, item.status);

  return (
    <div className={`p-5 rounded-lg shadow-lg border border-slate-700 ${bgColor} transition-all duration-300 ease-in-out`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className={`text-lg font-semibold ${color}`}>{item.question}</h4>
          <p className="text-sm text-slate-300 mt-1 italic">Finding: {item.finding}</p>
           {item.justification && item.justification !== item.finding && (
            <p className="text-xs text-slate-400 mt-1">Justification: {item.justification}</p>
          )}
        </div>
        <div className="flex flex-col items-end ml-4">
          <div className={`text-2xl font-bold ${color}`}>{item.points > 0 ? `+${item.points}` : item.points} pts</div>
          <div className="mt-1">{icon}</div>
        </div>
      </div>
      {item.status === 'pending' && <div className="mt-2 h-1 w-full bg-slate-600 rounded animate-pulse"></div>}
    </div>
  );
};