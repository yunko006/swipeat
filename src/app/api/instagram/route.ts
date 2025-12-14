import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "@/env";
import type { InstagramResponse, InstagramError } from "@/types/instagram";

export async function POST(request: NextRequest) {
  try {
    const { shortcode } = await request.json();

    if (!shortcode) {
      return NextResponse.json<InstagramError>(
        { error: "Shortcode requis" },
        { status: 400 }
      );
    }

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

    const data = await response.json();

    // La réponse est un tableau, on prend le premier élément
    const item = data[0];

    // Extraire uniquement les champs nécessaires
    const result: InstagramResponse = {
      username: item?.meta?.username,
      sourceUrl: item?.meta?.sourceUrl,
      videoUrl: item?.urls?.[0]?.url,
      extension: item?.urls?.[0]?.extension,
      description: item?.meta?.title,
      thumbnail: item?.pictureUrl,
    };

    return NextResponse.json<InstagramResponse>(result);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json<InstagramError>(
      { error: "Erreur lors de la requête" },
      { status: 500 }
    );
  }
}
