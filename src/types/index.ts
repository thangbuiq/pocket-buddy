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
