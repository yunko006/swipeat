// ABOUTME: Search bar component with search icon and filters button
// ABOUTME: Allows users to search recipes by name or ingredients

import { Search, SlidersHorizontal } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFiltersClick?: () => void;
}

export function SearchBar({ value, onChange, onFiltersClick }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input
        type="text"
        placeholder="Rechercher une recette, un ingredient..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-12 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
      />
      <button
        onClick={onFiltersClick}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-background rounded-lg transition-colors"
      >
        <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  );
}
