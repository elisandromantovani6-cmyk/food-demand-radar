import { pgTable, uuid, text, integer, numeric, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { demandScores } from "./demand-scores";
import { competitors } from "./competitors";

export const neighborhoods = pgTable("neighborhoods", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  city: text("city").notNull().default("Tangara da Serra"),
  state: text("state").notNull().default("MT"),
  population: integer("population"),
  avgIncome: numeric("avg_income"),
  apartmentRatio: numeric("apartment_ratio"),
  universityCount: integer("university_count").default(0),
  youngAdultRatio: numeric("young_adult_ratio"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const neighborhoodsRelations = relations(neighborhoods, ({ many }) => ({
  demandScores: many(demandScores),
  competitors: many(competitors),
}));
