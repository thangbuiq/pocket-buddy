"use client";

import {
  TrendingUp,
  AlertTriangle,
  PiggyBank,
  Repeat,
  Wallet,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import type { AnalyzeInsight, InsightSeverity, InsightType } from "@/types";

const ICONS: Record<InsightType, typeof TrendingUp> = {
  trend: TrendingUp,
  anomaly: AlertTriangle,
  savings: PiggyBank,
  recurring: Repeat,
  budget: Wallet,
};

const SEVERITY_STYLES: Record<InsightSeverity, string> = {
  info: "border-primary/30 bg-primary/5 text-primary",
  warning: "border-destructive/30 bg-destructive/5 text-destructive",
  success: "border-success/30 bg-success/5 text-success",
};

export function InsightsList({
  insights,
  currency = "VND",
}: {
  insights: AnalyzeInsight[];
  currency?: string;
}) {
  const { t } = useI18n();

  if (insights.length === 0) {
    return (
      <div className="rounded-[4px] border border-border bg-card p-6">
        <p className="font-sans text-sm text-muted">{t("insightsEmpty")}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:gap-4">
      {insights.map((insight, index) => {
        const Icon = ICONS[insight.type];
        const severityStyle = SEVERITY_STYLES[insight.severity];

        return (
          <article
            key={`${insight.type}-${index}`}
            className={`flex h-full min-h-40 flex-col rounded-[4px] border p-4 transition-colors hover:opacity-90 sm:p-5 ${severityStyle}`}
          >
            <div className="mb-3 flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] opacity-80">
                {t(
                  `insightType${insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}` as TranslationKey,
                )}
              </span>
            </div>
            <h3 className="font-serif text-base leading-tight text-foreground sm:text-[1.1rem]">
              {insight.title}
            </h3>
            <p className="mt-2 flex-1 font-sans text-sm leading-6 text-foreground/80">
              {insight.description}
            </p>
            {insight.amount_impact !== undefined &&
              insight.amount_impact > 0 && (
                <p className="mt-3 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-foreground">
                  {formatCurrency(insight.amount_impact, currency)}
                  {insight.category ? ` · ${insight.category}` : null}
                </p>
              )}
          </article>
        );
      })}
    </div>
  );
}
