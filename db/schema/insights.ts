import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const insights = pgTable("insights", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity"),
  dismissed: boolean("dismissed").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
