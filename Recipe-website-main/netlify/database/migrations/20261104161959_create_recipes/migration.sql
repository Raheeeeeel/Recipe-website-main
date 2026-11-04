CREATE TABLE "recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"cuisine" text NOT NULL,
	"dish" text NOT NULL,
	"difficulty" text NOT NULL,
	"description" text NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"prep_time" text NOT NULL,
	"cook_time" text NOT NULL,
	"servings" text NOT NULL,
	"contributor" text DEFAULT '' NOT NULL,
	"ingredients" jsonb NOT NULL,
	"steps" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
