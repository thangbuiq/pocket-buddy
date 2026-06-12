"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MonthlyTrendChart({ data }: { data: Array<{ month: string; amount: number }> }) {
  return (
    <div className="h-72 rounded-xl border border-white/10 bg-white/5 p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Line type="monotone" dataKey="amount" stroke="#818cf8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
