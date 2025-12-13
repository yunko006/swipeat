"use client";

import { Play } from "lucide-react";

interface BentoSourceVideoProps {
  onPlayClick: () => void;
  thumbnailUrl?: string;
}

export function BentoSourceVideo({
  onPlayClick,
  thumbnailUrl = "/cooking-pasta-kitchen-warm.jpg",
}: BentoSourceVideoProps) {
  return (
    <div
      className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/20 transition-all cursor-pointer h-full min-h-[500px]"
      onClick={onPlayClick}
    >
      {/* Image de fond */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url('${thumbnailUrl}')` }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

      {/* Marge rouge */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-rose-500/30" />

      <div className="relative p-6 h-full flex flex-col">
        <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
          Video
        </h3>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-2 border-foreground/30 flex items-center justify-center group-hover:border-foreground/60 group-hover:bg-foreground/10 transition-all backdrop-blur-sm">
            <Play className="w-8 h-8 text-foreground/50 group-hover:text-foreground/80 transition-all ml-1" />
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Cliquez pour voir la recette en video
        </p>
      </div>
    </div>
  );
}
