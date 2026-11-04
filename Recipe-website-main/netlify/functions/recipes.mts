import type { Config } from "@netlify/functions";
import { asc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { recipes } from "../../db/schema.js";

class ValidationError extends Error {}

function text(value: unknown, field: string, maxLength: number, required = true): string {
  if (typeof value !== "string") throw new ValidationError(`${field} must be text`);
  const result = value.trim();
  if (required && !result) throw new ValidationError(`${field} is required`);
  if (result.length > maxLength) throw new ValidationError(`${field} is too long`);
  return result;
}

function validateRecipe(input: any) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ValidationError("Recipe must be a JSON object");
  }
  const dish = text(input.dish, "Dish type", 20);
  if (!["Main", "Dessert", "Drink", "Side", "Snack"].includes(dish)) {
    throw new ValidationError("Choose a valid dish type");
  }
  const difficulty = text(input.difficulty, "Difficulty", 10);
  if (!["easy", "medium", "hard"].includes(difficulty)) {
    throw new ValidationError("Choose a valid difficulty");
  }
  if (!Array.isArray(input.ingredients) || input.ingredients.length < 1 || input.ingredients.length > 60) {
    throw new ValidationError("Add between 1 and 60 ingredients");
  }
  if (!Array.isArray(input.steps) || input.steps.length < 1 || input.steps.length > 60) {
    throw new ValidationError("Add between 1 and 60 instruction steps");
  }
  const image = text(input.image ?? "", "Photo URL", 500, false);
  if (image) {
    let imageUrl: URL;
    try {
      imageUrl = new URL(image);
    } catch {
      throw new ValidationError("Photo URL must be a valid web URL");
    }
    if (!["http:", "https:"].includes(imageUrl.protocol)) {
      throw new ValidationError("Photo URL must use HTTP or HTTPS");
    }
  }

  return {
    name: text(input.name, "Recipe name", 80),
    cuisine: text(input.cuisine, "Cuisine or category", 50),
    dish,
    difficulty,
    description: text(input.description, "Description", 300),
    image,
    prepTime: text(input.prepTime, "Prep time", 30),
    cookTime: text(input.cookTime, "Cook time", 30),
    servings: text(input.servings, "Servings", 20),
    contributor: text(input.contributor ?? "", "Your name", 50, false),
    ingredients: input.ingredients.map((item: unknown, i: number) => text(item, `Ingredient ${i + 1}`, 200)),
    steps: input.steps.map((item: unknown, i: number) => text(item, `Step ${i + 1}`, 500)),
  };
}

const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { "Cache-Control": "no-store" } });

export default async (req: Request) => {
  if (req.method === "GET") {
    try {
      const rows = await db.select().from(recipes).orderBy(asc(recipes.createdAt));
      return json(rows.map(r => ({ ...r, totalTime: "" })));
    } catch (error) {
      console.error("Could not load recipes:", error);
      return json({ error: "Could not load community recipes" }, 500);
    }
  }

  if (req.method === "POST") {
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers.get("content-type") || "")) {
      return json({ error: "Send recipe data as JSON" }, 415);
    }
    const body = await req.text();
    if (body.length > 64 * 1024) return json({ error: "Request body is too large" }, 413);
    try {
      const values = validateRecipe(JSON.parse(body));
      const [row] = await db.insert(recipes).values(values).returning();
      return json({ ...row, totalTime: "" }, 201);
    } catch (error) {
      if (error instanceof SyntaxError || error instanceof ValidationError) {
        return json({ error: error.message }, 400);
      }
      console.error("Could not add recipe:", error);
      return json({ error: "Could not save your recipe" }, 500);
    }
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config: Config = {
  path: "/api/recipes",
};
