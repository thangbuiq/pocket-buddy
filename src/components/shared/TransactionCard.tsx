import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types";

export function TransactionCard({ transaction, currency = "USD" }: { transaction: Transaction; currency?: string }) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{transaction.category}</h4>
          <p className="text-sm text-slate-400">{transaction.description || "No description"}</p>
        </div>
        <div className={transaction.type === "expense" ? "text-red-300" : "text-emerald-300"}>
          {transaction.type === "expense" ? "-" : "+"}
          {formatCurrency(transaction.amount, currency)}
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-400">{transaction.transactionDate}</p>
    </article>
  );
}
