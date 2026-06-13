"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function MonthlyTrendChart({
  data,
}: {
  data: Array<{ month: string; amount: number }>;
}) {
  return (
    <div className="card-shadow h-72 rounded-[4px] border border-border bg-card p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
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
            tick={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.7rem",
            }}
          />
          <Tooltip
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
            dataKey="amount"
            stroke="var(--primary)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
