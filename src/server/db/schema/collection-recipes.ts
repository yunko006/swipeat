// ABOUTME: Collection recipes junction table
// ABOUTME: Many-to-many relationship between collections and recipes

import { relations } from "drizzle-orm";
import {
	pgTableCreator,
	primaryKey,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { collections } from "./collections";
import { recipes } from "./recipes";

const swipeatTable = pgTableCreator((name) => `swipeat_${name}`);

export const collectionRecipes = swipeatTable(
	"collection_recipes",
	{
		collectionId: uuid("collection_id")
			.notNull()
			.references(() => collections.id, { onDelete: "cascade" }),
		recipeId: uuid("recipe_id")
			.notNull()
			.references(() => recipes.id, { onDelete: "cascade" }),
		addedAt: timestamp("added_at", { withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [primaryKey({ columns: [t.collectionId, t.recipeId] })],
);

export const collectionRecipesRelations = relations(
	collectionRecipes,
	({ one }) => ({
		collection: one(collections, {
			fields: [collectionRecipes.collectionId],
			references: [collections.id],
		}),
		recipe: one(recipes, {
			fields: [collectionRecipes.recipeId],
			references: [recipes.id],
		}),
	}),
);
