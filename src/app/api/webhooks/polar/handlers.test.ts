// ABOUTME: Tests for Polar webhook event handlers
// ABOUTME: Verifies customer and subscription DB updates from Polar events

import { describe, it, expect } from "vitest";
import { eq } from "drizzle-orm";
import { testDb } from "@/test/helpers/db";
import { createTestUser } from "@/test/helpers/auth";
import { user } from "@/server/db/schema";
import { handlePolarPayload } from "./handlers";

describe("handlePolarPayload: customer.created", () => {
	it("stores polarCustomerId when customer is created", async () => {
		const testUser = await createTestUser();
		const polarCustomerId = "polar-cust-123";

		await handlePolarPayload(
			{
				type: "customer.created",
				data: { id: polarCustomerId, externalId: testUser.id },
			},
			testDb as any,
		);

		const [updated] = await testDb
			.select({ polarCustomerId: user.polarCustomerId })
			.from(user)
			.where(eq(user.id, testUser.id));

		expect(updated?.polarCustomerId).toBe(polarCustomerId);
	});

	it("does nothing when externalId does not match any user", async () => {
		await expect(
			handlePolarPayload(
				{
					type: "customer.created",
					data: { id: "polar-cust-xyz", externalId: "nonexistent-user-id" },
				},
				testDb as any,
			),
		).resolves.not.toThrow();
	});

});

describe("handlePolarPayload: subscription.active", () => {
	it("sets subscriptionStatus to active", async () => {
		const polarCustomerId = "polar-cust-active-test";
		const testUser = await createTestUser();
		await testDb
			.update(user)
			.set({ polarCustomerId })
			.where(eq(user.id, testUser.id));

		await handlePolarPayload(
			{
				type: "subscription.active",
				data: { customerId: polarCustomerId, customer: { externalId: null } },
			},
			testDb as any,
		);

		const [updated] = await testDb
			.select({ subscriptionStatus: user.subscriptionStatus })
			.from(user)
			.where(eq(user.id, testUser.id));

		expect(updated?.subscriptionStatus).toBe("active");
	});

	it("sets subscriptionStatus and polarCustomerId via customer.externalId when polarCustomerId not in DB", async () => {
		const polarCustomerId = "polar-cust-no-link-test";
		const testUser = await createTestUser();

		await handlePolarPayload(
			{
				type: "subscription.active",
				data: {
					customerId: polarCustomerId,
					customer: { externalId: testUser.id },
				},
			},
			testDb as any,
		);

		const [updated] = await testDb
			.select({ subscriptionStatus: user.subscriptionStatus, polarCustomerId: user.polarCustomerId })
			.from(user)
			.where(eq(user.id, testUser.id));

		expect(updated?.subscriptionStatus).toBe("active");
		expect(updated?.polarCustomerId).toBe(polarCustomerId);
	});
});

describe("handlePolarPayload: subscription.canceled", () => {
	it("sets subscriptionStatus to canceled", async () => {
		const polarCustomerId = "polar-cust-canceled-test";
		const testUser = await createTestUser();
		await testDb
			.update(user)
			.set({ polarCustomerId, subscriptionStatus: "active" })
			.where(eq(user.id, testUser.id));

		await handlePolarPayload(
			{
				type: "subscription.canceled",
				data: { customerId: polarCustomerId, customer: { externalId: null } },
			},
			testDb as any,
		);

		const [updated] = await testDb
			.select({ subscriptionStatus: user.subscriptionStatus })
			.from(user)
			.where(eq(user.id, testUser.id));

		expect(updated?.subscriptionStatus).toBe("canceled");
	});

	it("sets subscriptionStatus and polarCustomerId via customer.externalId when polarCustomerId not in DB", async () => {
		const polarCustomerId = "polar-cust-canceled-no-link-test";
		const testUser = await createTestUser();

		await handlePolarPayload(
			{
				type: "subscription.canceled",
				data: {
					customerId: polarCustomerId,
					customer: { externalId: testUser.id },
				},
			},
			testDb as any,
		);

		const [updated] = await testDb
			.select({ subscriptionStatus: user.subscriptionStatus, polarCustomerId: user.polarCustomerId })
			.from(user)
			.where(eq(user.id, testUser.id));

		expect(updated?.subscriptionStatus).toBe("canceled");
		expect(updated?.polarCustomerId).toBe(polarCustomerId);
	});
});

describe("handlePolarPayload: subscription.revoked", () => {
	it("sets subscriptionStatus to revoked", async () => {
		const polarCustomerId = "polar-cust-revoked-test";
		const testUser = await createTestUser();
		await testDb
			.update(user)
			.set({ polarCustomerId, subscriptionStatus: "active" })
			.where(eq(user.id, testUser.id));

		await handlePolarPayload(
			{
				type: "subscription.revoked",
				data: { customerId: polarCustomerId, customer: { externalId: null } },
			},
			testDb as any,
		);

		const [updated] = await testDb
			.select({ subscriptionStatus: user.subscriptionStatus })
			.from(user)
			.where(eq(user.id, testUser.id));

		expect(updated?.subscriptionStatus).toBe("revoked");
	});

	it("sets subscriptionStatus and polarCustomerId via customer.externalId when polarCustomerId not in DB", async () => {
		const polarCustomerId = "polar-cust-revoked-no-link-test";
		const testUser = await createTestUser();

		await handlePolarPayload(
			{
				type: "subscription.revoked",
				data: {
					customerId: polarCustomerId,
					customer: { externalId: testUser.id },
				},
			},
			testDb as any,
		);

		const [updated] = await testDb
			.select({ subscriptionStatus: user.subscriptionStatus, polarCustomerId: user.polarCustomerId })
			.from(user)
			.where(eq(user.id, testUser.id));

		expect(updated?.subscriptionStatus).toBe("revoked");
		expect(updated?.polarCustomerId).toBe(polarCustomerId);
	});
});
