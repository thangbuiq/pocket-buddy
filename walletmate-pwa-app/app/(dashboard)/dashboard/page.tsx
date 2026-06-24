"use client";

import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { TransactionCard } from "@/components/shared/TransactionCard";
import { IncomePrivacyToggle } from "@/components/shared/IncomePrivacyToggle";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";
import { CategoryBreakdown } from "@/components/charts/CategoryBreakdown";
import { SpendingPaceChart } from "@/components/charts/SpendingPaceChart";
import { RecurringIncomeRatioCard } from "@/components/charts/RecurringIncomeRatioCard";
import { SmartInput } from "@/components/shared/SmartInput";
import { ActiveRecurringList } from "@/components/dashboard/ActiveRecurringList";
import {
  useTransactions,
  useUpdateTransaction,
} from "@/hooks/use-transactions";
import { InsightsList } from "@/components/dashboard/InsightsList";
import { useInsights } from "@/hooks/use-insights";
import { useI18n, useCurrency } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { formatMaskedCurrency } from "@/lib/privacy";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  buildCashFlowTrend,
  buildSpendingPace,
  buildTopCategorySpend,
  getMonthlyRecurringExpense,
} from "@/lib/analytics";

type OverviewMode = "month" | "year";

export default function DashboardPage() {
  const { t, language } = useI18n();
  const { currency } = useCurrency();
  const { data: session } = useSession();
  const { data: transactions = [] } = useTransactions();
  const updateTransaction = useUpdateTransaction();
  const { confirm } = useConfirm();
  const {
    data: insightsData,
    isLoading: isInsightsLoading,
    isError: isInsightsError,
    regenerate,
    isRegenerating,
    regenerateError,
  } = useInsights({
    transactions,
    language,
  });

  const now = useMemo(() => new Date(), []);
  const currentMonthIndex = now.getMonth();
  const currentYear = now.getFullYear();
  const [overviewMode, setOverviewMode] = useState<OverviewMode>("month");
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showIncomeAmounts, setShowIncomeAmounts] = useState(false);

  const walletLabel = session?.user?.githubUsername
    ? `Ví của "${session.user.githubUsername}"`
    : t("dashboard");

  const recentTransactions = transactions.slice(0, 5);

  // Navigate period
  const navigatePeriod = useCallback(
    (direction: -1 | 1) => {
      if (overviewMode === "month") {
        const d = new Date(selectedYear, selectedMonth + direction, 1);
        setSelectedMonth(d.getMonth());
        setSelectedYear(d.getFullYear());
      } else {
        setSelectedYear((y) => y + direction);
      }
    },
    [overviewMode, selectedMonth, selectedYear],
  );

  const isCurrentPeriod =
    overviewMode === "month"
      ? selectedMonth === currentMonthIndex && selectedYear === currentYear
      : selectedYear === currentYear;

  const getPeriodTransactions = useCallback(
    (month: number, year: number, mode: OverviewMode) => {
      return transactions.filter((item) => {
        const d = new Date(item.transactionDate);
        if (mode === "month") {
          return d.getMonth() === month && d.getFullYear() === year;
        }
        return d.getFullYear() === year;
      });
    },
    [transactions],
  );

  // Filtered transactions based on selected period
  const filteredTransactions = useMemo(() => {
    return getPeriodTransactions(selectedMonth, selectedYear, overviewMode);
  }, [getPeriodTransactions, overviewMode, selectedMonth, selectedYear]);

  const previousTransactions = useMemo(() => {
    if (overviewMode === "month") {
      const previousDate = new Date(selectedYear, selectedMonth - 1, 1);
      return getPeriodTransactions(
        previousDate.getMonth(),
        previousDate.getFullYear(),
        "month",
      );
    }
    return getPeriodTransactions(selectedMonth, selectedYear - 1, "year");
  }, [getPeriodTransactions, overviewMode, selectedMonth, selectedYear]);

  const {
    totalExpenses,
    totalIncome,
    net,
    previousTotalExpenses,
    previousTotalIncome,
    previousNet,
  } = useMemo(() => {
    const expenses = filteredTransactions.filter(
      (item) => item.type === "expense",
    );
    const income = filteredTransactions.filter(
      (item) => item.type === "income",
    );
    const previousExpenses = previousTransactions.filter(
      (item) => item.type === "expense",
    );
    const previousIncome = previousTransactions.filter(
      (item) => item.type === "income",
    );
    const nextTotalExpenses = expenses.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const nextTotalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const nextPreviousTotalExpenses = previousExpenses.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const nextPreviousTotalIncome = previousIncome.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    return {
      totalExpenses: nextTotalExpenses,
      totalIncome: nextTotalIncome,
      net: nextTotalIncome - nextTotalExpenses,
      previousTotalExpenses: nextPreviousTotalExpenses,
      previousTotalIncome: nextPreviousTotalIncome,
      previousNet: nextPreviousTotalIncome - nextPreviousTotalExpenses,
    };
  }, [filteredTransactions, previousTransactions]);

  const savingsRate =
    totalIncome > 0 ? Math.max(Math.round((net / totalIncome) * 100), 0) : 0;
  const previousSavingsRate =
    previousTotalIncome > 0
      ? Math.max(Math.round((previousNet / previousTotalIncome) * 100), 0)
      : 0;

  const analyticsMonth =
    overviewMode === "month"
      ? selectedMonth
      : selectedYear === currentYear
        ? currentMonthIndex
        : 11;
  const cashFlowData = useMemo(
    () =>
      buildCashFlowTrend(transactions, language, {
        mode: overviewMode,
        month: analyticsMonth,
        year: selectedYear,
      }),
    [analyticsMonth, language, overviewMode, selectedYear, transactions],
  );
  const categoryData = useMemo(
    () => buildTopCategorySpend(filteredTransactions),
    [filteredTransactions],
  );
  const spendingPaceData = useMemo(
    () =>
      buildSpendingPace(transactions, {
        month: analyticsMonth,
        year: selectedYear,
      }),
    [analyticsMonth, selectedYear, transactions],
  );
  const monthlyRecurringExpense = useMemo(
    () => getMonthlyRecurringExpense(filteredTransactions),
    [filteredTransactions],
  );
  const selectedPeriodIncome = useMemo(
    () =>
      filteredTransactions
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + item.amount, 0),
    [filteredTransactions],
  );

  const overviewPeriodLabel =
    overviewMode === "month"
      ? new Date(selectedYear, selectedMonth).toLocaleString(
          language === "vi" ? "vi-VN" : "en-US",
          { month: "long", year: "numeric" },
        )
      : selectedYear.toString();

  const formatDelta = (
    current: number,
    previous: number,
    isPercent = false,
  ) => {
    if (previous === 0 && current === 0) return t("noChange");
    if (isPercent) {
      const delta = current - previous;
      return `${delta >= 0 ? "+" : ""}${delta}${t("percentagePointShort")}`;
    }
    const delta = current - previous;
    const sign = delta >= 0 ? "+" : "";
    return `${sign}${formatCurrency(delta, currency)}`;
  };

  const overviewItems = [
    {
      label: t("totalIncome"),
      value: formatCurrency(totalIncome, currency),
      delta: formatDelta(totalIncome, previousTotalIncome),
      isIncomeRelated: true,
      icon: TrendingUp,
      iconColor: "text-success",
    },
    {
      label: t("totalExpenses"),
      value: formatCurrency(totalExpenses, currency),
      delta: formatDelta(totalExpenses, previousTotalExpenses),
      isIncomeRelated: false,
      icon: TrendingDown,
      iconColor: "text-destructive",
    },
    {
      label: t("netCashFlow"),
      value: formatCurrency(net, currency),
      delta: formatDelta(net, previousNet),
      isIncomeRelated: true,
      icon: ArrowUpDown,
      iconColor: net >= 0 ? "text-success" : "text-destructive",
    },
    {
      label: t("savingsRate"),
      value: `${savingsRate}%`,
      delta: formatDelta(savingsRate, previousSavingsRate, true),
      isIncomeRelated: true,
      icon: PiggyBank,
      iconColor: "text-primary",
    },
  ];

  return (
    <div className="space-y-7 animate-in sm:space-y-12 lg:space-y-16">
      {/* Page Heading */}
      <div>
        <span className="eyebrow mb-3 block">Dashboard</span>
        <h1 className="font-serif text-[2rem] font-normal leading-[1.08] text-foreground sm:text-[2.5rem]">
          {walletLabel}
        </h1>
      </div>

      {/* Smart Input - Primary feature */}
      <section>
        <span className="eyebrow mb-3 block sm:mb-4">Smart Input</span>
        <SmartInput />
      </section>

      {/* Summary Stats */}
      <section>
        <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <span className="eyebrow block">Overview</span>
            <div className="mt-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigatePeriod(-1)}
                className="flex h-11 w-11 items-center justify-center rounded-[3px] text-muted transition-colors hover:bg-muted/10 hover:text-foreground"
                aria-label={t("previousPeriod")}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="min-w-[8.5rem] flex-1 text-center font-sans text-sm capitalize text-muted sm:flex-none">
                {overviewPeriodLabel}
              </span>
              <button
                type="button"
                onClick={() => navigatePeriod(1)}
                disabled={isCurrentPeriod}
                className="flex h-11 w-11 items-center justify-center rounded-[3px] text-muted transition-colors hover:bg-muted/10 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={t("nextPeriod")}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-start">
            <IncomePrivacyToggle
              isVisible={showIncomeAmounts}
              onToggle={() => setShowIncomeAmounts((value) => !value)}
              className="min-h-11 w-full sm:w-auto"
            />
            <div className="grid grid-cols-2 overflow-hidden rounded-[4px] border border-border sm:flex">
              <button
                type="button"
                onClick={() => setOverviewMode("month")}
                className={`min-h-11 px-3 font-mono text-[0.6rem] uppercase tracking-[0.12em] transition-colors ${
                  overviewMode === "month"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted hover:text-foreground"
                }`}
              >
                {t("overviewMonth")}
              </button>
              <button
                type="button"
                onClick={() => setOverviewMode("year")}
                className={`min-h-11 border-l border-border px-3 font-mono text-[0.6rem] uppercase tracking-[0.12em] transition-colors ${
                  overviewMode === "year"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted hover:text-foreground"
                }`}
              >
                {t("overviewYear")}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-4">
          {overviewItems.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.label}
                className="card-shadow min-w-0 overflow-hidden rounded-[4px] border border-border bg-card p-3 transition-colors hover:border-muted sm:p-5"
              >
                <div className="mb-3 flex min-w-0 items-center gap-2">
                  <Icon className={`h-4 w-4 shrink-0 ${item.iconColor}`} />
                  <p className="min-w-0 font-mono text-[0.56rem] uppercase tracking-[0.08em] text-muted [overflow-wrap:anywhere] sm:text-[0.65rem] sm:tracking-[0.1em]">
                    {item.label}
                  </p>
                </div>
                <p className="mt-2 min-w-0 font-mono text-[0.82rem] font-medium leading-snug text-foreground tabular-nums [overflow-wrap:anywhere] min-[430px]:text-sm sm:text-xl">
                  {item.isIncomeRelated && !showIncomeAmounts
                    ? item.label === t("savingsRate")
                      ? "***%"
                      : formatMaskedCurrency(currency)
                    : item.value}
                </p>
                <p className="mt-2 min-w-0 font-mono text-[0.56rem] uppercase leading-snug tracking-[0.06em] text-muted [overflow-wrap:anywhere] sm:text-[0.62rem] sm:tracking-[0.08em]">
                  {item.isIncomeRelated && !showIncomeAmounts
                    ? item.label === t("savingsRate")
                      ? `***${t("percentagePointShort")}`
                      : formatMaskedCurrency(currency)
                    : item.delta}{" "}
                  {t("vsPrevious")}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Active Recurring */}
      <section>
        <span className="eyebrow mb-4 block sm:mb-6">
          {t("activeRecurringTitle")}
        </span>
        <ActiveRecurringList
          transactions={transactions}
          currency={currency}
          onSetEndDate={(id, endDate) => {
            const txn = transactions.find((t) => t.id === id);
            if (!txn) return;
            updateTransaction.mutate({
              id,
              payload: {
                type: txn.type,
                amount: txn.amount,
                category: txn.category,
                description: txn.description,
                transactionDate: txn.transactionDate,
                recurring: true,
                recurringFreq: txn.recurringFreq,
                recurringEndDate: endDate,
                syncStatus: txn.syncStatus,
              },
            });
          }}
          onCancelRecurring={async (txn) => {
            if (
              !(await confirm({
                title: "Cancel Recurring",
                description: t("recurringCancel") as string,
                confirmText: "Stop Recurring",
              }))
            )
              return;
            updateTransaction.mutate({
              id: txn.id,
              payload: {
                type: txn.type,
                amount: txn.amount,
                category: txn.category,
                description: txn.description,
                transactionDate: txn.transactionDate,
                recurring: false,
                syncStatus: txn.syncStatus,
              },
            });
          }}
        />
      </section>

      {/* Charts */}
      <section>
        <span className="eyebrow mb-4 block sm:mb-6">Analytics</span>
        <div className="grid gap-4 lg:grid-cols-5 lg:gap-6">
          <div className="order-1 lg:col-span-3">
            <CategoryBreakdown
              data={categoryData}
              currency={currency}
              periodLabel={overviewPeriodLabel}
            />
          </div>
          <div className="order-2 lg:col-span-2">
            <RecurringIncomeRatioCard
              monthlyIncome={selectedPeriodIncome}
              monthlyRecurringExpense={monthlyRecurringExpense}
              currency={currency}
              hideIncomeAmounts={!showIncomeAmounts}
            />
          </div>
          <div className="order-3 space-y-4 lg:col-span-5 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
            <MonthlyTrendChart
              data={cashFlowData}
              currency={currency}
              subtitle={
                overviewMode === "month" ? t("latestSixMonths") : undefined
              }
            />
            <SpendingPaceChart data={spendingPaceData} currency={currency} />
          </div>
        </div>
      </section>

      {/* Advice */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="eyebrow block">Advice</span>
          <button
            type="button"
            onClick={() => regenerate()}
            disabled={
              transactions.length < 3 || isInsightsLoading || isRegenerating
            }
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[3px] border border-border bg-card px-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted transition-colors hover:border-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`}
            />
            {isRegenerating
              ? t("regeneratingInsights")
              : t("regenerateInsights")}
          </button>
        </div>
        {(isInsightsError || regenerateError) && (
          <p className="mb-4 font-sans text-sm text-destructive">
            {t("insightsError")}
          </p>
        )}
        {isInsightsLoading ? (
          <p className="font-sans text-sm text-muted">{t("loading")}</p>
        ) : (
          <InsightsList
            insights={insightsData?.insights ?? []}
            currency={currency}
          />
        )}
      </section>

      {/* Recent Transactions */}
      <section>
        <span className="eyebrow mb-4 block sm:mb-6">Recent</span>
        <div className="card-shadow space-y-4 rounded-[4px] border border-border bg-card p-4 sm:p-6">
          <h2 className="font-serif text-[1.25rem] text-foreground sm:text-[1.5rem]">
            {t("recentTransactions")}
          </h2>
          {recentTransactions.length === 0 ? (
            <p className="font-sans text-sm text-muted">
              {t("noTransactions")}
            </p>
          ) : (
            recentTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                currency={currency}
                hideIncomeAmount={!showIncomeAmounts}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
