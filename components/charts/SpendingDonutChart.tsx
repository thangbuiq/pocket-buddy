"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

/* Editorial Brutalism palette - green-mint accent family */
const COLORS = [
  "#4fffb0" /* primary accent */,
  "#3ad4a0" /* darker mint */,
  "#7a9ea0" /* text-dim */,
  "#ffaa00" /* warning as contrast */,
  "#ff4d4d" /* destructive */,
];

export function SpendingDonutChart({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  return (
    <div className="h-64 rounded-[4px] border border-border bg-card p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={70}
            label={({ name, percent }) =>
              `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-text-dim">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
