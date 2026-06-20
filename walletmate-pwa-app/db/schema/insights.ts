import {
  pgTable,
  text,
  timestamp,
  jsonb,
  uuid,
  date,
} from "drizzle-orm/pg-core";

export const insights = pgTable("insights", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  date: date("date").notNull(), // format YYYY-MM-DD
  content: jsonb("content").notNull(),
  language: text("language").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
