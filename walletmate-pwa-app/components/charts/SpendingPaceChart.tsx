"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import type { SpendingPacePoint } from "@/lib/analytics";

export function SpendingPaceChart({
  data,
  currency = "VND",
}: {
  data: SpendingPacePoint[];
  currency?: string;
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
          {t("spendingPace")}
        </h3>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-muted">
          {t("monthToDate")}
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
            <LineChart
              data={data}
              margin={{ top: 4, right: 0, bottom: 8, left: -18 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="day"
                stroke="var(--muted)"
                interval="preserveStartEnd"
                tick={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.7rem",
                }}
              />
              <YAxis
                stroke="var(--muted)"
                width={46}
                tick={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.7rem",
                }}
                tickFormatter={(value) => `${Number(value) / 1000}k`}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value), currency),
                  name === "current" ? t("currentMonth") : t("previousMonth"),
                ]}
                labelFormatter={(day) => `${t("day")} ${day}`}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "3px",
                  color: "var(--foreground)",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.75rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="previous"
                stroke="var(--muted)"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="current"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </LineChart>
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
