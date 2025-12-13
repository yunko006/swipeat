"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";

interface LandingNavProps {
  session: {
    user?: {
      name?: string | null;
    };
  } | null;
  onLogout: () => void;
}

export function LandingNav({ session, onLogout }: LandingNavProps) {
  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0">
            <span className="font-bold text-accent-foreground text-sm">Y</span>
          </div>
          <span className="font-bold text-lg tracking-tight">swipeat</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="shrink-0">
            <ModeToggle />
          </div>
          <Link href="/hello">
            <Button
              variant="outline"
              className="border-border hover:bg-secondary text-foreground bg-transparent"
            >
              Test DB
            </Button>
          </Link>
          {!session ? (
            <Link href="/login">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium">
                Login
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{session.user?.name}</span>
              <form>
                <Button
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
                  formAction={onLogout}
                >
                  Logout
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
