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
} from "lucide-react";
import { TransactionCard } from "@/components/shared/TransactionCard";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";
import { CategoryBreakdown } from "@/components/charts/CategoryBreakdown";
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
import { useConfirm } from "@/components/ui/confirm-dialog";

type OverviewMode = "month" | "year";

export default function DashboardPage() {
  const { t, language } = useI18n();
  const { currency } = useCurrency();
  const { data: session } = useSession();
  const { data: transactions = [] } = useTransactions();
  const updateTransaction = useUpdateTransaction();
  const { confirm } = useConfirm();
  const { data: insightsData, isLoading: isInsightsLoading } = useInsights({
    transactions,
    language,
  });

  const now = new Date();
  const [overviewMode, setOverviewMode] = useState<OverviewMode>("month");
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

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
      ? selectedMonth === now.getMonth() && selectedYear === now.getFullYear()
      : selectedYear === now.getFullYear();

  // Filtered transactions based on selected period
  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const d = new Date(item.transactionDate);
      if (overviewMode === "month") {
        return (
          d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
        );
      }
      return d.getFullYear() === selectedYear;
    });
  }, [transactions, overviewMode, selectedMonth, selectedYear]);

  const expenses = filteredTransactions.filter(
    (item) => item.type === "expense",
  );
  const income = filteredTransactions.filter((item) => item.type === "income");
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const net = totalIncome - totalExpenses;

  // All-time data for charts (unchanged)
  const allExpenses = transactions.filter((item) => item.type === "expense");
  const categoryTotals = allExpenses.reduce(
    (acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    },
    {} as Record<string, number>,
  );
  const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  const monthlyData: Array<{ month: string; amount: number }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel =
      language === "vi"
        ? `T${d.getMonth() + 1}`
        : d.toLocaleString("en-US", { month: "short" });
    const monthExpenses = allExpenses.filter((t) => {
      const td = new Date(t.transactionDate);
      return (
        td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear()
      );
    });
    monthlyData.push({
      month: monthLabel,
      amount: monthExpenses.reduce((s, t) => s + t.amount, 0),
    });
  }

  const overviewPeriodLabel =
    overviewMode === "month"
      ? new Date(selectedYear, selectedMonth).toLocaleString(
          language === "vi" ? "vi-VN" : "en-US",
          { month: "long", year: "numeric" },
        )
      : selectedYear.toString();

  const overviewItems = [
    {
      label: t("totalIncome"),
      value: formatCurrency(totalIncome, currency),
      icon: TrendingUp,
      iconColor: "text-success",
    },
    {
      label: t("totalExpenses"),
      value: formatCurrency(totalExpenses, currency),
      icon: TrendingDown,
      iconColor: "text-destructive",
    },
    {
      label: t("netCashFlow"),
      value: formatCurrency(net, currency),
      icon: ArrowUpDown,
      iconColor: net >= 0 ? "text-success" : "text-destructive",
    },
    {
      label: t("savingsRate"),
      value: `${totalIncome > 0 ? Math.max(Math.round((net / totalIncome) * 100), 0) : 0}%`,
      icon: PiggyBank,
      iconColor: "text-primary",
    },
  ];

  return (
    <div className="space-y-16 animate-in">
      {/* Page Heading */}
      <div>
        <span className="eyebrow mb-3 block">Dashboard</span>
        <h1 className="font-serif text-[2.5rem] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
          {walletLabel}
        </h1>
      </div>

      {/* Smart Input - Primary feature */}
      <section>
        <span className="eyebrow mb-4 block">01 - Smart Input</span>
        <SmartInput />
      </section>

      {/* Summary Stats */}
      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow block">02 - Overview</span>
            <div className="mt-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigatePeriod(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-[3px] text-muted hover:bg-muted/10 hover:text-foreground transition-colors"
                aria-label="Previous period"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="font-sans text-sm text-muted capitalize min-w-[120px] text-center">
                {overviewPeriodLabel}
              </span>
              <button
                type="button"
                onClick={() => navigatePeriod(1)}
                disabled={isCurrentPeriod}
                className="flex h-10 w-10 items-center justify-center rounded-[3px] text-muted hover:bg-muted/10 hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next period"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex rounded-[4px] border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setOverviewMode("month")}
              className={`px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] transition-colors ${
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
              className={`px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] transition-colors border-l border-border ${
                overviewMode === "year"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted hover:text-foreground"
              }`}
            >
              {t("overviewYear")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {overviewItems.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.label}
                className="card-shadow rounded-[4px] border border-border bg-card p-5 transition-colors hover:border-muted"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${item.iconColor}`} />
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted">
                    {item.label}
                  </p>
                </div>
                <p className="mt-2 font-mono text-xl font-medium text-foreground">
                  {item.value}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Active Recurring */}
      <section>
        <span className="eyebrow mb-6 block">
          03 - {t("activeRecurringTitle")}
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
        <span className="eyebrow mb-6 block">04 - Analytics</span>
        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryBreakdown data={categoryData} currency={currency} />
          <MonthlyTrendChart data={monthlyData} />
        </div>
      </section>

      {/* Advice */}
      <section>
        <span className="eyebrow mb-6 block">05 - Advice</span>
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
        <span className="eyebrow mb-6 block">06 - Recent</span>
        <div className="card-shadow space-y-4 rounded-[4px] border border-border bg-card p-6">
          <h2 className="font-serif text-[1.5rem] text-foreground">
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
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
