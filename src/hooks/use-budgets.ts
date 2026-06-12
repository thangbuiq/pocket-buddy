"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Budget } from "@/types";
import type { BudgetInput } from "@/lib/validations/budgets";

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: async () => (await fetch("/api/budgets")).json() as Promise<Budget[]>,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BudgetInput) => {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create budget");
      return (await res.json()) as Budget;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });
}
