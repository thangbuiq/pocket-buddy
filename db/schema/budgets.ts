import {
  pgTable,
  text,
  timestamp,
  numeric,
  uuid,
  integer,
} from "drizzle-orm/pg-core";

export const budgets = pgTable("budgets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  category: text("category").notNull(),
  limitAmount: numeric("limit_amount", { precision: 12, scale: 2 }).notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
