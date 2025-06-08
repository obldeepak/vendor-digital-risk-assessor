
import { ChecklistItemId } from './constants';

export interface ChecklistItemConfig {
  id: ChecklistItemId;
  question: string;
  description?: string; // Optional detailed description
}

export interface ChecklistItemResult {
  id: ChecklistItemId;
  question: string;
  finding: string; // What Gemini (or logic) determined
  points: number;
  justification: string;
  status: 'pending' | 'completed' | 'error' | 'skipped';
}

export interface VendorRiskProfile {
  domain: string;
  checklistResults: ChecklistItemResult[];
  totalScore: number;
  summary: string;
  isDisqualified: boolean;
}

// For Gemini Service responses (simplified)
export interface GeminiTextResponse {
  text: string;
  error?: string;
}