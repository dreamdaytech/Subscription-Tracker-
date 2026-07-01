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
