"use client";

import type React from "react";
import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function Hero() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setIsLoading(true);
    // Simulate processing then redirect to recipe page
    setTimeout(() => {
      setIsLoading(false);
      router.push("/recette");
    }, 1500);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20">
      {/* Background grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-border/50" />
        <div className="absolute top-0 left-1/2 w-px h-full bg-border/50" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-border/50" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-border/50" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-border/50" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-border/50" />
      </div>

      {/* Accent line */}
      <div className="absolute left-8 md:left-16 top-0 bottom-0 w-px bg-rose-500/30" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border mb-8 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4" />
          <span>AI-powered recipe extraction</span>
        </div>

        {/* Main title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-foreground">
          let me cook
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          Collez un lien Instagram ou TikTok, notre IA extrait la recette,
          estime les quantites et decoupe la video en etapes claires.
        </p>

        {/* URL Input */}
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                type="url"
                placeholder="Collez votre lien Instagram ou TikTok..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-14 pl-4 pr-4 text-base bg-card border-border rounded-xl"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-14 px-8 rounded-xl text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Extraction...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Extraire la recette
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        </form>

        {/* Demo link */}
        <Link
          href="/recette"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Voir une demo</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground">
        <span className="text-xs">Scroll</span>
        <div className="w-px h-8 bg-border" />
      </div>
    </section>
  );
}
