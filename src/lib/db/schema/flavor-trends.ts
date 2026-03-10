import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";

export const flavorTrends = pgTable("flavor_trends", {
  id: serial("id").primaryKey(),
  time: timestamp("time").notNull().defaultNow(),
  city: text("city").notNull(),
  foodCategory: text("food_category").notNull(),
  flavor: text("flavor").notNull(),
  trendScore: numeric("trend_score", { precision: 5, scale: 2 }),
  velocity: numeric("velocity", { precision: 5, scale: 2 }),
  searchVolume: numeric("search_volume"),
  socialMentions: integer("social_mentions").default(0),
  salesGrowthPct: numeric("sales_growth_pct", { precision: 5, scale: 2 }),
});
