import type React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/server/better-auth/server";
import { auth } from "@/server/better-auth";
import { LandingNav } from "@/components/landing-nav";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Footer } from "@/components/landing/footer";

export default async function Home() {
  const session = await getSession();

  async function handleLogout() {
    "use server";
    await auth.api.signOut({
      headers: await headers(),
    });
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <LandingNav session={session} onLogout={handleLogout} />

      <Hero />
      <HowItWorks />
      <Footer />
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-secondary/30 border border-border rounded-lg p-6 hover:border-accent/50 hover:bg-secondary/50 transition-all duration-300">
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
