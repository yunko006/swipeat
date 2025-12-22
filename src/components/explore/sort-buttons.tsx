// ABOUTME: Sort buttons component for filtering recipes by trending, recent, or quick
// ABOUTME: Provides visual feedback for active sort option

import { TrendingUp, Sparkles, Clock } from "lucide-react";

type SortOption = "trending" | "recent" | "quick";

interface SortButtonsProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortButtons({ value, onChange }: SortButtonsProps) {
  const buttons: Array<{
    id: SortOption;
    icon: typeof TrendingUp;
    label: string;
  }> = [
    { id: "trending", icon: TrendingUp, label: "Tendances" },
    { id: "recent", icon: Sparkles, label: "Recentes" },
    { id: "quick", icon: Clock, label: "Rapides" },
  ];

  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="text-sm text-muted-foreground">Trier par:</span>
      <div className="flex gap-2">
        {buttons.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
              value === id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
