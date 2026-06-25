"use client";

import { useMemo, useState } from "react";
import { AddTransactionSheet } from "@/components/forms/AddTransactionSheet";
import { BatchTransactionImport } from "@/components/forms/BatchTransactionImport";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { SmartInput } from "@/components/shared/SmartInput";
import { IncomePrivacyToggle } from "@/components/shared/IncomePrivacyToggle";
import { TransactionCard } from "@/components/shared/TransactionCard";
import { TransactionsTable } from "@/components/shared/TransactionsTable";
import {
  useCreateTransaction,
  useTransactions,
  useDeleteTransaction,
  useUpdateTransaction,
} from "@/hooks/use-transactions";
import { useCurrency, useI18n } from "@/lib/i18n";
import {
  ChevronDown,
  FileSpreadsheet,
  LayoutGrid,
  Search,
  Table2,
  Trash2,
} from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { type DateRange } from "react-day-picker";
import type { Transaction } from "@/types";

function parseTransactionDate(dateValue: string) {
  return new Date(`${dateValue}T00:00:00`);
}

export default function TransactionsPage() {
  const { t, language } = useI18n();
  const { currency } = useCurrency();
  const { data = [], isLoading } = useTransactions();
  const createTransaction = useCreateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const updateTransaction = useUpdateTransaction();
  const { confirm } = useConfirm();
  const [viewMode, setViewMode] = useState<"card" | "table">(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 640px)").matches
      ? "table"
      : "card",
  );
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showIncomeAmounts, setShowIncomeAmounts] = useState(false);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(data.map((transaction) => transaction.category)),
      ).sort(),
    [data],
  );

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const rangeFrom = dateRange?.from;
    const rangeTo = dateRange?.to ?? rangeFrom;
    const rangeStart = rangeFrom
      ? new Date(rangeFrom).setHours(0, 0, 0, 0)
      : undefined;
    const rangeEnd = rangeTo
      ? new Date(rangeTo).setHours(23, 59, 59, 999)
      : undefined;

    return data
      .filter((transaction) => {
        const transactionTime = parseTransactionDate(
          transaction.transactionDate,
        ).getTime();
        const matchesQuery =
          normalizedQuery.length === 0 ||
          transaction.category.toLowerCase().includes(normalizedQuery) ||
          (transaction.description ?? "")
            .toLowerCase()
            .includes(normalizedQuery);
        const matchesType =
          typeFilter === "all" || transaction.type === typeFilter;
        const matchesCategory =
          categoryFilter === "all" || transaction.category === categoryFilter;
        const matchesDateRange =
          rangeStart === undefined ||
          rangeEnd === undefined ||
          (transactionTime >= rangeStart && transactionTime <= rangeEnd);

        return (
          matchesQuery && matchesType && matchesCategory && matchesDateRange
        );
      })
      .sort(
        (a, b) =>
          parseTransactionDate(b.transactionDate).getTime() -
          parseTransactionDate(a.transactionDate).getTime(),
      );
  }, [categoryFilter, data, dateRange, query, typeFilter]);

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce<
      Array<{ date: string; items: Transaction[] }>
    >((groups, transaction) => {
      const existing = groups.find(
        (group) => group.date === transaction.transactionDate,
      );
      if (existing) {
        existing.items.push(transaction);
      } else {
        groups.push({
          date: transaction.transactionDate,
          items: [transaction],
        });
      }
      return groups;
    }, []);
  }, [filteredTransactions]);

  const formatDateGroup = (dateValue: string) => {
    const date = parseTransactionDate(dateValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.getTime() === today.getTime()) return t("today");
    if (date.getTime() === yesterday.getTime()) return t("yesterday");

    return date.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCancelRecurring = async (transaction: Transaction) => {
    if (
      !(await confirm({
        title: "Cancel Recurring",
        description: t("recurringCancel") as string,
        confirmText: "Stop Recurring",
      }))
    )
      return;

    updateTransaction.mutate({
      id: transaction.id,
      payload: {
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        transactionDate: transaction.transactionDate,
        recurring: false,
        syncStatus: transaction.syncStatus,
      },
    });
  };

  return (
    <div className="space-y-7 animate-in sm:space-y-10">
      {/* Page Heading */}
      <div>
        <span className="eyebrow mb-3 block">Transactions</span>
        <h1 className="font-serif text-[2.1rem] font-normal leading-[1.05] text-foreground sm:text-[3.25rem]">
          {t("transactions")}
        </h1>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-start gap-3 rounded-[4px] border border-primary/25 bg-primary/5 p-4 text-sm text-foreground">
          <FileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="font-sans leading-6">
            Adding more than 2 transactions? Use{" "}
            <a
              href="#batch-import"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Batch Import
            </a>{" "}
            below to upload CSV, Excel, PDF, or image files and review
            everything at once.
          </p>
        </div>
        <SmartInput />
        <details className="group">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-[4px] border border-border bg-card px-4 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-muted transition-colors hover:text-foreground sm:px-6">
            {t("manualInput")}
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3">
            <AddTransactionSheet
              onSubmit={async (data) => {
                await createTransaction.mutateAsync(data);
              }}
            />
          </div>
        </details>
        <BatchTransactionImport />
      </div>

      {isLoading ? (
        <p className="text-base text-muted">{t("loading")}</p>
      ) : data.length === 0 ? (
        <p className="text-base text-muted">{t("noTransactions")}</p>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="eyebrow block">History</span>
            <div className="flex items-center gap-2">
              <IncomePrivacyToggle
                isVisible={showIncomeAmounts}
                onToggle={() => setShowIncomeAmounts((value) => !value)}
                className="min-h-11"
              />
              <div className="hidden grid-cols-2 gap-2 rounded-[3px] border border-border bg-card p-1 sm:grid">
                <Toggle
                  type="button"
                  pressed={viewMode === "card"}
                  onPressedChange={() => setViewMode("card")}
                  size="sm"
                  className="min-h-11"
                  aria-label="Card mode"
                >
                  <LayoutGrid className="h-4 w-4" />
                  {t("cardsView")}
                </Toggle>
                <Toggle
                  type="button"
                  pressed={viewMode === "table"}
                  onPressedChange={() => setViewMode("table")}
                  size="sm"
                  className="min-h-11"
                  aria-label="Table mode"
                >
                  <Table2 className="h-4 w-4" />
                  {t("tableView")}
                </Toggle>
              </div>
            </div>
          </div>

          <div className="grid gap-3 rounded-[4px] border border-border bg-card p-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="relative block sm:col-span-2 lg:col-span-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchTransactions")}
                className="min-h-12 w-full rounded-[3px] border border-border bg-background px-9 font-sans text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none sm:min-h-11"
              />
            </label>
            <Select
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as "all" | "income" | "expense")
              }
            >
              <SelectTrigger className="min-h-12 sm:min-h-11">
                <SelectValue placeholder={t("allTypes") as string} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allTypes")}</SelectItem>
                <SelectItem value="expense">{t("expense")}</SelectItem>
                <SelectItem value="income">{t("income")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="min-h-12 sm:min-h-11">
                <SelectValue placeholder={t("allCategories") as string} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCategories")}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              className="sm:col-span-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-[3px] border border-border bg-card p-1 sm:hidden">
            <Toggle
              type="button"
              pressed={viewMode === "card"}
              onPressedChange={() => setViewMode("card")}
              size="sm"
              className="min-h-12"
              aria-label="Card mode"
            >
              <LayoutGrid className="h-4 w-4" />
              {t("cardsView")}
            </Toggle>
            <Toggle
              type="button"
              pressed={viewMode === "table"}
              onPressedChange={() => setViewMode("table")}
              size="sm"
              className="min-h-12"
              aria-label="Table mode"
            >
              <Table2 className="h-4 w-4" />
              {t("tableView")}
            </Toggle>
          </div>

          {filteredTransactions.length === 0 ? (
            <p className="rounded-[4px] border border-border bg-card p-4 text-sm text-muted">
              {t("noMatchingTransactions")}
            </p>
          ) : viewMode === "table" ? (
            <div className="space-y-2">
              <p className="rounded-[3px] border border-border bg-card px-3 py-2 font-sans text-sm text-muted">
                {t("deleteInCardViewTip")}
              </p>
              <TransactionsTable
                transactions={filteredTransactions}
                currency={currency}
                hideIncomeAmounts={!showIncomeAmounts}
              />
            </div>
          ) : (
            <div className="space-y-5">
              {groupedTransactions.map((group) => (
                <div key={group.date} className="space-y-2">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-primary">
                    {formatDateGroup(group.date)}
                  </p>
                  <div className="space-y-3">
                    {group.items.map((transaction) => (
                      <div key={transaction.id} className="space-y-2">
                        <TransactionCard
                          transaction={transaction}
                          currency={currency}
                          onCancelRecurring={handleCancelRecurring}
                          hideIncomeAmount={!showIncomeAmounts}
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={async () => {
                              if (
                                await confirm({
                                  title: "Delete Transaction",
                                  description: t("deleteConfirm") as string,
                                })
                              ) {
                                deleteTransaction.mutate(transaction.id);
                              }
                            }}
                            className="flex min-h-11 items-center justify-center gap-2 rounded-[3px] border border-border px-3 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-muted transition-colors hover:border-destructive hover:text-destructive cursor-pointer"
                            aria-label={t("deleteTransaction")}
                          >
                            <Trash2 className="h-4 w-4" />
                            {t("delete")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
