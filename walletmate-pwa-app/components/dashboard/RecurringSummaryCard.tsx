"use client";

import { Repeat } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import {
  getMonthlyRecurringTotal,
  isActiveRecurring,
} from "@/lib/transaction-helpers";
import type { Transaction } from "@/types";

export function RecurringSummaryCard({
  transactions,
  currency = "VND",
}: {
  transactions: Transaction[];
  currency?: string;
}) {
  const { t } = useI18n();
  const total = getMonthlyRecurringTotal(transactions);
  const activeCount = transactions.filter(isActiveRecurring).length;

  return (
    <article className="card-shadow rounded-[4px] border border-border bg-card p-5 transition-colors hover:border-muted">
      <div className="mb-3 flex items-center gap-2">
        <Repeat className="h-4 w-4 text-primary" />
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted">
          {t("recurringSummaryTitle")}
        </p>
      </div>
      <p className="font-mono text-xl font-medium text-foreground">
        {formatCurrency(total, currency)}
      </p>
      <p className="mt-2 font-sans text-xs text-muted">
        {activeCount} {t("recurringTransactions")}
      </p>
    </article>
  );
}
