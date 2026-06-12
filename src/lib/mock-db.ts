import type { Transaction } from "@/types";

export const mockStore: {
  transactions: Transaction[];
  aiRateLimit: Map<string, { date: string; count: number }>;
} = {
  transactions: [],
  aiRateLimit: new Map(),
};
