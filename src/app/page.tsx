import type React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Code2,
  Database,
  Shield,
  Zap,
  Rocket,
  Palette,
} from "lucide-react";
import { getSession } from "@/server/better-auth/server";
import { auth } from "@/server/better-auth";
import { LandingNav } from "@/components/landing-nav";

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

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-balance">
            Build faster with <span className="text-accent">Y1 Stack</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance leading-relaxed">
            The ultimate SaaS toolkit that connects all your favorite tools.
            Pre-configured, production-ready, and built for modern teams.
          </p>

          <div className="flex gap-4 justify-center mb-16 flex-wrap">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium gap-2"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border hover:bg-secondary text-foreground bg-transparent"
            >
              View Docs
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-secondary/30 border border-border rounded-lg p-4">
              <Code2 className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-sm font-medium">Next.js 16</p>
              <p className="text-xs text-muted-foreground">Latest framework</p>
            </div>
            <div className="bg-secondary/30 border border-border rounded-lg p-4">
              <Shield className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-sm font-medium">TypeScript</p>
              <p className="text-xs text-muted-foreground">Type-safe code</p>
            </div>
            <div className="bg-secondary/30 border border-border rounded-lg p-4">
              <Zap className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-sm font-medium">Pre-configured</p>
              <p className="text-xs text-muted-foreground">Zero setup needed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Everything included
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              No need to spend days configuring. Y1 Stack comes pre-configured
              with all the tools your team needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Database className="w-6 h-6 text-accent" />}
              title="Database Ready"
              desc="Supabase, Neon, or any SQL database pre-configured"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-accent" />}
              title="Authentication Built-in"
              desc="Secure auth with Supabase or custom implementation"
            />
            <FeatureCard
              icon={<Palette className="w-6 h-6 text-accent" />}
              title="Styled Components"
              desc="shadcn/ui components and Tailwind CSS v4 included"
            />
            <FeatureCard
              icon={<Rocket className="w-6 h-6 text-accent" />}
              title="Deployment Ready"
              desc="Deploy to Vercel in seconds with zero config"
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-accent" />}
              title="AI-Ready"
              desc="AI SDK integration for building AI features instantly"
            />
            <FeatureCard
              icon={<Code2 className="w-6 h-6 text-accent" />}
              title="Payment Processing"
              desc="Stripe integration for subscriptions and products"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            Stop configuring, start building
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Y1 Stack handles all the tedious setup so you can focus on what
            matters: your product.
          </p>
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium gap-2"
          >
            Start Building <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 bg-secondary/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-muted-foreground text-sm">
            © 2025 Y1 Stack. Built for developers, by developers.
          </p>
          <div className="flex gap-8">
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              GitHub
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              Docs
            </a>
          </div>
        </div>
      </footer>
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
