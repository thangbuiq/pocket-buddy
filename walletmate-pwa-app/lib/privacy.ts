import type { Currency } from "@/lib/i18n";

export const MASKED_NUMBER = "***";

export function formatMaskedCurrency(currency: Currency | string = "VND") {
  return currency === "USD" ? `$${MASKED_NUMBER}` : `${MASKED_NUMBER} ₫`;
}
