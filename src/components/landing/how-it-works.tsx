"use client";

import { Link2, Sparkles, Play } from "lucide-react";

const steps = [
  {
    icon: Link2,
    number: "01",
    title: "Collez le lien",
    description:
      "Copiez simplement l'URL d'une video de recette depuis Instagram Reels ou TikTok. Notre systeme accepte tous les formats de liens de ces plateformes.",
    details: [
      "Support Instagram Reels",
      "Support TikTok",
      "Detection automatique du format",
    ],
  },
  {
    icon: Sparkles,
    number: "02",
    title: "L'IA analyse",
    description:
      "Notre intelligence artificielle regarde la video, identifie chaque ingredient visible, estime les quantites en grammes et detecte les differentes etapes de preparation.",
    details: [
      "Extraction des ingredients",
      "Estimation des quantites",
      "Detection des etapes",
    ],
  },
  {
    icon: Play,
    number: "03",
    title: "Cuisinez",
    description:
      "Suivez la recette etape par etape avec les clips video synchronises. Chaque etape est associee au moment exact de la video pour un suivi parfait.",
    details: [
      "Clips video par etape",
      "Navigation style stories",
      "Liste d'ingredients cochable",
    ],
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-32 px-4">
      {/* Background accent */}
      <div className="absolute left-8 md:left-16 top-0 bottom-0 w-px bg-rose-500/30" />

      <div className="max-w-6xl mx-auto">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`relative flex flex-col ${
              index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
            } gap-12 lg:gap-20 items-center mb-32 last:mb-0`}
          >
            {/* Content side */}
            <div className="flex-1 max-w-xl">
              {/* Step number */}
              <div className="flex items-center gap-4 mb-6">
                <span className="font-mono text-5xl font-bold text-foreground/10">
                  {step.number}
                </span>
                <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-foreground" />
                </div>
              </div>

              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {step.title}
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {step.description}
              </p>

              {/* Details list */}
              <ul className="space-y-3">
                {step.details.map((detail, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual side - notebook style card */}
            <div className="flex-1 w-full max-w-md">
              <div className="relative bg-card border border-border rounded-2xl p-8 overflow-hidden">
                {/* Notebook lines */}
                <div className="absolute top-0 left-0 right-0 h-px bg-foreground/10" />
                <div className="absolute top-12 left-0 right-0 h-px bg-foreground/10" />
                <div className="absolute top-24 left-0 right-0 h-px bg-foreground/10" />
                <div className="absolute top-36 left-0 right-0 h-px bg-foreground/10" />
                <div className="absolute top-48 left-0 right-0 h-px bg-foreground/10" />

                {/* Red margin */}
                <div className="absolute top-0 left-12 bottom-0 w-px bg-rose-500/30" />

                {/* Binding holes */}
                <div className="absolute top-8 left-4 w-3 h-3 rounded-full border border-foreground/20" />
                <div className="absolute top-20 left-4 w-3 h-3 rounded-full border border-foreground/20" />
                <div className="absolute top-32 left-4 w-3 h-3 rounded-full border border-foreground/20" />

                {/* Content placeholder */}
                <div className="relative z-10 pl-8 space-y-4">
                  {index === 0 && (
                    <>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Link2 className="w-4 h-4" />
                        <span>instagram.com/reel/...</span>
                      </div>
                      <div className="h-32 rounded-lg bg-secondary/50 flex items-center justify-center">
                        <Play className="w-8 h-8 text-muted-foreground" />
                      </div>
                    </>
                  )}
                  {index === 1 && (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-rose-500" />
                        <span className="text-sm text-muted-foreground">
                          Analyse en cours...
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-foreground/10 rounded w-3/4" />
                        <div className="h-3 bg-foreground/10 rounded w-1/2" />
                        <div className="h-3 bg-foreground/10 rounded w-2/3" />
                      </div>
                      <div className="flex gap-2 mt-4">
                        <span className="px-2 py-1 text-xs bg-secondary rounded">
                          200g pates
                        </span>
                        <span className="px-2 py-1 text-xs bg-secondary rounded">
                          100g lardons
                        </span>
                      </div>
                    </>
                  )}
                  {index === 2 && (
                    <>
                      <div className="text-sm font-medium text-foreground mb-2">
                        Etape 2/5
                      </div>
                      <div className="h-24 rounded-lg bg-secondary/50 flex items-center justify-center mb-2">
                        <Play className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Faire revenir les lardons...
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
