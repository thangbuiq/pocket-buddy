import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types";

export function TransactionCard({
  transaction,
  currency = "VND",
}: {
  transaction: Transaction;
  currency?: string;
}) {
  return (
    <article className="rounded-[4px] border border-border bg-card p-4 transition-colors hover:border-muted">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-sans text-[0.9rem] font-medium text-foreground">
            {transaction.category}
          </h4>
          <p className="font-sans text-sm text-muted">
            {transaction.description || "No description"}
          </p>
        </div>
        <div
          className={`font-mono text-[0.9rem] font-medium ${
            transaction.type === "expense" ? "text-destructive" : "text-success"
          }`}
        >
          {transaction.type === "expense" ? "-" : "+"}
          {formatCurrency(transaction.amount, currency)}
        </div>
      </div>
      <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted">
        {transaction.transactionDate}
      </p>
    </article>
  );
}
