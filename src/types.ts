export type ModelType = 'gemini' | 'claude';

export interface Account {
  id: string;
  email: string;
  geminiResetDate: string | null; // ISO string or null if available
  claudeResetDate: string | null;
  geminiStartDate?: string | null;
  claudeStartDate?: string | null;
}

export interface HistoryEvent {
  id: string;
  email: string;
  model: ModelType;
  type: 'limit_reached' | 'available_again';
  timestamp: string;
}

export type SortOption = 'email' | 'next-gemini' | 'next-claude' | 'next-any';

export type WifiDuration = 1 | 3 | 5 | 7;

export interface WifiSubscription {
  id: string;
  name: string;
  durationDays: WifiDuration;
  startDate: string;
  endDate: string;
}

export interface ResourceTool {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string;
  details?: string;
  pricingModel?: string;
  loginNotes?: string;
  tags?: string[];
  createdAt?: string;
}

export interface ToolCategory {
  id: string;
  name: string;
}
