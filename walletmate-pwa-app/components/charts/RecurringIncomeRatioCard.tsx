"use client";

import { Repeat } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { formatMaskedCurrency } from "@/lib/privacy";

export function RecurringIncomeRatioCard({
  monthlyIncome,
  monthlyRecurringExpense,
  currency = "VND",
  hideIncomeAmounts = false,
}: {
  monthlyIncome: number;
  monthlyRecurringExpense: number;
  currency?: string;
  hideIncomeAmounts?: boolean;
}) {
  const { t } = useI18n();
  const ratio =
    monthlyIncome > 0
      ? Math.min((monthlyRecurringExpense / monthlyIncome) * 100, 999)
      : 0;
  const barRatio = Math.min(ratio, 100);

  return (
    <article className="card-shadow flex h-80 flex-col justify-between rounded-[4px] border border-border bg-card p-4 sm:h-96 sm:p-5">
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Repeat className="h-4 w-4 text-primary" />
          <h3 className="font-serif text-lg text-foreground">
            {t("fixedExpenseRatio")}
          </h3>
        </div>
        <p className="font-mono text-[2rem] leading-tight text-foreground tabular-nums">
          {hideIncomeAmounts ? "***%" : `${ratio.toFixed(0)}%`}
        </p>
        <p className="mt-2 font-sans text-sm leading-6 text-muted">
          {t("fixedExpenseRatioDescription")}
        </p>
      </div>

      <div className="space-y-4">
        <div className="h-2 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${barRatio}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[3px] border border-border bg-background p-3">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted">
              {t("monthlyIncome")}
            </p>
            <p className="mt-1 font-mono text-sm text-success [overflow-wrap:anywhere]">
              {hideIncomeAmounts
                ? formatMaskedCurrency(currency)
                : formatCurrency(monthlyIncome, currency)}
            </p>
          </div>
          <div className="rounded-[3px] border border-border bg-background p-3">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted">
              {t("fixedExpenses")}
            </p>
            <p className="mt-1 font-mono text-sm text-destructive [overflow-wrap:anywhere]">
              {formatCurrency(monthlyRecurringExpense, currency)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
