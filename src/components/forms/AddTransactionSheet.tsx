"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, type TransactionInput } from "@/lib/validations/transactions";

export function AddTransactionSheet({ onSubmit }: { onSubmit: (data: TransactionInput) => Promise<void> | void }) {
  const { register, handleSubmit, formState, reset } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      category: "Food",
      amount: 0,
      transactionDate: new Date().toISOString().slice(0, 10),
      recurring: false,
      syncStatus: "synced",
    },
  });

  return (
    <form
      className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
      onSubmit={handleSubmit(async (data) => {
        await onSubmit(data);
        reset();
      })}
    >
      <h3 className="font-semibold">Quick Add Transaction</h3>
      <select {...register("type")} className="min-h-11 rounded-lg bg-slate-900 px-3">
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <input {...register("amount", { valueAsNumber: true })} type="number" step="0.01" placeholder="Amount" className="min-h-11 rounded-lg bg-slate-900 px-3" />
      <input {...register("category")} placeholder="Category" className="min-h-11 rounded-lg bg-slate-900 px-3" />
      <input {...register("description")} placeholder="Description" className="min-h-11 rounded-lg bg-slate-900 px-3" />
      <input {...register("transactionDate")} type="date" className="min-h-11 rounded-lg bg-slate-900 px-3" />
      <button disabled={formState.isSubmitting} className="min-h-11 rounded-lg bg-indigo-600 px-4 font-medium text-white hover:bg-indigo-500 disabled:opacity-50" type="submit">
        {formState.isSubmitting ? "Saving..." : "Add Transaction"}
      </button>
    </form>
  );
}
