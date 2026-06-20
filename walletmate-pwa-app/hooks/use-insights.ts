"use client";

import { useQuery } from "@tanstack/react-query";
import { analyzeTransactions } from "@/lib/api";
import { buildRecurringHistory } from "@/lib/transaction-helpers";
import type { Transaction } from "@/types";

export function useInsights({
  transactions,
  language,
  periodDays = 30,
}: {
  transactions: Transaction[];
  language: "vi" | "en";
  periodDays?: number;
}) {
  return useQuery({
    queryKey: ["insights", language, periodDays, transactions.length],
    queryFn: async () => {
      const history = buildRecurringHistory(transactions);
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactions: history,
          language,
          period_days: periodDays,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to fetch insights");
      }
      return res.json();
    },
    enabled: transactions.length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
