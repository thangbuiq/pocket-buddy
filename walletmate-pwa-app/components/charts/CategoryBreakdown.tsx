"use client";

import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import type { CategorySpendPoint } from "@/lib/analytics";

const CATEGORY_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];

const MAX_VISIBLE_SLICES = 4;

type DonutPoint = CategorySpendPoint & {
  color: string;
  id: string;
};

export function CategoryBreakdown({
  data,
  currency = "VND",
}: {
  data: CategorySpendPoint[];
  currency?: string;
}) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const chartData = useMemo<DonutPoint[]>(() => {
    if (total === 0) return [];

    const sorted = [...data].sort((a, b) => b.amount - a.amount);
    const visible = sorted.slice(0, MAX_VISIBLE_SLICES);
    const remainder = sorted.slice(MAX_VISIBLE_SLICES);
    const points = visible.map((item, index) => ({
      ...item,
      id: `category-${index}-${item.category}`,
      percent: (item.amount / total) * 100,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));

    const otherAmount = remainder.reduce((sum, item) => sum + item.amount, 0);
    if (otherAmount > 0) {
      points.push({
        id: "category-other",
        category: t("other"),
        amount: otherAmount,
        percent: (otherAmount / total) * 100,
        color: "var(--muted)",
      });
    }

    return points;
  }, [data, t, total]);

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-[4px] border border-border bg-card">
        <p className="font-mono text-sm text-muted">{t("noExpenseData")}</p>
      </div>
    );
  }

  return (
    <div className="card-shadow flex min-h-80 flex-col rounded-[4px] border border-border bg-card p-4 sm:h-80 sm:p-5">
      <div className="mb-3 flex shrink-0 items-baseline justify-between gap-3">
        <h3 className="font-serif text-lg text-foreground">
          {t("topCategories")}
        </h3>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-muted">
          {data.length} {t("categoriesCount")}
        </span>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:items-center">
        <div className="relative mx-auto h-40 w-full max-w-56 sm:h-full sm:max-w-none">
          {mounted ? (
            <>
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={0}
              >
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={chartData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius="64%"
                    outerRadius="92%"
                    paddingAngle={2}
                    stroke="var(--card)"
                    strokeWidth={2}
                  >
                    {chartData.map((item) => (
                      <Cell key={item.id} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, _name, item) => {
                      const point = item.payload as DonutPoint;
                      return [
                        `${formatCurrency(Number(value), currency)} (${point.percent.toFixed(0)}%)`,
                        point.category,
                      ];
                    }}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "3px",
                      color: "var(--foreground)",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "0.75rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-muted">
                  {t("totalExpenses")}
                </span>
                <span className="mt-1 max-w-full font-mono text-[0.72rem] font-medium leading-tight text-foreground tabular-nums [overflow-wrap:anywhere] min-[430px]:text-[0.82rem]">
                  {formatCurrency(total, currency)}
                </span>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-sm text-muted">
              {t("loading")}
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-2">
          {chartData.map((item) => (
            <div
              key={item.id}
              className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-0.5 rounded-[3px] border border-border/70 bg-background/40 px-2.5 py-1.5"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="min-w-0 truncate font-sans text-sm text-foreground">
                {item.category}
              </span>
              <span className="font-mono text-[0.72rem] tabular-nums text-primary">
                {item.percent.toFixed(0)}%
              </span>
              <span className="col-start-2 col-end-4 min-w-0 font-mono text-[0.62rem] uppercase tracking-[0.06em] text-muted [overflow-wrap:anywhere]">
                {formatCurrency(item.amount, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
