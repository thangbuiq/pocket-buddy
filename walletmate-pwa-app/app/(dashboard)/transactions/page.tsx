"use client";

import { useMemo, useState } from "react";
import { AddTransactionSheet } from "@/components/forms/AddTransactionSheet";
import { BatchTransactionImport } from "@/components/forms/BatchTransactionImport";
import { SmartInput } from "@/components/shared/SmartInput";
import { TransactionCard } from "@/components/shared/TransactionCard";
import { TransactionsTable } from "@/components/shared/TransactionsTable";
import {
  useCreateTransaction,
  useTransactions,
  useDeleteTransaction,
  useUpdateTransaction,
} from "@/hooks/use-transactions";
import { useCurrency, useI18n } from "@/lib/i18n";
import { ChevronDown, LayoutGrid, Search, Table2, Trash2 } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Toggle } from "@/components/ui/toggle";
import type { Transaction } from "@/types";

export default function TransactionsPage() {
  const { t, language } = useI18n();
  const { currency } = useCurrency();
  const { data = [], isLoading } = useTransactions();
  const createTransaction = useCreateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const updateTransaction = useUpdateTransaction();
  const { confirm } = useConfirm();
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState<"all" | "month" | "year">(
    "all",
  );

  const categories = useMemo(
    () =>
      Array.from(
        new Set(data.map((transaction) => transaction.category)),
      ).sort(),
    [data],
  );

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const now = new Date();

    return data
      .filter((transaction) => {
        const transactionDate = new Date(transaction.transactionDate);
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
        const matchesPeriod =
          periodFilter === "all" ||
          (periodFilter === "month" &&
            transactionDate.getMonth() === now.getMonth() &&
            transactionDate.getFullYear() === now.getFullYear()) ||
          (periodFilter === "year" &&
            transactionDate.getFullYear() === now.getFullYear());

        return matchesQuery && matchesType && matchesCategory && matchesPeriod;
      })
      .sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime(),
      );
  }, [categoryFilter, data, periodFilter, query, typeFilter]);

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
    const date = new Date(dateValue + "T00:00:00");
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

          <div className="grid gap-2 rounded-[4px] border border-border bg-card p-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchTransactions")}
                className="min-h-11 w-full rounded-[3px] border border-border bg-background px-9 font-sans text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
              />
            </label>
            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value as "all" | "income" | "expense",
                )
              }
              className="min-h-11 rounded-[3px] border border-border bg-background px-3 font-sans text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="all">{t("allTypes")}</option>
              <option value="expense">{t("expense")}</option>
              <option value="income">{t("income")}</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="min-h-11 rounded-[3px] border border-border bg-background px-3 font-sans text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="all">{t("allCategories")}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={periodFilter}
              onChange={(event) =>
                setPeriodFilter(event.target.value as "all" | "month" | "year")
              }
              className="min-h-11 rounded-[3px] border border-border bg-background px-3 font-sans text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="all">{t("allTime")}</option>
              <option value="month">{t("thisMonth")}</option>
              <option value="year">{t("thisYear")}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-[3px] border border-border bg-card p-1 sm:hidden">
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
