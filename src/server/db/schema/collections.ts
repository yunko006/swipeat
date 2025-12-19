// ABOUTME: Collections table
// ABOUTME: User-created folders to organize saved recipes

import { relations } from "drizzle-orm";
import {
	pgTableCreator,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

const swipeatTable = pgTableCreator((name) => `swipeat_${name}`);

export const collections = swipeatTable(
	"collections",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		description: text("description"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [unique().on(t.userId, t.name)],
);

export const collectionsRelations = relations(collections, ({ one }) => ({
	user: one(user, {
		fields: [collections.userId],
		references: [user.id],
	}),
}));
