// ABOUTME: Polar webhook event handlers (business logic)
// ABOUTME: Processes customer and subscription lifecycle events from Polar

import { eq } from "drizzle-orm";
import { type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { user } from "@/server/db/schema";
import type * as schema from "@/server/db/schema";

type Db = PostgresJsDatabase<typeof schema>;

export async function handlePolarPayload(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	payload: any,
	db: Db,
): Promise<void> {
	switch (payload.type) {
		case "customer.created":
			// externalId = notre user.id, lié par createCustomerOnSignUp dans better-auth config
			await db
				.update(user)
				.set({ polarCustomerId: payload.data.id })
				.where(eq(user.id, payload.data.externalId));
			break;

		case "subscription.active":
			await db
				.update(user)
				.set({ subscriptionStatus: "active" })
				.where(eq(user.polarCustomerId, payload.data.customerId));
			break;

		case "subscription.canceled":
			await db
				.update(user)
				.set({ subscriptionStatus: "canceled" })
				.where(eq(user.polarCustomerId, payload.data.customerId));
			break;

		case "subscription.revoked":
			await db
				.update(user)
				.set({ subscriptionStatus: "revoked" })
				.where(eq(user.polarCustomerId, payload.data.customerId));
			break;
	}
}
