"use client";

export function Footer() {
  return (
    <footer className="relative py-16 px-4 border-t border-border">
      {/* Background accent */}
      <div className="absolute left-8 md:left-16 top-0 bottom-0 w-px bg-rose-500/30" />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">letmecook</span>
          </div>

          <p className="text-sm text-muted-foreground">
            Transformez les videos en recettes. Fait avec amour.
          </p>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Twitter
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Instagram
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
