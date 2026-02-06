// ABOUTME: Tests for cron job that refreshes expiring Instagram URLs
// ABOUTME: Validates authentication, DB queries, and URL refresh logic

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { createTestUser } from "@/test/helpers/auth";
import { createTestRecipe } from "@/test/helpers/recipes";

// Mock global fetch for RapidAPI calls
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
	vi.clearAllMocks();
});

describe("GET /api/cron/refresh-expiring-urls", () => {
	it("returns 401 without Bearer token when CRON_SECRET is set", async () => {
		const request = new NextRequest(
			"http://localhost:3000/api/cron/refresh-expiring-urls",
			{ method: "GET" },
		);

		const response = await GET(request);

		expect(response.status).toBe(401);
	});

	it("returns 401 with wrong Bearer token", async () => {
		const request = new NextRequest(
			"http://localhost:3000/api/cron/refresh-expiring-urls",
			{
				method: "GET",
				headers: {
					authorization: "Bearer wrong-token",
				},
			},
		);

		const response = await GET(request);

		expect(response.status).toBe(401);
	});

	it("refreshes recipes with expiring URLs", async () => {
		const user = await createTestUser();
		const expiringDate = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12h from now (within 24h buffer)
		await createTestRecipe(user, {
			sourceUrl: "https://instagram.com/reel/EXPIRE1",
			sourcePlatform: "instagram",
			videoUrl: "https://cdn.instagram.com/old-video.mp4?oe=00000001",
			videoUrlExpiresAt: expiringDate,
		});

		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: () =>
				Promise.resolve([
					{
						urls: [
							{
								url: "https://cdn.instagram.com/new-video.mp4?oe=68393E00",
								extension: "mp4",
							},
						],
						pictureUrl:
							"https://cdn.instagram.com/new-thumb.jpg?oe=68393E00",
					},
				]),
		});

		const request = new NextRequest(
			"http://localhost:3000/api/cron/refresh-expiring-urls",
			{
				method: "GET",
				headers: {
					authorization:
						"Bearer test-cron-secret",
				},
			},
		);

		const response = await GET(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.success).toBe(true);
		expect(data.refreshedCount).toBe(1);
	});

	it("handles Instagram API errors gracefully", async () => {
		const user = await createTestUser();
		const expiringDate = new Date(Date.now() + 12 * 60 * 60 * 1000);
		await createTestRecipe(user, {
			sourceUrl: "https://instagram.com/reel/ERRORRECIPE",
			sourcePlatform: "instagram",
			videoUrl: "https://cdn.instagram.com/video.mp4?oe=00000001",
			videoUrlExpiresAt: expiringDate,
		});

		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 429,
		});

		const request = new NextRequest(
			"http://localhost:3000/api/cron/refresh-expiring-urls",
			{
				method: "GET",
				headers: {
					authorization:
						"Bearer test-cron-secret",
				},
			},
		);

		const response = await GET(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.success).toBe(true);
		expect(data.refreshedCount).toBe(0);
		expect(data.errors).toBeDefined();
		expect(data.errors!.length).toBeGreaterThan(0);
	});
});
