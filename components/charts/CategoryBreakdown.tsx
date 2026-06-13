"use client";

import { formatCurrency } from "@/lib/utils";

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

export function CategoryBreakdown({
  data,
  currency = "VND",
}: {
  data: Array<{ name: string; value: number }>;
  currency?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-[4px] border border-border bg-card">
        <p className="font-mono text-sm text-muted">No expense data</p>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.value - a.value);

  return (
    <div className="h-72 rounded-[4px] border border-border bg-card p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="font-serif text-lg text-foreground">By Category</h3>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-muted">
          {sorted.length} {sorted.length === 1 ? "category" : "categories"}
        </span>
      </div>
      <div className="space-y-3 overflow-y-auto">
        {sorted.map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
          return (
            <div key={item.name} className="group">
              <div className="mb-1.5 flex items-center gap-2">
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="flex-1 truncate font-sans text-sm text-foreground">
                  {item.name}
                </span>
                <span className="font-mono text-[0.7rem] tabular-nums text-text-dim">
                  {formatCurrency(item.value, currency)}
                </span>
                <span className="w-10 text-right font-mono text-[0.7rem] tabular-nums text-muted">
                  {pct.toFixed(0)}%
                </span>
              </div>
              <div className="h-[3px] overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
