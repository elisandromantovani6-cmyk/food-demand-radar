import { pgTable, serial, uuid, text, integer, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { restaurants } from "./restaurants";

export const forecasts = pgTable("forecasts", {
  id: serial("id").primaryKey(),
  time: timestamp("time").notNull().defaultNow(),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id),
  forecastHorizon: text("forecast_horizon").notNull(),
  predictedOrders: integer("predicted_orders"),
  predictedRevenue: numeric("predicted_revenue"),
  confidence: numeric("confidence", { precision: 3, scale: 2 }),
  featuresUsed: jsonb("features_used"),
  actualOrders: integer("actual_orders"),
  actualRevenue: numeric("actual_revenue"),
});

export const forecastsRelations = relations(forecasts, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [forecasts.restaurantId],
    references: [restaurants.id],
  }),
}));
