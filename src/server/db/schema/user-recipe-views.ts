// ABOUTME: User recipe views table
// ABOUTME: Tracks recipe view history for recently viewed feature

import { relations } from "drizzle-orm";
import { index, pgTableCreator, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { recipes } from "./recipes";

const swipeatTable = pgTableCreator((name) => `swipeat_${name}`);

export const userRecipeViews = swipeatTable(
	"user_recipe_views",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		recipeId: uuid("recipe_id")
			.notNull()
			.references(() => recipes.id, { onDelete: "cascade" }),
		viewedAt: timestamp("viewed_at", { withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [index("user_views_idx").on(t.userId, t.viewedAt)],
);

export const userRecipeViewsRelations = relations(
	userRecipeViews,
	({ one }) => ({
		user: one(user, {
			fields: [userRecipeViews.userId],
			references: [user.id],
		}),
		recipe: one(recipes, {
			fields: [userRecipeViews.recipeId],
			references: [recipes.id],
		}),
	}),
);
