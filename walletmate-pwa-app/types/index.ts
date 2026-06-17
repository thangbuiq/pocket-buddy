export type TransactionType = "income" | "expense";
export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";
export type SyncStatus = "synced" | "pending";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  transactionDate: string;
  recurring: boolean;
  recurringFreq?: RecurringFrequency;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limitAmount: number;
  month: number;
  year: number;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  status: "active" | "completed" | "abandoned";
  createdAt: string;
}

export interface Insight {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "success";
  dismissed: boolean;
  createdAt: string;
}

export interface HistoricalTransaction {
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  transactionDate: string;
}

export interface CandidateTransaction {
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  transactionDate: string;
}

export interface RecurringSuggestion {
  recurring: boolean;
  recurringFreq?: RecurringFrequency;
  confidence: "high" | "medium" | "low";
  reason: string;
}

export interface SpendingStreak {
  currentStreak: number;
  longestStreak: number;
  lastTransactionDate?: string;
}

export interface AnalyzeRequest {
  transactions: HistoricalTransaction[];
  language: "vi" | "en";
  period_days?: number;
}

export type InsightType =
  | "trend"
  | "anomaly"
  | "savings"
  | "recurring"
  | "budget";
export type InsightSeverity = "info" | "warning" | "success";

export interface AnalyzeInsight {
  type: InsightType;
  title: string;
  description: string;
  severity: InsightSeverity;
  category?: string;
  amount_impact?: number;
}

export interface AnalyzeResponse {
  insights: AnalyzeInsight[];
}
