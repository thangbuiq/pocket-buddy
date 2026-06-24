"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import type { CashFlowPoint } from "@/lib/analytics";

export function MonthlyTrendChart({
  data,
  currency = "VND",
  subtitle,
}: {
  data: CashFlowPoint[];
  currency?: string;
  subtitle?: string;
}) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="card-shadow flex h-80 flex-col rounded-[4px] border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-lg text-foreground">
          {t("cashFlowTrend")}
        </h3>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-muted">
          {subtitle ?? t("lastSixMonths")}
        </span>
      </div>
      <div className="min-h-0 flex-1">
        {mounted ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <ComposedChart
              data={data}
              margin={{ top: 4, right: 0, bottom: 8, left: -18 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                stroke="var(--muted)"
                tick={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.7rem",
                }}
              />
              <YAxis
                stroke="var(--muted)"
                width={8}
                axisLine={false}
                tick={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value), currency),
                  name === "income"
                    ? t("income")
                    : name === "expenses"
                      ? t("expense")
                      : t("netCashFlow"),
                ]}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "3px",
                  color: "var(--foreground)",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.75rem",
                }}
              />
              <Bar
                dataKey="income"
                fill="var(--success)"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                fill="var(--destructive)"
                radius={[2, 2, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-sm text-muted">
            {t("loading")}
          </div>
        )}
      </div>
    </div>
  );
}
