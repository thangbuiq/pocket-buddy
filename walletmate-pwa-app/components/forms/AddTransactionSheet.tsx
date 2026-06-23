"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import {
  transactionSchema,
  type TransactionInput,
} from "@/lib/validations/transactions";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";
import { useTransactions } from "@/hooks/use-transactions";
import { useSuggestRecurring } from "@/hooks/use-suggest-recurring";
import {
  buildCandidateTransaction,
  getRecentHistoryForSuggestion,
} from "@/lib/transaction-helpers";
import type { RecurringFrequency, RecurringSuggestion } from "@/types";

const RECURRING_FREQUENCIES: RecurringFrequency[] = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
];

export function AddTransactionSheet({
  onSubmit,
}: {
  onSubmit: (data: TransactionInput) => Promise<void> | void;
}) {
  const { t, language } = useI18n();
  const { data: transactions = [] } = useTransactions();
  const suggestMutation = useSuggestRecurring();

  const [suggestion, setSuggestion] = useState<RecurringSuggestion | null>(
    null,
  );
  const [showSuggestion, setShowSuggestion] = useState(false);

  const { register, handleSubmit, formState, reset, setValue, control } =
    useForm<TransactionInput>({
      resolver: zodResolver(transactionSchema),
      defaultValues: {
        type: "expense",
        category: "Ăn uống",
        amount: 0,
        transactionDate: new Date().toISOString().slice(0, 10),
        recurring: false,
        recurringFreq: "monthly",
        syncStatus: "synced",
      },
    });

  const watchedDescription = useWatch({ control, name: "description" });
  const watchedAmount = useWatch({ control, name: "amount" });
  const watchedDate = useWatch({ control, name: "transactionDate" });
  const watchedCategory = useWatch({ control, name: "category" });
  const watchedType = useWatch({ control, name: "type" });
  const watchedRecurring = useWatch({ control, name: "recurring" });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const description = watchedDescription?.trim();
    const amount = Number(watchedAmount);
    const date = watchedDate;

    if (!description || !amount || amount <= 0 || !date) {
      const timeout = setTimeout(() => {
        setSuggestion(null);
        setShowSuggestion(false);
      }, 0);
      return () => clearTimeout(timeout);
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const candidate = buildCandidateTransaction({
        type: watchedType,
        amount,
        category: watchedCategory ?? "Ăn uống",
        description,
        transactionDate: date,
      });

      const history = getRecentHistoryForSuggestion(transactions, date);

      suggestMutation.mutate(
        { candidate, history, language },
        {
          onSuccess: (data) => {
            setSuggestion(data);
            setShowSuggestion(data.recurring && data.confidence !== "low");
          },
        },
      );
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watchedDescription,
    watchedAmount,
    watchedDate,
    watchedCategory,
    watchedType,
    language,
  ]);

  const applySuggestion = () => {
    if (suggestion?.recurring && suggestion.recurringFreq) {
      setValue("recurring", true);
      setValue("recurringFreq", suggestion.recurringFreq);
      setShowSuggestion(false);
    }
  };

  const dismissSuggestion = () => {
    setShowSuggestion(false);
  };

  return (
    <form
      className="grid gap-4 rounded-[4px] border border-border bg-card p-4 sm:p-6"
      onSubmit={handleSubmit(async (data) => {
        await onSubmit(data);
        reset();
        setSuggestion(null);
        setShowSuggestion(false);
      })}
    >
      <span className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-primary">
        New Transaction
      </span>
      <h3 className="font-serif text-[1.7rem] leading-tight text-foreground sm:text-[2rem]">
        <span className="serif-accent">Manual</span> Input
      </h3>

      <select
        {...register("type")}
        className="min-h-14 rounded-[3px] border border-border bg-background px-4 font-sans text-base text-foreground focus:border-primary focus:outline-none"
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <input
        {...register("amount", { valueAsNumber: true })}
        type="number"
        step="0.01"
        placeholder="Amount"
        className="min-h-14 rounded-[3px] border border-border bg-background px-4 font-sans text-base text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
      />

      <select
        {...register("category")}
        className="min-h-14 rounded-[3px] border border-border bg-background px-4 font-sans text-base text-foreground focus:border-primary focus:outline-none"
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
        className="min-h-14 rounded-[3px] border border-border bg-background px-4 font-sans text-base text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
      />

      <input
        {...register("transactionDate")}
        type="date"
        className="min-h-14 rounded-[3px] border border-border bg-background px-4 font-sans text-base text-foreground focus:border-primary focus:outline-none"
      />

      {/* Recurring suggestion banner */}
      {showSuggestion && suggestion && (
        <div className="rounded-[3px] border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="font-sans text-sm text-foreground">
                {t("recurringSuggestion")}
              </p>
              <p className="mt-1 font-sans text-xs text-muted">
                {suggestion.reason}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={applySuggestion}
                  className="rounded-[3px] bg-primary px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-85 cursor-pointer"
                >
                  {t("apply")}
                </button>
                <button
                  type="button"
                  onClick={dismissSuggestion}
                  className="rounded-[3px] border border-border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.08em] text-muted transition-colors hover:border-primary hover:text-primary cursor-pointer"
                >
                  {t("dismiss")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {suggestMutation.isPending && (
        <div className="flex items-center gap-2 text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span className="font-sans text-xs">{t("analyzingPattern")}</span>
        </div>
      )}

      {/* Recurring toggle */}
      <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-[3px] border border-border bg-background p-4 transition-colors hover:border-muted">
        <input
          type="checkbox"
          {...register("recurring")}
          className="h-5 w-5 accent-primary"
        />
        <span className="font-sans text-base text-foreground">
          {t("recurring")}
        </span>
      </label>

      {watchedRecurring && (
        <>
          <select
            {...register("recurringFreq")}
            className="min-h-14 rounded-[3px] border border-border bg-background px-4 font-sans text-base text-foreground focus:border-primary focus:outline-none"
          >
            {RECURRING_FREQUENCIES.map((freq) => (
              <option key={freq} value={freq}>
                {t(
                  `recurring${freq.charAt(0).toUpperCase() + freq.slice(1)}` as TranslationKey,
                )}
              </option>
            ))}
          </select>

          <label className="block font-sans text-xs text-muted">
            {t("recurringEndDate")}
            <input
              {...register("recurringEndDate")}
              type="date"
              className="mt-1.5 min-h-14 w-full rounded-[3px] border border-border bg-background px-4 font-sans text-base text-foreground focus:border-primary focus:outline-none"
            />
          </label>
        </>
      )}

      <button
        disabled={formState.isSubmitting}
        className="min-h-14 rounded-[3px] bg-primary px-4 font-mono text-[0.8rem] uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50 cursor-pointer"
        type="submit"
      >
        {formState.isSubmitting ? "Saving..." : "Add Transaction"}
      </button>
    </form>
  );
}
