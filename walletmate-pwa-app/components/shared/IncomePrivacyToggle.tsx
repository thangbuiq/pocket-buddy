"use client";

import { Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function IncomePrivacyToggle({
  isVisible,
  onToggle,
  className = "",
}: {
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const { t } = useI18n();
  const Icon = isVisible ? Eye : EyeOff;
  const label = isVisible ? t("hideIncomeAmounts") : t("showIncomeAmounts");

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[3px] border border-dashed border-muted bg-card px-3 font-mono text-[0.65rem] uppercase tracking-[0.08em] text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary ${className}`}
      aria-label={label}
      title={label}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
