import { pgTable, serial, text, uuid, numeric, integer, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { neighborhoods } from "./neighborhoods";

export const demandScores = pgTable("demand_scores", {
  id: serial("id").primaryKey(),
  time: timestamp("time").notNull().defaultNow(),
  h3Index: text("h3_index").notNull(),
  foodCategory: text("food_category").notNull().default("pizza"),
  neighborhoodId: uuid("neighborhood_id").references(() => neighborhoods.id),
  demandScore: numeric("demand_score", { precision: 5, scale: 2 }),
  hungerScore: numeric("hunger_score", { precision: 5, scale: 2 }),
  searchVolume: numeric("search_volume"),
  socialMentions: integer("social_mentions").default(0),
  weatherBoost: numeric("weather_boost", { precision: 3, scale: 2 }).default("0"),
  eventBoost: numeric("event_boost", { precision: 3, scale: 2 }).default("0"),
}, (table) => [
  index("idx_demand_time").on(table.time),
  index("idx_demand_h3").on(table.h3Index),
  index("idx_demand_neighborhood").on(table.neighborhoodId),
]);

export const demandScoresRelations = relations(demandScores, ({ one }) => ({
  neighborhood: one(neighborhoods, {
    fields: [demandScores.neighborhoodId],
    references: [neighborhoods.id],
  }),
}));
