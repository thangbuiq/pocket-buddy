"use client";

import { TransactionCard } from "@/components/shared/TransactionCard";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";
import { CategoryBreakdown } from "@/components/charts/CategoryBreakdown";
import { SmartInput } from "@/components/shared/SmartInput";
import { useTransactions } from "@/hooks/use-transactions";
import { useI18n, useCurrency } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { t } = useI18n();
  const { currency } = useCurrency();
  const { data: transactions = [] } = useTransactions();

  const recentTransactions = transactions.slice(0, 5);
  const expenses = transactions.filter((item) => item.type === "expense");
  const income = transactions.filter((item) => item.type === "income");
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const net = totalIncome - totalExpenses;

  const categoryTotals = expenses.reduce(
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
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleString("default", { month: "short" });
    const monthExpenses = expenses.filter((t) => {
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

  return (
    <div className="space-y-16 animate-in">
      {/* Page Heading */}
      <div>
        <span className="eyebrow mb-3 block">Dashboard</span>
        <h1 className="font-serif text-[2.5rem] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
          {t("dashboard")}
        </h1>
      </div>

      {/* Smart Input - Primary feature */}
      <section>
        <span className="eyebrow mb-4 block">01 - Input</span>
        <SmartInput />
      </section>

      {/* Summary Stats */}
      <section>
        <span className="eyebrow mb-6 block">02 - Overview</span>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: t("totalIncome"),
              value: formatCurrency(totalIncome, currency),
            },
            {
              label: t("totalExpenses"),
              value: formatCurrency(totalExpenses, currency),
            },
            { label: t("netCashFlow"), value: formatCurrency(net, currency) },
            {
              label: t("savingsRate"),
              value: `${totalIncome > 0 ? Math.max(Math.round((net / totalIncome) * 100), 0) : 0}%`,
            },
          ].map((item) => (
            <article
              key={item.label}
              className="card-shadow rounded-[4px] border border-border bg-card p-5 transition-colors hover:border-muted"
            >
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted">
                {item.label}
              </p>
              <p className="mt-2 font-mono text-xl font-medium text-foreground">
                {item.value}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Charts */}
      <section>
        <span className="eyebrow mb-6 block">03 - Analytics</span>
        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryBreakdown data={categoryData} currency={currency} />
          <MonthlyTrendChart data={monthlyData} />
        </div>
      </section>

      {/* Recent Transactions */}
      <section>
        <span className="eyebrow mb-6 block">04 - Recent</span>
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
