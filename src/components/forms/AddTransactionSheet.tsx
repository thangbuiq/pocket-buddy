"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  transactionSchema,
  type TransactionInput,
} from "@/lib/validations/transactions";

export function AddTransactionSheet({
  onSubmit,
}: {
  onSubmit: (data: TransactionInput) => Promise<void> | void;
}) {
  const { register, handleSubmit, formState, reset } =
    useForm<TransactionInput>({
      resolver: zodResolver(transactionSchema),
      defaultValues: {
        type: "expense",
        category: "Ăn uống",
        amount: 0,
        transactionDate: new Date().toISOString().slice(0, 10),
        recurring: false,
        syncStatus: "synced",
      },
    });

  return (
    <form
      className="grid gap-3 rounded-[4px] border border-border bg-card p-6"
      onSubmit={handleSubmit(async (data) => {
        await onSubmit(data);
        reset();
      })}
    >
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-primary">
        New Transaction
      </span>
      <h3 className="font-serif text-[1.25rem] text-foreground">Quick Add</h3>

      <select
        {...register("type")}
        className="min-h-11 rounded-[3px] border border-border bg-background px-3.5 font-sans text-[0.9rem] text-foreground focus:border-primary focus:outline-none"
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <input
        {...register("amount", { valueAsNumber: true })}
        type="number"
        step="0.01"
        placeholder="Amount"
        className="min-h-11 rounded-[3px] border border-border bg-background px-3.5 font-sans text-[0.9rem] text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
      />

      <select
        {...register("category")}
        className="min-h-11 rounded-[3px] border border-border bg-background px-3.5 font-sans text-[0.9rem] text-foreground focus:border-primary focus:outline-none"
      >
        <option value="Ăn uống">Ăn uống</option>
        <option value="Di chuyển">Di chuyển</option>
        <option value="Mua sắm">Mua sắm</option>
        <option value="Giải trí">Giải trí</option>
        <option value="Hóa đơn">Hóa đơn</option>
        <option value="Sức khỏe">Sức khỏe</option>
        <option value="Học tập">Học tập</option>
        <option value="Lương">Lương</option>
        <option value="Khác">Khác</option>
      </select>

      <input
        {...register("description")}
        placeholder="Description"
        className="min-h-11 rounded-[3px] border border-border bg-background px-3.5 font-sans text-[0.9rem] text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
      />

      <input
        {...register("transactionDate")}
        type="date"
        className="min-h-11 rounded-[3px] border border-border bg-background px-3.5 font-sans text-[0.9rem] text-foreground focus:border-primary focus:outline-none"
      />

      <button
        disabled={formState.isSubmitting}
        className="min-h-11 rounded-[3px] bg-primary px-4 font-mono text-[0.8rem] uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50 cursor-pointer"
        type="submit"
      >
        {formState.isSubmitting ? "Saving..." : "Add Transaction"}
      </button>
    </form>
  );
}
