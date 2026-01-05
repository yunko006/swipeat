// ABOUTME: Refreshes expired Instagram CDN URLs for a recipe
// ABOUTME: Takes a recipe ID, fetches fresh URLs from Instagram, and updates the database

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "@/env";
import { db } from "@/server/db";
import { recipes } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { parseInstagramUrlExpiration } from "@/lib/instagram/parse-expiration";

interface RefreshRequest {
  recipeId: string;
}

interface RefreshResponse {
  success: boolean;
  videoUrl?: string;
  videoUrlExpiresAt?: string;
  imageUrl?: string;
  imageUrlExpiresAt?: string;
}

interface RefreshError {
  error: string;
}

// Extract shortcode from Instagram URL
function extractShortcode(instagramUrl: string): string | null {
  const match = instagramUrl.match(/\/(p|reel)\/([A-Za-z0-9_-]+)/);
  return match?.[2] ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RefreshRequest;
    const recipeId = body.recipeId ?? null;

    if (!recipeId) {
      return NextResponse.json<RefreshError>(
        { error: "Recipe ID requis" },
        { status: 400 }
      );
    }

    // Fetch the recipe from DB
    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, recipeId),
    });

    if (!recipe) {
      return NextResponse.json<RefreshError>(
        { error: "Recette non trouvée" },
        { status: 404 }
      );
    }

    // Extract shortcode from sourceUrl
    const shortcode = extractShortcode(recipe.sourceUrl);

    if (!shortcode) {
      return NextResponse.json<RefreshError>(
        { error: "Impossible d'extraire le shortcode de l'URL source" },
        { status: 400 }
      );
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
      return NextResponse.json<RefreshError>(
        { error: "Erreur lors de la récupération des données Instagram" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const item = data[0];

    if (!item) {
      return NextResponse.json<RefreshError>(
        { error: "Aucune donnée Instagram trouvée" },
        { status: 404 }
      );
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
      .where(eq(recipes.id, recipeId));

    console.log(`✅ Refreshed URLs for recipe ${recipeId}`);
    console.log(`Video expires at: ${videoUrlExpiresAt?.toISOString()}`);
    console.log(`Image expires at: ${imageUrlExpiresAt?.toISOString()}`);

    return NextResponse.json<RefreshResponse>({
      success: true,
      videoUrl: newVideoUrl,
      videoUrlExpiresAt: videoUrlExpiresAt?.toISOString(),
      imageUrl: newThumbnailUrl,
      imageUrlExpiresAt: imageUrlExpiresAt?.toISOString(),
    });
  } catch (error) {
    console.error("Error refreshing Instagram URLs:", error);
    return NextResponse.json<RefreshError>(
      { error: "Erreur lors du rafraîchissement des URLs" },
      { status: 500 }
    );
  }
}
