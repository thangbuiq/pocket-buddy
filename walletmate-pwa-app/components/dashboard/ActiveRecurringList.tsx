"use client";

import { useState } from "react";
import { Repeat, Calendar, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { isActiveRecurring } from "@/lib/transaction-helpers";
import type { Transaction, RecurringFrequency } from "@/types";

const FREQUENCY_DAYS: Record<RecurringFrequency, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  yearly: 365,
};

function countRecurrencesLeft(
  freq: RecurringFrequency,
  endDate: string,
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate + "T00:00:00");
  const daysLeft = Math.max(
    0,
    Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
  );
  return Math.max(0, Math.floor(daysLeft / FREQUENCY_DAYS[freq]));
}

export function ActiveRecurringList({
  transactions,
  currency = "VND",
  onSetEndDate,
  onCancelRecurring,
}: {
  transactions: Transaction[];
  currency?: string;
  onSetEndDate: (id: string, endDate: string) => void;
  onCancelRecurring: (transaction: Transaction) => void;
}) {
  const { t } = useI18n();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dateValue, setDateValue] = useState("");

  const activeRecurring = transactions.filter(isActiveRecurring);

  if (activeRecurring.length === 0) {
    return (
      <div className="rounded-[4px] border border-border bg-card p-6">
        <p className="font-sans text-sm text-muted">{t("noTransactions")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeRecurring.map((txn) => {
        const isEditing = editingId === txn.id;
        const hasEnd = Boolean(txn.recurringEndDate);
        const recurrencesLeft =
          hasEnd && txn.recurringFreq
            ? countRecurrencesLeft(txn.recurringFreq, txn.recurringEndDate!)
            : null;

        return (
          <article
            key={txn.id}
            className="rounded-[4px] border border-border bg-card p-4 transition-colors hover:border-muted"
          >
            <div className="flex items-start justify-between gap-3">
              {/* Left: info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Repeat className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <h4 className="truncate font-sans text-[0.9rem] font-medium text-foreground">
                    {txn.description || txn.category}
                  </h4>
                  <span className="shrink-0 rounded-[3px] border border-primary/30 bg-primary/5 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.08em] text-primary">
                    {t(
                      `recurring${
                        txn.recurringFreq!.charAt(0).toUpperCase() +
                        txn.recurringFreq!.slice(1)
                      }` as TranslationKey,
                    )}
                  </span>
                </div>

                <p className="mt-1 font-mono text-xs text-muted">
                  {txn.category} · {txn.transactionDate}
                </p>

                {/* End date note */}
                {hasEnd && recurrencesLeft !== null && (
                  <p className="mt-1.5 font-sans text-xs text-muted italic">
                    {t("recurringUntil")} {txn.recurringEndDate}
                    <span className="ml-1 text-foreground font-medium not-italic">
                      · {recurrencesLeft}{" "}
                      {recurrencesLeft === 1
                        ? (t("recurringLeft") as string)
                        : (t("recurringLeftPlural") as string)}
                    </span>
                  </p>
                )}
              </div>

              {/* Right: amount + actions */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[0.9rem] font-medium text-destructive">
                  -{formatCurrency(txn.amount, currency)}
                </span>

                {/* Set end date */}
                <button
                  type="button"
                  onClick={() => {
                    if (isEditing) {
                      setEditingId(null);
                    } else {
                      setEditingId(txn.id);
                      setDateValue(txn.recurringEndDate ?? "");
                    }
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-[3px] border border-border text-muted transition-colors hover:border-primary hover:text-primary cursor-pointer"
                  aria-label="Set end date"
                  title={t("recurringEndDate")}
                >
                  <Calendar className="h-3.5 w-3.5" />
                </button>

                {/* Cancel recurring */}
                <button
                  type="button"
                  onClick={() => onCancelRecurring(txn)}
                  className="flex h-7 w-7 items-center justify-center rounded-[3px] border border-border text-muted transition-colors hover:border-destructive hover:text-destructive cursor-pointer"
                  aria-label={t("recurringCancel")}
                  title={t("recurringCancel")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Inline end-date picker */}
            {isEditing && (
              <div className="mt-3 flex items-center gap-2 rounded-[3px] border border-primary/20 bg-primary/5 p-3">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
                <input
                  type="date"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="flex-1 bg-transparent font-mono text-sm text-foreground focus:outline-none"
                />
                <button
                  type="button"
                  disabled={!dateValue}
                  onClick={() => {
                    onSetEndDate(txn.id, dateValue);
                    setEditingId(null);
                  }}
                  className="rounded-[3px] bg-primary px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50 cursor-pointer"
                >
                  {t("apply")}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-[3px] border border-border px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-muted transition-colors hover:text-foreground cursor-pointer"
                >
                  {t("cancel")}
                </button>

                {/* Preview recurrences left */}
                {dateValue && txn.recurringFreq && (
                  <span className="ml-auto font-sans text-xs text-muted italic">
                    {countRecurrencesLeft(txn.recurringFreq, dateValue)}{" "}
                    {t("recurringLeftPlural")}
                  </span>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
