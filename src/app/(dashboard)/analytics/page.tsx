import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";
import { SpendingDonutChart } from "@/components/charts/SpendingDonutChart";

export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <section className="grid gap-4 lg:grid-cols-2">
        <MonthlyTrendChart data={[{ month: "Jan", amount: 1800 }, { month: "Feb", amount: 1720 }, { month: "Mar", amount: 1910 }, { month: "Apr", amount: 2050 }, { month: "May", amount: 1880 }, { month: "Jun", amount: 1980 }]} />
        <SpendingDonutChart data={[{ name: "Food", value: 980 }, { name: "Rent", value: 2400 }, { name: "Utilities", value: 370 }, { name: "Transport", value: 290 }]} />
      </section>
    </div>
  );
}
