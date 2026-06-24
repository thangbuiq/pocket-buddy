"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Transaction } from "@/types";
import type { TransactionInput } from "@/lib/validations/transactions";

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await fetch("/api/transactions");
      if (!res.ok) {
        throw new Error("Failed to load transactions");
      }
      return (await res.json()) as Transaction[];
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TransactionInput) => {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create transaction");
      return (await res.json()) as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction saved", {
        description: "Your transaction is now in the ledger.",
      });
    },
    onError: (error) => {
      console.error("[useCreateTransaction] Create failed:", error);
      toast.error("Could not save transaction", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete transaction");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction deleted", {
        description: "The transaction was removed from your ledger.",
      });
    },
    onError: (error) => {
      console.error("[useDeleteTransaction] Delete failed:", error);
      toast.error("Could not delete transaction", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: TransactionInput;
    }) => {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update transaction");
      return (await res.json()) as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction updated", {
        description: "Your changes have been saved.",
      });
    },
    onError: (error) => {
      console.error("[useUpdateTransaction] Update failed:", error);
      toast.error("Could not update transaction", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    },
  });
}
