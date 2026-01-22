"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { InstagramResponse, InstagramError } from "@/types/instagram";
import { api } from "@/trpc/react";
import { TWELVE_LABS_PROMPT_OPTIONS, type TwelveLabsPromptType } from "@/lib/twelve-labs/prompts";

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
  const [promptType, setPromptType] = useState<TwelveLabsPromptType>("basic");

  const mutation = useMutation({
    mutationFn: fetchInstagram,
  });

  const extractAndSave = api.recipe.extractAndSave.useMutation({
    onSuccess: (data) => {
      console.log("Recipe extracted and saved:", data);
    },
    onError: (error) => {
      console.error("Error extracting recipe:", error);
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

  const handleExtractAndSave = () => {
    if (!mutation.data || !url) return;

    extractAndSave.mutate({
      sourceUrl: url,
      sourcePlatform: "instagram",
      description: mutation.data.description || "Sans description",
      imageUrl: mutation.data.thumbnail,
      imageUrlExpiresAt: mutation.data.thumbnailExpiresAt ?? undefined,
      videoUrl: mutation.data.videoUrl,
      videoUrlExpiresAt: mutation.data.videoUrlExpiresAt ?? undefined,
      twelveLabsPromptType: promptType,
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

            <div className="flex gap-2 items-center">
              <label htmlFor="prompt-type" className="text-sm font-medium whitespace-nowrap">
                Twelve Labs Prompt:
              </label>
              <select
                id="prompt-type"
                value={promptType}
                onChange={(e) => setPromptType(e.target.value as TwelveLabsPromptType)}
                className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
                disabled={extractAndSave.isPending}
              >
                {TWELVE_LABS_PROMPT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleExtractAndSave}
              disabled={extractAndSave.isPending}
              className="w-full"
            >
              {extractAndSave.isPending ? "Extracting with AI..." : "Extract & Save Recipe"}
            </Button>

            {extractAndSave.isSuccess && (
              <div className="p-4 bg-green-100 text-green-900 rounded space-y-2">
                <div className="font-bold">
                  Recipe {extractAndSave.data.isNew ? "extracted and saved" : "already exists"}!
                </div>
                <div>Recipe ID: {extractAndSave.data.recipeId}</div>

                {extractAndSave.data.extracted && (
                  <div className="mt-4 space-y-2">
                    <div className="font-semibold">Extracted Data:</div>
                    <div>Ingredients: {extractAndSave.data.extracted.ingredients.length}</div>
                    <div>Steps: {extractAndSave.data.extracted.steps.length}</div>
                    {extractAndSave.data.extracted.servings && (
                      <div>Servings: {extractAndSave.data.extracted.servings}</div>
                    )}
                    {extractAndSave.data.extracted.prepTimeMinutes && (
                      <div>Prep time: {extractAndSave.data.extracted.prepTimeMinutes} min</div>
                    )}
                    {extractAndSave.data.extracted.cookTimeMinutes && (
                      <div>Cook time: {extractAndSave.data.extracted.cookTimeMinutes} min</div>
                    )}

                    <div className="mt-4">
                      <div className="font-semibold mb-2">Steps with Timestamps:</div>
                      <div className="space-y-1 text-sm">
                        {extractAndSave.data.extracted.steps.map((step) => {
                          const hasTimestamps = 'videoStartTime' in step && 'videoEndTime' in step;
                          return (
                            <div key={step.order} className="flex gap-2">
                              <span className="font-mono text-blue-600 min-w-20">
                                {hasTimestamps && step.videoStartTime !== undefined && step.videoEndTime !== undefined
                                  ? `${step.videoStartTime}s - ${step.videoEndTime}s`
                                  : hasTimestamps && step.videoStartTime !== undefined
                                    ? `${step.videoStartTime}s`
                                    : "--"}
                              </span>
                              <span>
                                {step.order}. {step.instruction}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <details className="mt-2">
                      <summary className="cursor-pointer font-semibold">View Full JSON</summary>
                      <pre className="mt-2 p-2 bg-white text-black rounded text-xs overflow-auto">
                        {JSON.stringify(extractAndSave.data.extracted, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            )}

            {extractAndSave.isError && (
              <div className="p-4 bg-red-100 text-red-900 rounded">
                Error extracting recipe: {extractAndSave.error.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
