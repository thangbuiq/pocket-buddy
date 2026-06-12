import type { Budget, Insight, Transaction } from "@/types";

export const mockStore: {
  transactions: Transaction[];
  budgets: Budget[];
  insights: Insight[];
  aiRateLimit: Map<string, { date: string; count: number }>;
} = {
  transactions: [
    {
      id: crypto.randomUUID(),
      userId: "user_demo",
      type: "expense",
      amount: 420,
      category: "Food",
      description: "Weekly groceries",
      transactionDate: new Date().toISOString().slice(0, 10),
      recurring: false,
      syncStatus: "synced",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  budgets: [
    {
      id: crypto.randomUUID(),
      userId: "user_demo",
      category: "Food",
      limitAmount: 600,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      createdAt: new Date().toISOString(),
    },
  ],
  insights: [
    {
      id: crypto.randomUUID(),
      userId: "user_demo",
      type: "savings_opportunity",
      title: "Dining out is up 23% this month",
      description: "Cooking at home three extra days each week could save about $120 this month.",
      severity: "warning",
      dismissed: false,
      createdAt: new Date().toISOString(),
    },
  ],
  aiRateLimit: new Map(),
};
