// ABOUTME: Cron job endpoint to refresh Instagram URLs that are about to expire
// ABOUTME: Finds recipes with expiring URLs and refreshes them proactively

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import { recipes } from "@/server/db/schema";
import { sql, or, lt, isNotNull, eq } from "drizzle-orm";
import { env } from "@/env";
import { parseInstagramUrlExpiration } from "@/lib/instagram/parse-expiration";

interface CronResponse {
  success: boolean;
  refreshedCount: number;
  errors?: string[];
}

// Extract shortcode from Instagram URL
function extractShortcode(instagramUrl: string): string | null {
  const match = instagramUrl.match(/\/(p|reel)\/([A-Za-z0-9_-]+)/);
  return match?.[2] ?? null;
}

export async function GET(request: NextRequest) {
  // Verify this is a legitimate Vercel cron request
  const authHeader = request.headers.get("authorization");
  const cronSecret = env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    console.log("🔄 Starting cron job: Refresh expiring Instagram URLs");

    // Find all Instagram recipes where URLs will expire in the next 24 hours
    const now = new Date();
    const bufferTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const expiringRecipes = await db
      .select()
      .from(recipes)
      .where(
        sql`${recipes.sourcePlatform} = 'instagram' AND (
          (${recipes.videoUrlExpiresAt} IS NOT NULL AND ${recipes.videoUrlExpiresAt} < ${bufferTime.toISOString()}) OR
          (${recipes.imageUrlExpiresAt} IS NOT NULL AND ${recipes.imageUrlExpiresAt} < ${bufferTime.toISOString()})
        )`
      );

    console.log(`Found ${expiringRecipes.length} recipes with expiring URLs`);

    const errors: string[] = [];
    let refreshedCount = 0;

    for (const recipe of expiringRecipes) {
      try {
        const shortcode = extractShortcode(recipe.sourceUrl);

        if (!shortcode) {
          console.error(`❌ Could not extract shortcode from ${recipe.sourceUrl}`);
          errors.push(`Recipe ${recipe.id}: Invalid source URL`);
          continue;
        }

        // Fetch fresh data from Instagram API
        const response = await fetch(
          "https://instagram120.p.rapidapi.com/api/instagram/mediaByShortcode",
          {
            method: "POST",
            headers: {
              "x-rapidapi-key": env.RAPIDAPI_KEY,
              "x-rapidapi-host": "instagram120.p.rapidapi.com",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ shortcode }),
          }
        );

        if (!response.ok) {
          console.error(`❌ Instagram API error for recipe ${recipe.id}: ${response.status}`);
          errors.push(`Recipe ${recipe.id}: Instagram API error ${response.status}`);
          continue;
        }

        const data = await response.json();
        const item = data[0];

        if (!item) {
          console.error(`❌ No data returned for recipe ${recipe.id}`);
          errors.push(`Recipe ${recipe.id}: No data from Instagram`);
          continue;
        }

        const newVideoUrl = item?.urls?.[0]?.url;
        const newThumbnailUrl = item?.pictureUrl;

        const videoUrlExpiresAt = newVideoUrl
          ? parseInstagramUrlExpiration(newVideoUrl)
          : null;
        const imageUrlExpiresAt = newThumbnailUrl
          ? parseInstagramUrlExpiration(newThumbnailUrl)
          : null;

        // Update the recipe in the database
        await db
          .update(recipes)
          .set({
            videoUrl: newVideoUrl,
            videoUrlExpiresAt: videoUrlExpiresAt,
            imageUrl: newThumbnailUrl,
            imageUrlExpiresAt: imageUrlExpiresAt,
          })
          .where(eq(recipes.id, recipe.id));

        console.log(`✅ Refreshed URLs for recipe ${recipe.id}`);
        console.log(`   Video expires at: ${videoUrlExpiresAt?.toISOString()}`);
        console.log(`   Image expires at: ${imageUrlExpiresAt?.toISOString()}`);

        refreshedCount++;

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Error refreshing recipe ${recipe.id}:`, error);
        errors.push(
          `Recipe ${recipe.id}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    console.log(`✅ Cron job completed: Refreshed ${refreshedCount}/${expiringRecipes.length} recipes`);

    return NextResponse.json<CronResponse>({
      success: true,
      refreshedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("❌ Cron job failed:", error);
    return NextResponse.json<CronResponse>(
      {
        success: false,
        refreshedCount: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      },
      { status: 500 }
    );
  }
}
