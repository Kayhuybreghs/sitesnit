import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const inquiries = sqliteTable("inquiries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  website: text("website"),
  packageId: text("package_id"),
  message: text("message").notNull(),
  toolSummary: text("tool_summary"),
  createdAt: integer("created_at").notNull(),
});
export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  resetAt: integer("reset_at").notNull(),
});
export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  createdAt: integer("created_at").notNull(),
});
