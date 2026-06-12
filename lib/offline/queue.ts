import { openDB } from "idb";
import type { TransactionInput } from "@/lib/validations/transactions";

const DB_NAME = "pocket-buddy-offline";
const STORE = "transaction-queue";

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    },
  });
}

export async function enqueueTransaction(payload: TransactionInput) {
  const db = await getDb();
  await db.put(STORE, {
    id: crypto.randomUUID(),
    payload,
    syncStatus: "pending",
    createdAt: Date.now(),
  });
}

export async function syncQueuedTransactions() {
  const db = await getDb();
  const all = await db.getAll(STORE);

  for (const item of all) {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item.payload, syncStatus: "synced" }),
    });

    if (response.ok) {
      await db.delete(STORE, item.id);
    }
  }
}
