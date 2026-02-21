// ABOUTME: Polar webhook event handlers (business logic)
// ABOUTME: Processes customer and subscription lifecycle events from Polar

import { eq } from "drizzle-orm";
import { type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { user } from "@/server/db/schema";
import type * as schema from "@/server/db/schema";

type Db = PostgresJsDatabase<typeof schema>;

async function updateSubscriptionStatus(
	db: Db,
	status: string,
	customerId: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	customer: any,
): Promise<void> {
	const externalId = customer?.externalId;
	if (externalId) {
		// Prioritise externalId (Better Auth user.id) — also stores polarCustomerId if missing
		await db
			.update(user)
			.set({ subscriptionStatus: status, polarCustomerId: customerId })
			.where(eq(user.id, externalId));
	} else {
		await db
			.update(user)
			.set({ subscriptionStatus: status })
			.where(eq(user.polarCustomerId, customerId));
	}
}

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
			await updateSubscriptionStatus(db, "active", payload.data.customerId, payload.data.customer);
			break;

		case "subscription.canceled":
			await updateSubscriptionStatus(db, "canceled", payload.data.customerId, payload.data.customer);
			break;

		case "subscription.revoked":
			await updateSubscriptionStatus(db, "revoked", payload.data.customerId, payload.data.customer);
			break;
	}
}
