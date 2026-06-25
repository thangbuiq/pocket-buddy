"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Repeat, Calendar as CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

function parseDateValue(value: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

function toDateValue(date: Date) {
  return date.toISOString().slice(0, 10);
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

  const recurringCandidates = transactions.filter(
    (t) => t.recurringFreq && t.type === "expense",
  );

  // Group by recurring pattern
  const uniqueRecurringMap = new Map<string, Transaction>();
  for (const txn of recurringCandidates) {
    const key = `${txn.category}-${txn.description || ""}-${txn.amount}-${txn.recurringFreq}`;
    const existing = uniqueRecurringMap.get(key);
    if (!existing) {
      uniqueRecurringMap.set(key, txn);
    } else {
      if (new Date(txn.transactionDate) > new Date(existing.transactionDate)) {
        uniqueRecurringMap.set(key, txn);
      }
    }
  }

  const activeRecurring = Array.from(uniqueRecurringMap.values())
    .filter(isActiveRecurring)
    .sort(
      (a, b) =>
        new Date(b.transactionDate).getTime() -
        new Date(a.transactionDate).getTime(),
    );

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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              {/* Left: info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
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
                  <div className="mt-1.5 space-y-1">
                    <p className="font-sans text-xs text-muted italic">
                      {t("recurringUntil")} {txn.recurringEndDate}
                      <span className="ml-1 text-foreground font-medium not-italic">
                        · {recurrencesLeft}{" "}
                        {recurrencesLeft === 1
                          ? (t("recurringLeft") as string)
                          : (t("recurringLeftPlural") as string)}
                      </span>
                    </p>
                    <p className="font-sans text-xs leading-5 text-muted">
                      This is the end date set for the recurring transaction.
                    </p>
                  </div>
                )}
              </div>

              {/* Right: amount + actions */}
              <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
                <span className="min-w-0 font-mono text-[0.9rem] font-medium text-destructive [overflow-wrap:anywhere]">
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
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] border border-border text-muted transition-colors hover:border-primary hover:text-primary cursor-pointer"
                  aria-label="Set end date"
                  title={t("recurringEndDate")}
                >
                  <CalendarIcon className="h-4 w-4" />
                </button>

                {/* Cancel recurring */}
                <button
                  type="button"
                  onClick={() => onCancelRecurring(txn)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] border border-border text-muted transition-colors hover:border-destructive hover:text-destructive cursor-pointer"
                  aria-label={t("recurringCancel")}
                  title={t("recurringCancel")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Inline end-date picker */}
            {isEditing && (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[3px] border border-primary/20 bg-primary/5 p-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex min-h-10 min-w-56 flex-1 items-center gap-2 rounded-[3px] border border-border bg-background px-3 text-left font-sans text-sm text-foreground transition-colors hover:border-primary"
                    >
                      <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">
                        {dateValue
                          ? format(parseDateValue(dateValue)!, "LLL dd, y")
                          : t("recurringEndDate")}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-[min(calc(100vw-2rem),22rem)] p-3"
                  >
                    <Calendar
                      mode="single"
                      selected={parseDateValue(dateValue)}
                      defaultMonth={parseDateValue(dateValue)}
                      disabled={{ before: new Date() }}
                      onSelect={(date) => {
                        if (date) setDateValue(toDateValue(date));
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <p className="basis-full font-sans text-xs leading-5 text-muted">
                  This is the end date set for the recurring transaction.
                </p>
                <button
                  type="button"
                  disabled={!dateValue}
                  onClick={() => {
                    onSetEndDate(txn.id, dateValue);
                    setEditingId(null);
                  }}
                  className="min-h-10 rounded-[3px] bg-primary px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50 cursor-pointer"
                >
                  {t("apply")}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="min-h-10 rounded-[3px] border border-border px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-muted transition-colors hover:text-foreground cursor-pointer"
                >
                  {t("cancel")}
                </button>

                {/* Preview recurrences left */}
                {dateValue && txn.recurringFreq && (
                  <span className="font-sans text-xs text-muted italic sm:ml-auto">
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
