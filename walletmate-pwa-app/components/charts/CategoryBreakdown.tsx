"use client";

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

export function CategoryBreakdown({
  data,
  currency = "VND",
}: {
  data: CategorySpendPoint[];
  currency?: string;
}) {
  const { t } = useI18n();
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-[4px] border border-border bg-card">
        <p className="font-mono text-sm text-muted">{t("noExpenseData")}</p>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.amount - a.amount);

  return (
    <div className="flex h-80 flex-col rounded-[4px] border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 flex shrink-0 items-baseline justify-between">
        <h3 className="font-serif text-lg text-foreground">
          {t("topCategories")}
        </h3>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-muted">
          {sorted.length} {t("categoriesCount")}
        </span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {sorted.map((item, i) => {
          const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
          return (
            <div key={item.category} className="group">
              <div className="mb-1.5 flex items-center gap-2">
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="flex-1 truncate font-sans text-sm text-foreground">
                  {item.category}
                </span>
                <span className="font-mono text-[0.7rem] tabular-nums text-text-dim [overflow-wrap:anywhere]">
                  {formatCurrency(item.amount, currency)}
                </span>
                <span className="w-10 text-right font-mono text-[0.7rem] tabular-nums text-muted">
                  {item.percent.toFixed(0)}%
                </span>
              </div>
              <div className="h-[3px] overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${item.percent}%`,
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
