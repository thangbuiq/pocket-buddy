import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "VND") {
  const locale = currency === "VND" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    value,
  );
}

export function formatNumberInput(
  value: number,
  language: "vi" | "en",
): string {
  const locale = language === "vi" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function parseNumberInput(input: string): number {
  const cleaned = input.trim().replace(/\s/g, "");
  if (!cleaned) return 0;

  // Find the last comma or dot to determine decimal separator.
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const lastSeparator = Math.max(lastComma, lastDot);

  let normalized = cleaned;
  if (lastSeparator > 0) {
    const afterSeparator = cleaned.slice(lastSeparator + 1);
    // Treat as decimal only if 1-2 digits follow the last separator.
    if (/^\d{1,2}$/.test(afterSeparator)) {
      const prefix = cleaned.slice(0, lastSeparator);
      normalized = `${prefix.replace(/[,.]/g, "")}.${afterSeparator}`;
    } else {
      normalized = cleaned.replace(/[,.]/g, "");
    }
  } else if (lastSeparator === 0) {
    normalized = cleaned.replace(/[,.]/g, "");
  }

  const value = parseFloat(normalized.replace(/[^\d.]/g, ""));
  return Number.isFinite(value) ? value : 0;
}
