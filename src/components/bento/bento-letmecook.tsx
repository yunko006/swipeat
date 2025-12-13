"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  ChefHat,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Pause,
} from "lucide-react";
import type { Recipe } from "@/lib/recipes-data";

interface BentoLetmecookProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  stepTimestamps?: number[];
}

export function BentoLetmecook({
  recipe,
  isOpen,
  onClose,
  videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  stepTimestamps = [0, 8, 18, 28, 38, 48],
}: BentoLetmecookProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < recipe.instructions.length) {
        setCurrentStep(step);
        if (videoRef.current && stepTimestamps[step] !== undefined) {
          videoRef.current.currentTime = stepTimestamps[step];
        }
      }
    },
    [recipe.instructions.length, stepTimestamps]
  );

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleClose = () => {
    setCurrentStep(0);
    setIsPlaying(true);
    onClose();
  };

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [isOpen]);

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 50;

    if (dragOffset > threshold) {
      goToStep(currentStep - 1);
    } else if (dragOffset < -threshold) {
      goToStep(currentStep + 1);
    }

    setDragOffset(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="relative w-full h-full max-w-lg mx-auto">
        {/* Barre de progression */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-3 pt-4">
          {recipe.instructions.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{
                  width: i <= currentStep ? "100%" : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-0 right-0 z-20 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">{recipe.title}</p>
              <p className="text-white/60 text-xs">
                Etape {currentStep + 1} sur {recipe.instructions.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src={videoUrl}
          playsInline
          muted
          loop
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

        {/* Zone de swipe */}
        <div
          ref={containerRef}
          className="absolute inset-0 z-10 select-none cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => {
            setIsDragging(true);
            setStartX(e.clientX);
            setDragOffset(0);
          }}
          onMouseMove={(e) => {
            if (!isDragging) return;
            setDragOffset(e.clientX - startX);
          }}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={(e) => {
            setIsDragging(true);
            setStartX(e.touches[0].clientX);
            setDragOffset(0);
          }}
          onTouchMove={(e) => {
            if (!isDragging) return;
            setDragOffset(e.touches[0].clientX - startX);
          }}
          onTouchEnd={handleDragEnd}
        />

        {/* Numero d'etape style carnet */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-20 pointer-events-none">
          <div className="w-px h-16 bg-rose-500/50" />
          <span className="font-mono text-3xl text-white/40">
            {currentStep}
          </span>
          <div className="w-px h-16 bg-rose-500/50" />
        </div>

        {/* Bouton precedent */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToStep(currentStep - 1);
          }}
          disabled={currentStep === 0}
          className="absolute left-4 bottom-32 z-30 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/30 transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        {/* Bouton play/pause avec "let me cook" */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          className="absolute left-1/2 bottom-32 z-30 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" />
          )}
          <span className="text-white font-medium text-sm">let me cook</span>
        </button>

        {/* Bouton suivant */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToStep(currentStep + 1);
          }}
          disabled={currentStep === recipe.instructions.length - 1}
          className="absolute right-4 bottom-32 z-30 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/30 transition-all"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Instruction courante */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 pb-12 pointer-events-none">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-rose-500/30" />

          <div className="pl-8">
            <p className="text-white text-xl font-medium leading-relaxed">
              {recipe.instructions[currentStep]}
            </p>

            <div className="flex items-center justify-center gap-8 mt-6 text-white/40 text-xs">
              <span>Swipe ou fleches pour naviguer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
