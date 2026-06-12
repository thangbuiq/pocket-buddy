"use client";

import { useState } from "react";
import { BudgetMeter } from "@/components/shared/BudgetMeter";
import { useBudgets, useCreateBudget } from "@/hooks/use-budgets";
import { useTransactions } from "@/hooks/use-transactions";

export default function BudgetsPage() {
  const { data = [] } = useBudgets();
  const { data: transactions = [] } = useTransactions();
  const createBudget = useCreateBudget();
  const [category, setCategory] = useState("Food");
  const [limitAmount, setLimitAmount] = useState(500);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Budgets</h1>
      <form
        className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          createBudget.mutate({
            category,
            limitAmount,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          });
        }}
      >
        <input className="min-h-11 rounded-lg bg-slate-900 px-3" value={category} onChange={(event) => setCategory(event.target.value)} />
        <input className="min-h-11 rounded-lg bg-slate-900 px-3" type="number" value={limitAmount} onChange={(event) => setLimitAmount(Number(event.target.value))} />
        <button className="min-h-11 rounded-lg bg-indigo-600 px-4 font-medium">Save Budget</button>
      </form>
      <div className="grid gap-3">
        {data.map((budget) => (
          <BudgetMeter
            key={budget.id}
            category={budget.category}
            used={transactions
              .filter((transaction) => transaction.type === "expense" && transaction.category === budget.category)
              .reduce((sum, transaction) => sum + transaction.amount, 0)}
            limit={budget.limitAmount}
          />
        ))}
      </div>
    </div>
  );
}
