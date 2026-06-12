import { InsightBanner } from "@/components/shared/InsightBanner";
import { TransactionCard } from "@/components/shared/TransactionCard";
import { BudgetMeter } from "@/components/shared/BudgetMeter";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";
import { SpendingDonutChart } from "@/components/charts/SpendingDonutChart";
import { mockStore } from "@/lib/mock-db";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const transactions = mockStore.transactions.slice(0, 5);
  const expenses = mockStore.transactions.filter((item) => item.type === "expense");
  const income = mockStore.transactions.filter((item) => item.type === "income");
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const net = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <InsightBanner
        title="Spending spike detected in dining"
        description="Dining expenses increased by 18% month-over-month. Reducing two restaurant visits can recover about $85 this month."
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {["Total Income", "Total Expenses", "Net Cash Flow", "Savings Rate"].map((item, index) => {
          const value =
            index === 0
              ? formatCurrency(totalIncome)
              : index === 1
                ? formatCurrency(totalExpenses)
                : index === 2
                  ? formatCurrency(net)
                  : `${totalIncome > 0 ? Math.max(Math.round((net / totalIncome) * 100), 0) : 0}%`;
          return (
            <article key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-sm text-slate-400">{item}</p>
              <p className="mt-1 text-xl font-semibold">{value}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SpendingDonutChart data={[{ name: "Food", value: 420 }, { name: "Transport", value: 160 }, { name: "Utilities", value: 120 }]} />
        <MonthlyTrendChart data={[{ month: "Jan", amount: 900 }, { month: "Feb", amount: 1020 }, { month: "Mar", amount: 980 }, { month: "Apr", amount: 1100 }, { month: "May", amount: 990 }, { month: "Jun", amount: 1060 }]} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="font-semibold">Recent transactions</h2>
          {transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="font-semibold">Budget utilization</h2>
          <BudgetMeter category="Food" used={420} limit={600} />
          <BudgetMeter category="Transport" used={160} limit={250} />
          <BudgetMeter category="Entertainment" used={220} limit={250} />
        </div>
      </section>
    </div>
  );
}
