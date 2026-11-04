import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const recipes = pgTable("recipes", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  cuisine: text().notNull(),
  dish: text().notNull(),
  difficulty: text().notNull(),
  description: text().notNull(),
  image: text().notNull().default(""),
  prepTime: text("prep_time").notNull(),
  cookTime: text("cook_time").notNull(),
  servings: text().notNull(),
  contributor: text().notNull().default(""),
  ingredients: jsonb().$type<string[]>().notNull(),
  steps: jsonb().$type<string[]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
