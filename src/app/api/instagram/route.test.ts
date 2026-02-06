// ABOUTME: Tests for Instagram API route
// ABOUTME: Validates shortcode fetching and response parsing with mocked RapidAPI

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

// Mock global fetch for RapidAPI calls
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
	vi.clearAllMocks();
});

describe("POST /api/instagram", () => {
	it("returns parsed Instagram media data for valid shortcode", async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: () =>
				Promise.resolve([
					{
						urls: [{ url: "https://cdn.instagram.com/video.mp4?oe=67A12345", extension: "mp4" }],
						pictureUrl: "https://cdn.instagram.com/thumb.jpg?oe=67A12345",
						meta: {
							username: "chef123",
							sourceUrl: "https://instagram.com/reel/ABC123",
							title: "My recipe video",
						},
					},
				]),
		});

		const request = new NextRequest("http://localhost:3000/api/instagram", {
			method: "POST",
			body: JSON.stringify({ shortcode: "ABC123" }),
		});

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.username).toBe("chef123");
		expect(data.videoUrl).toBe("https://cdn.instagram.com/video.mp4?oe=67A12345");
		expect(data.thumbnail).toBe("https://cdn.instagram.com/thumb.jpg?oe=67A12345");
		expect(data.description).toBe("My recipe video");
	});

	it("returns 400 when shortcode is missing", async () => {
		const request = new NextRequest("http://localhost:3000/api/instagram", {
			method: "POST",
			body: JSON.stringify({}),
		});

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("returns 500 when RapidAPI call fails", async () => {
		mockFetch.mockRejectedValueOnce(new Error("Network error"));

		const request = new NextRequest("http://localhost:3000/api/instagram", {
			method: "POST",
			body: JSON.stringify({ shortcode: "ABC123" }),
		});

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(500);
		expect(data.error).toBeDefined();
	});

	it("parses expiration dates from CDN URLs", async () => {
		// 0x67A12345 = 1738604357 seconds
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: () =>
				Promise.resolve([
					{
						urls: [{ url: "https://cdn.instagram.com/video.mp4?oe=67A12345", extension: "mp4" }],
						pictureUrl: "https://cdn.instagram.com/thumb.jpg?oe=67A12345",
						meta: {
							username: "chef",
							sourceUrl: "https://instagram.com/reel/X",
							title: "Test",
						},
					},
				]),
		});

		const request = new NextRequest("http://localhost:3000/api/instagram", {
			method: "POST",
			body: JSON.stringify({ shortcode: "X" }),
		});

		const response = await POST(request);
		const data = await response.json();

		expect(data.videoUrlExpiresAt).toBeDefined();
		expect(data.thumbnailExpiresAt).toBeDefined();
	});
});
