import { pgTable, uuid, text, doublePrecision, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { neighborhoods } from "./neighborhoods";

export const competitors = pgTable("competitors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  foodCategory: text("food_category").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  source: text("source").notNull().default("google_maps"),
  rating: numeric("rating", { precision: 2, scale: 1 }),
  reviewCount: integer("review_count").default(0),
  priceLevel: integer("price_level"),
  deliveryFee: numeric("delivery_fee"),
  neighborhoodId: uuid("neighborhood_id").references(() => neighborhoods.id),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const competitorsRelations = relations(competitors, ({ one }) => ({
  neighborhood: one(neighborhoods, {
    fields: [competitors.neighborhoodId],
    references: [neighborhoods.id],
  }),
}));
