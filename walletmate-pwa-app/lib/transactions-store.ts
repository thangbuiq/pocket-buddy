import { db } from "@/db";
import { transactions } from "@/db/schema";
import { mockStore } from "@/lib/mock-db";
import { computeSpendingStreak } from "@/lib/transaction-helpers";
import type { TransactionInput } from "@/lib/validations/transactions";
import type {
  RecurringFrequency,
  SpendingStreak,
  SyncStatus,
  Transaction,
  TransactionType,
} from "@/types";
import { desc, eq } from "drizzle-orm";

export const DEMO_USER_ID = "demo-user";

export function isDemoUser(userId: string): boolean {
  return userId === DEMO_USER_ID;
}

function normalizeAmount(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  return 0;
}

function mapDbTransaction(row: typeof transactions.$inferSelect): Transaction {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type as TransactionType,
    amount: normalizeAmount(row.amount),
    category: row.category,
    description: row.description ?? undefined,
    transactionDate: row.transactionDate,
    recurring: row.recurring ?? false,
    recurringFreq: (row.recurringFreq as RecurringFrequency) ?? undefined,
    syncStatus: (row.syncStatus as SyncStatus) ?? "synced",
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  if (isDemoUser(userId)) {
    return mockStore.transactions
      .filter((transaction) => transaction.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime(),
      );
  }

  const rows = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.transactionDate));

  return rows.map(mapDbTransaction);
}

export async function createTransaction(
  userId: string,
  input: TransactionInput,
): Promise<Transaction> {
  const now = new Date().toISOString();

  if (isDemoUser(userId)) {
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      userId,
      type: input.type,
      amount: input.amount,
      category: input.category,
      description: input.description,
      transactionDate: input.transactionDate,
      recurring: input.recurring ?? false,
      recurringFreq: input.recurringFreq,
      syncStatus: input.syncStatus ?? "synced",
      createdAt: now,
      updatedAt: now,
    };
    mockStore.transactions.unshift(transaction);
    return transaction;
  }

  const rows = await db
    .insert(transactions)
    .values({
      userId,
      type: input.type,
      amount: String(input.amount),
      category: input.category,
      description: input.description,
      transactionDate: input.transactionDate,
      recurring: input.recurring,
      recurringFreq: input.recurringFreq,
      syncStatus: input.syncStatus,
    })
    .returning();

  return mapDbTransaction(rows[0]);
}

export async function updateTransaction(
  userId: string,
  id: string,
  input: TransactionInput,
): Promise<Transaction | null> {
  if (isDemoUser(userId)) {
    const index = mockStore.transactions.findIndex(
      (item) => item.id === id && item.userId === userId,
    );
    if (index < 0) return null;

    mockStore.transactions[index] = {
      ...mockStore.transactions[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return mockStore.transactions[index];
  }

  const rows = await db
    .update(transactions)
    .set({
      type: input.type,
      amount: String(input.amount),
      category: input.category,
      description: input.description,
      transactionDate: input.transactionDate,
      recurring: input.recurring,
      recurringFreq: input.recurringFreq,
      syncStatus: input.syncStatus,
      updatedAt: new Date(),
    })
    .where(eq(transactions.id, id))
    .returning();

  if (rows.length === 0) return null;

  // Verify ownership by checking the returned row's userId.
  const row = rows[0];
  if (row.userId !== userId) return null;

  return mapDbTransaction(row);
}

export async function deleteTransaction(
  userId: string,
  id: string,
): Promise<Transaction | null> {
  if (isDemoUser(userId)) {
    const index = mockStore.transactions.findIndex(
      (item) => item.id === id && item.userId === userId,
    );
    if (index < 0) return null;

    const [removed] = mockStore.transactions.splice(index, 1);
    return removed;
  }

  // Use a delete-returning query and verify ownership afterward.
  const rows = await db
    .delete(transactions)
    .where(eq(transactions.id, id))
    .returning();

  if (rows.length === 0) return null;

  const row = rows[0];
  if (row.userId !== userId) return null;

  return mapDbTransaction(row);
}

export async function getSpendingStreak(
  userId: string,
): Promise<SpendingStreak> {
  const userTransactions = await getTransactions(userId);
  return computeSpendingStreak(userTransactions);
}
