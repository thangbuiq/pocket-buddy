"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
      toast.success("Insights refreshed", {
        description: "Your latest spending analysis is ready.",
      });
    },
    onError: (error) => {
      console.error("[useInsights] Regenerate failed:", error);
      toast.error("Could not refresh insights", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  return {
    ...query,
    regenerate: regenerateMutation.mutate,
    isRegenerating: regenerateMutation.isPending,
    regenerateError: regenerateMutation.error,
  };
}
