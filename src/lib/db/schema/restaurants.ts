import { pgTable, uuid, text, doublePrecision, numeric, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { campaigns } from "./campaigns";
import { alerts } from "./alerts";
import { forecasts } from "./forecasts";

export const restaurants = pgTable("restaurants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  foodCategory: text("food_category").notNull().default("pizza"),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  address: text("address"),
  city: text("city").notNull().default("Tangara da Serra"),
  state: text("state").notNull().default("MT"),
  deliveryRadiusKm: numeric("delivery_radius_km").default("5"),
  plan: text("plan").notNull().default("starter"),
  userId: text("user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  campaigns: many(campaigns),
  alerts: many(alerts),
  forecasts: many(forecasts),
}));
