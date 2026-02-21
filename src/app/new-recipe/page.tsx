"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSubscription } from "@/hooks/use-subscription";
import {
  ChefHat,
  ArrowLeft,
  Download,
  Sparkles,
  Scissors,
  Check,
  Loader2,
} from "lucide-react";

type ExtractionStep = {
  id: number;
  label: string;
  description: string;
  icon: React.ReactNode;
  duration: number;
};

const extractionSteps: ExtractionStep[] = [
  {
    id: 1,
    label: "Telechargement",
    description: "Recuperation de la video...",
    icon: <Download className="w-5 h-5" />,
    duration: 2000,
  },
  {
    id: 2,
    label: "Analyse IA",
    description: "Extraction des ingredients et quantites...",
    icon: <Sparkles className="w-5 h-5" />,
    duration: 3000,
  },
  {
    id: 3,
    label: "Decoupage",
    description: "Creation des etapes video...",
    icon: <Scissors className="w-5 h-5" />,
    duration: 2500,
  },
];

export default function NouvelleRecettePage() {
  const router = useRouter();
  const { isSubscribed, isLoading: subscriptionLoading } = useSubscription();
  const [url, setUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [error, setError] = useState("");

  // Redirect non-subscribed users to checkout
  useEffect(() => {
    if (!subscriptionLoading && !isSubscribed) {
      router.replace(`/checkout?products=${process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID}`);
    }
  }, [isSubscribed, subscriptionLoading, router]);

  const isValidUrl = (input: string) => {
    return (
      input.includes("instagram.com") ||
      input.includes("tiktok.com") ||
      input.includes("youtube.com") ||
      input.includes("youtu.be")
    );
  };

  const handleExtract = async () => {
    if (!url.trim()) {
      setError("Veuillez coller une URL");
      return;
    }

    if (!isValidUrl(url)) {
      setError("URL non supportee. Utilisez Instagram, TikTok ou YouTube.");
      return;
    }

    setError("");
    setIsExtracting(true);
    setCurrentStep(1);
  };

  // Progression des etapes d'extraction
  useEffect(() => {
    if (!isExtracting || currentStep === 0) return;

    const step = extractionSteps.find((s) => s.id === currentStep);
    if (!step) return;

    const timer = setTimeout(() => {
      setCompletedSteps((prev) => [...prev, currentStep]);

      if (currentStep < extractionSteps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        // Extraction terminee, redirection
        setTimeout(() => {
          router.push("/recette?id=1&new=true");
        }, 500);
      }
    }, step.duration);

    return () => clearTimeout(timer);
  }, [isExtracting, currentStep, router]);

  return (
    <div className="min-h-screen bg-background theme-vercel-dark">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/explorer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-foreground" />
              <span className="text-xl font-bold text-foreground">
                letmecook
              </span>
            </Link>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {!isExtracting ? (
          <>
            <div className="relative bg-card border border-border rounded-2xl p-8">
              {/* Marge rouge */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-rose-500/40" />

              {/* Trous de reliure */}
              <div className="absolute left-2 top-1/4 w-3 h-3 rounded-full border-2 border-foreground/20" />
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-foreground/20" />
              <div className="absolute left-2 top-3/4 w-3 h-3 rounded-full border-2 border-foreground/20" />

              <div className="pl-6">
                {/* Title with platform icons */}
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-2xl font-bold text-foreground">
                    Nouvelle recette
                  </h1>
                  <div className="flex items-center gap-2">
                    {/* Instagram */}
                    <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.073-1.689-.073-4.948 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </div>
                    {/* TikTok */}
                    <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                      </svg>
                    </div>
                    {/* YouTube */}
                    <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Input with only 2 lines */}
                <div className="relative py-4">
                  {/* Ligne du haut */}
                  <div className="absolute top-0 -left-6 right-0 h-px bg-foreground/15" />

                  <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setError("");
                    }}
                    placeholder="Collez votre lien ici..."
                    className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none text-lg"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleExtract();
                    }}
                  />

                  {/* Ligne du bas */}
                  <div className="absolute bottom-0 -left-6 right-0 h-px bg-foreground/15" />
                </div>

                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              </div>
            </div>

            <button
              onClick={handleExtract}
              disabled={!url.trim()}
              className="w-full mt-4 py-4 bg-foreground text-background font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              let me cook
            </button>
          </>
        ) : (
          /* Extraction animation in notebook style */
          <div className="relative bg-card border border-border rounded-2xl p-8">
            {/* Marge rouge */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-rose-500/40" />

            {/* Trous de reliure */}
            <div className="absolute left-2 top-1/4 w-3 h-3 rounded-full border-2 border-foreground/20" />
            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-foreground/20" />
            <div className="absolute left-2 top-3/4 w-3 h-3 rounded-full border-2 border-foreground/20" />

            <div className="pl-6 space-y-6">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center relative">
                  <ChefHat className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    Let me cook...
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Extraction en cours
                  </p>
                </div>
              </div>

              {/* Etapes d'extraction */}
              <div className="space-y-3">
                {extractionSteps.map((step) => {
                  const isCompleted = completedSteps.includes(step.id);
                  const isCurrent = currentStep === step.id;
                  const isPending = step.id > currentStep;

                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-500 ${
                        isCompleted
                          ? "bg-green-500/10"
                          : isCurrent
                          ? "bg-secondary"
                          : "opacity-40"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isCurrent
                            ? "bg-foreground text-background"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4" />
                        ) : isCurrent ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-medium text-sm ${
                            isPending
                              ? "text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isCompleted ? "Termine" : step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* URL en cours */}
              <p className="text-xs text-muted-foreground truncate pt-2 border-t border-foreground/10">
                {url}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
