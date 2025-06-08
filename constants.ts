
import { type ChecklistItemConfig } from './types';

export enum ChecklistItemId {
  DOMAIN_PRESENCE = 'domain_presence',
  DMARC = 'dmarc',
  WEBSITE_SECURITY = 'website_security',
  GRC_POLICIES = 'grc_policies',
  BREACHES = 'breaches',
  LITIGATION = 'litigation',
  ONLINE_REVIEWS = 'online_reviews',
  YEARS_IN_BUSINESS = 'years_in_business',
  VULNERABILITIES = 'vulnerabilities',
}

export const CHECKLIST_CONFIG: Record<ChecklistItemId, ChecklistItemConfig> = {
  [ChecklistItemId.DOMAIN_PRESENCE]: {
    id: ChecklistItemId.DOMAIN_PRESENCE,
    question: "Own Domain, Email & Website Presence",
    description: "Does the vendor have their own domain, email system, and a functional website? (Critical)"
  },
  [ChecklistItemId.DMARC]: {
    id: ChecklistItemId.DMARC,
    question: "DMARC Compliance (p=reject)",
    description: "Does the vendor's email domain fully comply with DMARC with a 'reject' policy?"
  },
  [ChecklistItemId.WEBSITE_SECURITY]: {
    id: ChecklistItemId.WEBSITE_SECURITY,
    question: "Reasonable Website Security",
    description: "Is the vendor's website reasonably secure (e.g., HTTPS, no obvious major flaws)?"
  },
  [ChecklistItemId.GRC_POLICIES]: {
    id: ChecklistItemId.GRC_POLICIES,
    question: "Declared Policies & GRC Status",
    description: "Does the website declare GRC status (ISO 27001, SOC, Privacy Policy, InfoSec Policy) in a dedicated section?"
  },
  [ChecklistItemId.BREACHES]: {
    id: ChecklistItemId.BREACHES,
    question: "History of Cyber/Privacy Breaches",
    description: "Are there publicly reported cybersecurity or privacy breaches associated with the vendor?"
  },
  [ChecklistItemId.LITIGATION]: {
    id: ChecklistItemId.LITIGATION,
    question: "History of Significant Litigation",
    description: "Does the vendor have a history of more than two significant litigation cases?"
  },
  [ChecklistItemId.ONLINE_REVIEWS]: {
    id: ChecklistItemId.ONLINE_REVIEWS,
    question: "Online Comments/Reviews Sentiment",
    description: "What is the general sentiment of online reviews about the organization?"
  },
  [ChecklistItemId.YEARS_IN_BUSINESS]: {
    id: ChecklistItemId.YEARS_IN_BUSINESS,
    question: "Years in Business",
    description: "Has the organization been in business for more than 5 years?"
  },
  [ChecklistItemId.VULNERABILITIES]: {
    id: ChecklistItemId.VULNERABILITIES,
    question: "Identified Vulnerabilities (Online Scan)",
    description: "Does a simulated online scan identify any serious or critical vulnerabilities in owned assets?"
  },
};

export const GEMINI_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

export const MAX_POSSIBLE_SCORE_POST_QUALIFICATION = 39; // 10 (DMARC) + 5 (Sec) + 10 (GRC) + 3 (Reviews) + 1 (Years) + 10 (No Vulns)
export const PASS_THRESHOLD_PERCENTAGE = 60;