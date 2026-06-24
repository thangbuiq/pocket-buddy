import { Repeat, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { formatMaskedCurrency } from "@/lib/privacy";
import type { TranslationKey } from "@/lib/i18n";
import type { Transaction } from "@/types";

export function TransactionCard({
  transaction,
  currency = "VND",
  onCancelRecurring,
  hideIncomeAmount = false,
}: {
  transaction: Transaction;
  currency?: string;
  onCancelRecurring?: (transaction: Transaction) => void;
  hideIncomeAmount?: boolean;
}) {
  const { t } = useI18n();

  const isRecurring = transaction.recurring && transaction.recurringFreq;
  const hasEndDate = Boolean(transaction.recurringEndDate);

  return (
    <article className="rounded-[4px] border border-border bg-card p-4 transition-colors hover:border-muted sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-sans text-base font-medium text-foreground">
              {transaction.category}
            </h4>
            {isRecurring && (
              <span className="inline-flex items-center gap-1 rounded-[3px] border border-primary/30 bg-primary/5 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-primary">
                <Repeat className="h-3 w-3" />
                {t(
                  `recurring${
                    transaction.recurringFreq!.charAt(0).toUpperCase() +
                    transaction.recurringFreq!.slice(1)
                  }` as TranslationKey,
                )}
              </span>
            )}
          </div>
          <p className="mt-1 font-sans text-[0.95rem] leading-6 text-muted">
            {transaction.description || "No description"}
          </p>
          {isRecurring && hasEndDate && (
            <p className="mt-1 font-sans text-xs text-muted">
              {t("recurringUntil")} {transaction.recurringEndDate}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div
            className={`font-mono text-base font-medium [overflow-wrap:anywhere] ${
              transaction.type === "expense"
                ? "text-destructive"
                : "text-success"
            }`}
          >
            {transaction.type === "expense" ? "-" : "+"}
            {transaction.type === "income" && hideIncomeAmount
              ? formatMaskedCurrency(currency)
              : formatCurrency(transaction.amount, currency)}
          </div>
          {isRecurring && onCancelRecurring && (
            <button
              type="button"
              onClick={() => onCancelRecurring(transaction)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] border border-border text-muted transition-colors hover:border-destructive hover:text-destructive cursor-pointer"
              aria-label={t("recurringCancel")}
              title={t("recurringCancel")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted">
        {transaction.transactionDate}
      </p>
    </article>
  );
}
