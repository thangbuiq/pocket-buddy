"use client";

import { Flame } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { SpendingStreak } from "@/types";

export function SpendingStreakCard({ streak }: { streak: SpendingStreak }) {
  const { t } = useI18n();

  if (streak.currentStreak === 0 && streak.longestStreak === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-1 py-2">
      <Flame className="h-3.5 w-3.5 text-primary shrink-0" />
      {streak.currentStreak > 0 ? (
        <p className="font-sans text-xs text-muted leading-relaxed">
          <span className="text-foreground font-medium tabular-nums">
            {streak.currentStreak}
          </span>{" "}
          {t("streakCurrent").toLowerCase()}
          <span className="mx-1.5 text-border">·</span>
          {t("streakLongest").toLowerCase()}{" "}
          <span className="text-foreground font-medium tabular-nums">
            {streak.longestStreak}
          </span>
        </p>
      ) : (
        <p className="font-sans text-xs text-muted leading-relaxed italic">
          {t("streakEmpty")}
        </p>
      )}
    </div>
  );
}
