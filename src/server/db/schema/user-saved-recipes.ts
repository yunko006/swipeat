// ABOUTME: User saved recipes table
// ABOUTME: Many-to-many relationship between users and saved recipes

import { relations } from "drizzle-orm";
import {
	boolean,
	pgTableCreator,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { recipes } from "./recipes";

const swipeatTable = pgTableCreator((name) => `swipeat_${name}`);

export const userSavedRecipes = swipeatTable(
	"user_saved_recipes",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		recipeId: uuid("recipe_id")
			.notNull()
			.references(() => recipes.id, { onDelete: "cascade" }),
		savedAt: timestamp("saved_at", { withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		isFavorite: boolean("is_favorite").$defaultFn(() => false).notNull(),
		notes: text("notes"),
	},
	(t) => [unique().on(t.userId, t.recipeId)],
);

export const userSavedRecipesRelations = relations(
	userSavedRecipes,
	({ one }) => ({
		user: one(user, {
			fields: [userSavedRecipes.userId],
			references: [user.id],
		}),
		recipe: one(recipes, {
			fields: [userSavedRecipes.recipeId],
			references: [recipes.id],
		}),
	}),
);
