"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { InstagramResponse, InstagramError } from "@/types/instagram";

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

  const handleSubmit = () => {
    const shortcode = extractShortcode(url);

    if (!shortcode) {
      mutation.reset();
      return;
    }

    mutation.mutate(shortcode);
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
          <pre className="p-4 bg-gray-100 text-black rounded overflow-auto text-xs">
            {JSON.stringify(mutation.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
