"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { InstagramResponse, InstagramError } from "@/types/instagram";
import { api } from "@/trpc/react";

const extractShortcode = (instagramUrl: string) => {
  // Exemples d'URLs Instagram:
  // https://www.instagram.com/p/DPPaQoukgYz/
  // https://www.instagram.com/reel/DPPaQoukgYz/
  const match = instagramUrl.match(/\/(p|reel)\/([A-Za-z0-9_-]+)/);
  return match ? match[2] : null;
};

const fetchInstagram = async (shortcode: string): Promise<InstagramResponse> => {
  const response = await fetch("/api/instagram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shortcode }),
  });

  if (!response.ok) {
    const error: InstagramError = await response.json();
    throw new Error(error.error);
  }

  return response.json();
};

export default function InstagramTestPage() {
  const [url, setUrl] = useState("");

  const mutation = useMutation({
    mutationFn: fetchInstagram,
  });

  const saveRecipe = api.recipe.save.useMutation({
    onSuccess: (data) => {
      console.log("Recipe saved:", data);
    },
    onError: (error) => {
      console.error("Error saving recipe:", error);
    },
  });

  const handleSubmit = () => {
    const shortcode = extractShortcode(url);

    if (!shortcode) {
      mutation.reset();
      return;
    }

    mutation.mutate(shortcode);
  };

  const handleSaveRecipe = () => {
    if (!mutation.data || !url) return;

    saveRecipe.mutate({
      sourceUrl: url,
      sourcePlatform: "instagram",
      title: mutation.data.description || "Sans titre",
      description: mutation.data.description,
      imageUrl: mutation.data.thumbnail,
      videoUrl: mutation.data.videoUrl,
    });
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Test Instagram API</h1>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Colle l'URL Instagram ici..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "..." : "Go"}
          </Button>
        </div>

        {mutation.isError && (
          <div className="p-4 bg-red-100 text-red-900 rounded">
            {mutation.error.message}
          </div>
        )}

        {mutation.isSuccess && mutation.data && (
          <div className="space-y-4">
            <pre className="p-4 bg-gray-100 text-black rounded overflow-auto text-xs">
              {JSON.stringify(mutation.data, null, 2)}
            </pre>

            <Button
              onClick={handleSaveRecipe}
              disabled={saveRecipe.isPending}
              className="w-full"
            >
              {saveRecipe.isPending ? "Saving..." : "Save Recipe"}
            </Button>

            {saveRecipe.isSuccess && (
              <div className="p-4 bg-green-100 text-green-900 rounded">
                Recipe saved successfully!
                <br />
                Recipe ID: {saveRecipe.data.recipeId}
                <br />
                {saveRecipe.data.isNew ? "New recipe created" : "Recipe already existed"}
              </div>
            )}

            {saveRecipe.isError && (
              <div className="p-4 bg-red-100 text-red-900 rounded">
                Error saving recipe: {saveRecipe.error.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
