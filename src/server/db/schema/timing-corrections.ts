// ABOUTME: Timing corrections table
// ABOUTME: User-submitted corrections for recipe step video timestamps

import { relations } from "drizzle-orm";
import {
	integer,
	pgEnum,
	pgTableCreator,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { recipes } from "./recipes";

const swipeatTable = pgTableCreator((name) => `swipeat_${name}`);

export const timingCorrectionStatusEnum = pgEnum("timing_correction_status", [
	"pending",
	"accepted",
	"rejected",
]);

export const timingCorrections = swipeatTable("timing_corrections", {
	id: uuid("id").primaryKey().defaultRandom(),
	recipeId: uuid("recipe_id")
		.notNull()
		.references(() => recipes.id, { onDelete: "cascade" }),
	stepIndex: integer("step_index").notNull(),
	suggestedStartTime: integer("suggested_start_time").notNull(),
	suggestedEndTime: integer("suggested_end_time").notNull(),
	createdByUserId: text("created_by_user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	status: timingCorrectionStatusEnum("status").default("pending").notNull(),
	upvotes: integer("upvotes").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.$defaultFn(() => new Date())
		.notNull(),
});

export const timingCorrectionsRelations = relations(
	timingCorrections,
	({ one }) => ({
		recipe: one(recipes, {
			fields: [timingCorrections.recipeId],
			references: [recipes.id],
		}),
		createdBy: one(user, {
			fields: [timingCorrections.createdByUserId],
			references: [user.id],
		}),
	}),
);
