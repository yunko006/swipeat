"use client";

import { Heart, Upload, History } from "lucide-react";

type Tab = "likes" | "imports" | "historique";

interface TabsNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs = [
  { id: "likes" as Tab, label: "Likes", icon: Heart },
  { id: "imports" as Tab, label: "Mes recettes", icon: Upload },
  { id: "historique" as Tab, label: "Historique", icon: History },
];

export function TabsNavigation({
  activeTab,
  onTabChange,
}: TabsNavigationProps) {
  return (
    <div className="flex gap-2 mb-6 border-b border-border">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon
              className={`w-4 h-4 ${
                activeTab === "likes" && tab.id === "likes"
                  ? "fill-rose-500 text-rose-500"
                  : ""
              }`}
            />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
