// ABOUTME: Recipes table
// ABOUTME: Central table storing recipe data extracted from social media videos

import { relations } from "drizzle-orm";
import {
	integer,
	jsonb,
	pgTableCreator,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { sourcePlatformEnum } from "./enums";

const swipeatTable = pgTableCreator((name) => `swipeat_${name}`);

export const recipes = swipeatTable("recipes", {
	id: uuid("id").primaryKey().defaultRandom(),
	sourceUrl: text("source_url").notNull().unique(),
	sourcePlatform: sourcePlatformEnum("source_platform").notNull(),
	videoUrl: text("video_url"),
	videoUrlExpiresAt: timestamp("video_url_expires_at", { withTimezone: true }),
	title: text("title").notNull(),
	description: text("description"),
	imageUrl: text("image_url"),
	imageUrlExpiresAt: timestamp("image_url_expires_at", { withTimezone: true }),
	ingredients: jsonb("ingredients").notNull().$type<
		Array<{
			name: string;
			quantity?: string;
			unit?: string;
			notes?: string;
		}>
	>(),
	steps: jsonb("steps").notNull().$type<
		Array<{
			order: number;
			instruction: string;
			durationMinutes?: number;
			videoStartTime?: number;
			videoEndTime?: number;
			videoClipUrl?: string;
		}>
	>(),
	originalSteps: jsonb("original_steps").$type<
		Array<{
			order: number;
			instruction: string;
			durationMinutes?: number;
			videoStartTime?: number;
			videoEndTime?: number;
			videoClipUrl?: string;
		}>
	>(),
	prepTimeMinutes: integer("prep_time_minutes"),
	cookTimeMinutes: integer("cook_time_minutes"),
	servings: integer("servings"),
	extractionModel: text("extraction_model"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.$defaultFn(() => new Date())
		.notNull(),
	createdByUserId: text("created_by_user_id").references(() => user.id, {
		onDelete: "set null",
	}),
});

export const recipesRelations = relations(recipes, ({ one }) => ({
	createdBy: one(user, {
		fields: [recipes.createdByUserId],
		references: [user.id],
	}),
}));
