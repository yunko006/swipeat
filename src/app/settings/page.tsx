// ABOUTME: User settings page
// ABOUTME: Shows subscription status and account management options

"use client";

import { ArrowLeft, ChefHat, CreditCard, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { useSubscription } from "@/hooks/use-subscription";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { isSubscribed, isLoading } = useSubscription();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background theme-vercel-dark">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/cookbook"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-foreground" />
            <span className="text-xl font-bold text-foreground">letmecook</span>
          </Link>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {/* Compte */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Compte
          </h2>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">{session?.user?.name}</p>
            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
          </div>
        </section>

        {/* Abonnement */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Abonnement
          </h2>

          {isLoading ? (
            <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
          ) : isSubscribed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-foreground font-medium">Actif — 2,99 €/mois</span>
              </div>
              <Link
                href="/portal"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Gérer
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                <span className="text-muted-foreground">Aucun abonnement actif</span>
              </div>
              <Link
                href={`/checkout?products=${process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
              >
                S&apos;abonner — 2,99 €/mois
              </Link>
            </div>
          )}
        </section>

        {/* Déconnexion */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </section>
      </main>
    </div>
  );
}
