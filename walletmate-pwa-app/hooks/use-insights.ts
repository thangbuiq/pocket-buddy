"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const queryKey = ["insights", language, periodDays, transactions.length];

  const fetchInsights = async ({ regenerate = false } = {}) => {
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
        regenerate,
      }),
    });
    if (!res.ok) {
      throw new Error("Failed to fetch insights");
    }
    return res.json();
  };

  const query = useQuery({
    queryKey,
    queryFn: () => fetchInsights(),
    enabled: transactions.length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const regenerateMutation = useMutation({
    mutationFn: () => fetchInsights({ regenerate: true }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
  });

  return {
    ...query,
    regenerate: regenerateMutation.mutate,
    isRegenerating: regenerateMutation.isPending,
    regenerateError: regenerateMutation.error,
  };
}
