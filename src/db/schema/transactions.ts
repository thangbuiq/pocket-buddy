import { pgTable, text, timestamp, numeric, uuid, date, boolean } from "drizzle-orm/pg-core";

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description"),
  transactionDate: date("transaction_date").notNull(),
  recurring: boolean("recurring").default(false),
  recurringFreq: text("recurring_freq"),
  syncStatus: text("sync_status").default("synced"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
