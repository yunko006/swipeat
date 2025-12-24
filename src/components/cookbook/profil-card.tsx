"use client";

import { ChefHat } from "lucide-react";

interface ProfileCardProps {
  user: {
    name: string;
    username: string;
    avatar: string;
    stats: {
      likes: number;
      imports: number;
      historique: number;
    };
  };
  activeTab: string;
  onTabChange: (tab: "likes" | "imports" | "historique") => void;
}

const tabs = [
  { id: "likes" as const, label: "Likes" },
  { id: "imports" as const, label: "Mes recettes" },
  { id: "historique" as const, label: "Historique" },
];

export function ProfileCard({
  user,
  activeTab,
  onTabChange,
}: ProfileCardProps) {
  return (
    <div className="relative bg-card border border-border rounded-2xl overflow-hidden mb-8">
      {/* Lignes de carnet decoratives */}
      <div className="absolute top-20 left-0 right-0 h-px bg-foreground/10" />
      <div className="absolute top-32 left-0 right-0 h-px bg-foreground/10" />

      {/* Marge rouge */}
      <div className="absolute top-0 bottom-0 left-12 w-px bg-rose-500/30" />

      {/* Trous de reliure */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-8">
        <div className="w-3 h-3 rounded-full border-2 border-foreground/20" />
        <div className="w-3 h-3 rounded-full border-2 border-foreground/20" />
      </div>

      <div className="p-8 pl-20">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src={user.avatar || "/placeholder.svg"}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-border"
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-background" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {user.name}
            </h1>
            <p className="text-muted-foreground mb-4">{user.username}</p>

            {/* Stats */}
            <div className="flex gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`text-center transition-colors ${
                    activeTab === tab.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <p className="text-xl font-bold">{user.stats[tab.id]}</p>
                  <p className="text-xs">{tab.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
