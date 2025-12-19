// ABOUTME: Recipe likes table
// ABOUTME: Tracks which users liked which recipes

import { relations } from "drizzle-orm";
import {
	pgTableCreator,
	primaryKey,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { recipes } from "./recipes";

const swipeatTable = pgTableCreator((name) => `swipeat_${name}`);

export const recipeLikes = swipeatTable(
	"recipe_likes",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		recipeId: uuid("recipe_id")
			.notNull()
			.references(() => recipes.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [primaryKey({ columns: [t.userId, t.recipeId] })],
);

export const recipeLikesRelations = relations(recipeLikes, ({ one }) => ({
	user: one(user, {
		fields: [recipeLikes.userId],
		references: [user.id],
	}),
	recipe: one(recipes, {
		fields: [recipeLikes.recipeId],
		references: [recipes.id],
	}),
}));
