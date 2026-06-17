"use client";

import { Flame } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { SpendingStreak } from "@/types";

export function SpendingStreakCard({ streak }: { streak: SpendingStreak }) {
  const { t } = useI18n();

  return (
    <article className="card-shadow rounded-[4px] border border-border bg-card p-5 transition-colors hover:border-muted">
      <div className="mb-3 flex items-center gap-2">
        <Flame className="h-4 w-4 text-primary" />
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted">
          {t("streakTitle")}
        </p>
      </div>

      {streak.currentStreak > 0 ? (
        <>
          <p className="font-serif text-[1.75rem] leading-none text-foreground">
            {streak.currentStreak}
            <span className="ml-1 font-sans text-sm text-muted">
              {t("streakCurrent")}
            </span>
          </p>
          <p className="mt-3 font-sans text-sm text-foreground">
            {t("streakCurrent")}: {streak.currentStreak} · {t("streakLongest")}:{" "}
            {streak.longestStreak}
          </p>
        </>
      ) : (
        <p className="font-sans text-sm text-muted">{t("streakEmpty")}</p>
      )}
    </article>
  );
}
