// ABOUTME: Recipe comments table
// ABOUTME: User comments and feedback on recipes

import { relations } from "drizzle-orm";
import { pgTableCreator, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { recipes } from "./recipes";

const swipeatTable = pgTableCreator((name) => `swipeat_${name}`);

export const recipeComments = swipeatTable("recipe_comments", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	recipeId: uuid("recipe_id")
		.notNull()
		.references(() => recipes.id, { onDelete: "cascade" }),
	content: text("content").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
		() => new Date(),
	),
});

export const recipeCommentsRelations = relations(
	recipeComments,
	({ one }) => ({
		user: one(user, {
			fields: [recipeComments.userId],
			references: [user.id],
		}),
		recipe: one(recipes, {
			fields: [recipeComments.recipeId],
			references: [recipes.id],
		}),
	}),
);
