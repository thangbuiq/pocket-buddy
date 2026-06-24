import type { RecurringFrequency, Transaction } from "@/types";

export type CashFlowPoint = {
  month: string;
  income: number;
  expenses: number;
  net: number;
};

export type CategorySpendPoint = {
  category: string;
  amount: number;
  percent: number;
};

export type SpendingPacePoint = {
  day: number;
  current: number | null;
  previous: number | null;
};

type CashFlowTrendOptions = {
  mode?: "month" | "year";
  month?: number;
  year?: number;
};

type SpendingPaceOptions = {
  month?: number;
  year?: number;
};

const MONTHLY_MULTIPLIER: Record<RecurringFrequency, number> = {
  daily: 30,
  weekly: 52 / 12,
  monthly: 1,
  yearly: 1 / 12,
};

function sameMonth(date: Date, year: number, month: number) {
  return date.getFullYear() === year && date.getMonth() === month;
}

function monthLabel(date: Date, language: "vi" | "en") {
  if (language === "vi") return `T${date.getMonth() + 1}`;
  return date.toLocaleString("en-US", { month: "short" });
}

export function buildCashFlowTrend(
  transactions: Transaction[],
  language: "vi" | "en",
  options: CashFlowTrendOptions = {},
): CashFlowPoint[] {
  const now = new Date();
  const mode = options.mode ?? "month";
  const anchorMonth = options.month ?? now.getMonth();
  const anchorYear = options.year ?? now.getFullYear();

  const dates =
    mode === "year"
      ? Array.from({ length: 12 }, (_, index) => new Date(anchorYear, index, 1))
      : Array.from({ length: 6 }, (_, index) => {
          const offset = 6 - index - 1;
          return new Date(anchorYear, anchorMonth - offset, 1);
        });

  return dates.map((date) => {
    const monthTransactions = transactions.filter((transaction) =>
      sameMonth(
        new Date(transaction.transactionDate),
        date.getFullYear(),
        date.getMonth(),
      ),
    );
    const income = monthTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const expenses = monthTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      month: monthLabel(date, language),
      income,
      expenses,
      net: income - expenses,
    };
  });
}

export function buildTopCategorySpend(
  transactions: Transaction[],
  limit?: number,
): CategorySpendPoint[] {
  const totals = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce<Record<string, number>>((acc, transaction) => {
      acc[transaction.category] =
        (acc[transaction.category] ?? 0) + transaction.amount;
      return acc;
    }, {});
  const total = Object.values(totals).reduce((sum, amount) => sum + amount, 0);

  if (total === 0) return [];

  const sorted = Object.entries(totals)
    .map(([category, amount]) => ({
      category,
      amount,
      percent: (amount / total) * 100,
    }))
    .sort((a, b) => b.amount - a.amount);

  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

export function buildSpendingPace(
  transactions: Transaction[],
  options: SpendingPaceOptions = {},
): SpendingPacePoint[] {
  const now = new Date();
  const currentYear = options.year ?? now.getFullYear();
  const currentMonth = options.month ?? now.getMonth();
  const previousDate = new Date(currentYear, currentMonth - 1, 1);
  const isCurrentCalendarMonth =
    currentYear === now.getFullYear() && currentMonth === now.getMonth();
  const daysInCurrentMonth = new Date(
    currentYear,
    currentMonth + 1,
    0,
  ).getDate();
  const daysInPreviousMonth = new Date(
    previousDate.getFullYear(),
    previousDate.getMonth() + 1,
    0,
  ).getDate();
  const maxDays = Math.max(daysInCurrentMonth, daysInPreviousMonth);

  const currentDaily = new Map<number, number>();
  const previousDaily = new Map<number, number>();

  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      const date = new Date(transaction.transactionDate);
      if (sameMonth(date, currentYear, currentMonth)) {
        currentDaily.set(
          date.getDate(),
          (currentDaily.get(date.getDate()) ?? 0) + transaction.amount,
        );
      }
      if (
        sameMonth(date, previousDate.getFullYear(), previousDate.getMonth())
      ) {
        previousDaily.set(
          date.getDate(),
          (previousDaily.get(date.getDate()) ?? 0) + transaction.amount,
        );
      }
    });

  let currentTotal = 0;
  let previousTotal = 0;

  return Array.from({ length: maxDays }, (_, index) => {
    const day = index + 1;
    currentTotal += currentDaily.get(day) ?? 0;
    previousTotal += previousDaily.get(day) ?? 0;

    return {
      day,
      current:
        !isCurrentCalendarMonth || day <= now.getDate() ? currentTotal : null,
      previous: day <= daysInPreviousMonth ? previousTotal : null,
    };
  });
}

export function getMonthlyRecurringExpense(transactions: Transaction[]) {
  const uniqueRecurring = new Map<string, Transaction>();

  transactions
    .filter(
      (transaction) =>
        transaction.type === "expense" &&
        transaction.recurring &&
        transaction.recurringFreq,
    )
    .forEach((transaction) => {
      const key = `${transaction.category}-${transaction.description ?? ""}-${transaction.amount}-${transaction.recurringFreq}`;
      const existing = uniqueRecurring.get(key);
      if (
        !existing ||
        new Date(transaction.transactionDate) >
          new Date(existing.transactionDate)
      ) {
        uniqueRecurring.set(key, transaction);
      }
    });

  return Array.from(uniqueRecurring.values()).reduce((sum, transaction) => {
    const freq = transaction.recurringFreq;
    if (!freq) return sum;
    return sum + transaction.amount * MONTHLY_MULTIPLIER[freq];
  }, 0);
}
