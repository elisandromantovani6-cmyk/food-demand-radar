import { pgTable, uuid, text, numeric, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { restaurants } from "./restaurants";

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id).notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("draft"),
  triggerType: text("trigger_type"),
  targetNeighborhoodIds: text("target_neighborhood_ids").array(),
  targetRadiusKm: numeric("target_radius_km"),
  budgetDaily: numeric("budget_daily"),
  copyTitle: text("copy_title"),
  copyBody: text("copy_body"),
  offer: jsonb("offer"),
  platforms: text("platforms").array(),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  cost: numeric("cost").default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campaignsRelations = relations(campaigns, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [campaigns.restaurantId],
    references: [restaurants.id],
  }),
}));
