import type {
  CandidateTransaction,
  HistoricalTransaction,
  RecurringFrequency,
  SpendingStreak,
  Transaction,
} from "@/types";

export function normalizeDescription(description: string | undefined): string {
  return (description ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesRecurringPattern(
  transactions: Transaction[],
  description: string | undefined,
  amount: number,
): boolean {
  const normalized = normalizeDescription(description);
  if (!normalized) return false;

  const matches = transactions.filter(
    (t) =>
      t.type === "expense" &&
      Math.abs(t.amount - amount) < 0.01 &&
      normalizeDescription(t.description) === normalized,
  );

  return matches.length >= 3;
}

export function buildRecurringHistory(
  transactions: Transaction[],
): HistoricalTransaction[] {
  return transactions.map((t) => ({
    type: t.type,
    amount: t.amount,
    category: t.category,
    description: t.description ?? "",
    transactionDate: t.transactionDate,
  }));
}

export function buildCandidateTransaction(
  input: Omit<CandidateTransaction, "type"> & { type?: "income" | "expense" },
): CandidateTransaction {
  return {
    type: input.type ?? "expense",
    amount: input.amount,
    category: input.category,
    description: input.description ?? "",
    transactionDate: input.transactionDate,
  };
}

function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function getRecentHistoryForSuggestion(
  transactions: Transaction[],
  candidateDate: string,
): HistoricalTransaction[] {
  const candidate = parseLocalDate(candidateDate);
  const currentYear = candidate.getFullYear();
  const currentMonth = candidate.getMonth();

  let previousMonth = currentMonth - 1;
  let previousYear = currentYear;
  if (previousMonth < 0) {
    previousMonth = 11;
    previousYear -= 1;
  }

  const filtered = transactions.filter((t) => {
    const d = parseLocalDate(t.transactionDate);
    const year = d.getFullYear();
    const month = d.getMonth();
    return (
      (year === currentYear && month === currentMonth) ||
      (year === previousYear && month === previousMonth)
    );
  });

  return buildRecurringHistory(filtered);
}

const FREQUENCY_MULTIPLIER: Record<RecurringFrequency, number> = {
  daily: 30,
  weekly: 4.33,
  monthly: 1,
  yearly: 1 / 12,
};

export function getMonthlyRecurringTotal(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => {
    if (!t.recurring || !t.recurringFreq) return sum;
    return sum + t.amount * FREQUENCY_MULTIPLIER[t.recurringFreq];
  }, 0);
}

export function computeSpendingStreak(
  transactions: Transaction[],
): SpendingStreak {
  if (transactions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const dates = new Set(
    transactions.map((t) => {
      const d = parseLocalDate(t.transactionDate);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }),
  );

  const sortedDates = Array.from(dates)
    .map((d) => new Date(d + "T00:00:00"))
    .sort((a, b) => b.getTime() - a.getTime());

  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneDay = 24 * 60 * 60 * 1000;

  function daysBetween(a: Date, b: Date): number {
    return Math.round((a.getTime() - b.getTime()) / oneDay);
  }

  // Current streak: count consecutive days ending today or yesterday.
  let currentStreak = 1;
  const mostRecent = sortedDates[0];
  const daysSinceMostRecent = daysBetween(today, mostRecent);

  if (daysSinceMostRecent > 1) {
    currentStreak = 0;
  } else {
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = sortedDates[i - 1];
      const curr = sortedDates[i];
      if (daysBetween(prev, curr) === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Longest streak.
  let longestStreak = 1;
  let runningStreak = 1;
  const ascendingDates = [...sortedDates].reverse();
  for (let i = 1; i < ascendingDates.length; i++) {
    const prev = ascendingDates[i - 1];
    const curr = ascendingDates[i];
    if (daysBetween(curr, prev) === 1) {
      runningStreak++;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      runningStreak = 1;
    }
  }

  return {
    currentStreak,
    longestStreak,
    lastTransactionDate: sortedDates[0].toISOString().slice(0, 10),
  };
}
