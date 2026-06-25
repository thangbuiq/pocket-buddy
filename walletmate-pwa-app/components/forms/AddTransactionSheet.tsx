"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  transactionSchema,
  type TransactionInput,
} from "@/lib/validations/transactions";
import { Toggle } from "@/components/ui/toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";
import type { RecurringFrequency } from "@/types";

const RECURRING_FREQUENCIES: RecurringFrequency[] = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
];

const CATEGORIES = [
  "Ăn uống",
  "Di chuyển",
  "Mua sắm",
  "Giải trí",
  "Hóa đơn",
  "Sức khỏe",
  "Học tập",
  "Lương",
  "Khác",
];

export function AddTransactionSheet({
  onSubmit,
}: {
  onSubmit: (data: TransactionInput) => Promise<void> | void;
}) {
  const { t } = useI18n();

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

  const watchedCategory = useWatch({ control, name: "category" });
  const watchedType = useWatch({ control, name: "type" });
  const watchedRecurring = useWatch({ control, name: "recurring" });
  const watchedRecurringFreq = useWatch({ control, name: "recurringFreq" });

  return (
    <form
      className="grid gap-4 rounded-[4px] border border-border bg-card p-4 sm:p-6"
      onSubmit={handleSubmit(async (data) => {
        await onSubmit(data);
        reset();
      })}
    >
      <span className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-primary">
        New Transaction
      </span>
      <h3 className="font-serif text-[1.7rem] leading-tight text-foreground sm:text-[2rem]">
        <span className="serif-accent">Manual</span> Input
      </h3>

      <Select
        value={watchedType}
        onValueChange={(value) =>
          setValue("type", value as TransactionInput["type"], {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          })
        }
      >
        <SelectTrigger className="min-h-14 px-4 text-base">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="expense">Expense</SelectItem>
          <SelectItem value="income">Income</SelectItem>
        </SelectContent>
      </Select>

      <input
        {...register("amount", { valueAsNumber: true })}
        type="number"
        step="0.01"
        placeholder="Amount"
        className="min-h-14 rounded-[3px] border border-border bg-background px-4 font-sans text-base text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
      />

      <Select
        value={watchedCategory}
        onValueChange={(value) =>
          setValue("category", value, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          })
        }
      >
        <SelectTrigger className="min-h-14 px-4 text-base">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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

      {/* Recurring toggle */}
      <Toggle
        type="button"
        pressed={Boolean(watchedRecurring)}
        onPressedChange={(pressed) =>
          setValue("recurring", pressed, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          })
        }
        size="lg"
        className="w-full justify-between bg-background text-base normal-case tracking-[0] data-[state=off]:text-foreground"
      >
        <span className="font-sans">{t("recurring")}</span>
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.08em] opacity-70">
          {watchedRecurring ? "On" : "Off"}
        </span>
      </Toggle>

      {watchedRecurring && (
        <>
          <Select
            value={watchedRecurringFreq ?? "monthly"}
            onValueChange={(value) =>
              setValue("recurringFreq", value as RecurringFrequency, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className="min-h-14 px-4 text-base">
              <SelectValue placeholder={t("recurringFrequency") as string} />
            </SelectTrigger>
            <SelectContent>
              {RECURRING_FREQUENCIES.map((freq) => (
                <SelectItem key={freq} value={freq}>
                  {t(
                    `recurring${freq.charAt(0).toUpperCase() + freq.slice(1)}` as TranslationKey,
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="block font-sans text-xs text-muted">
            {t("recurringEndDate")}
            <input
              {...register("recurringEndDate")}
              type="date"
              className="mt-1.5 min-h-14 w-full rounded-[3px] border border-border bg-background px-4 font-sans text-base text-foreground focus:border-primary focus:outline-none"
            />
            <span className="mt-1.5 block leading-5">
              This is the end date for the recurring transaction.
            </span>
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
