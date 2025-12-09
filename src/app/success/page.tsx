import Link from "next/link";
import { getSession } from "@/server/better-auth/server";

export default async function SuccessPage() {
  const session = await getSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-green-500/20 p-4">
            <svg
              className="h-16 w-16 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="font-extrabold text-4xl tracking-tight sm:text-[3.5rem]">
            Paiement réussi !
          </h1>

          <p className="max-w-2xl text-xl text-white/80">
            Merci pour votre achat. Votre paiement a été traité avec succès.
          </p>

          {session?.user && (
            <p className="text-lg text-white/70">
              Un email de confirmation a été envoyé à{" "}
              <span className="font-semibold text-white">
                {session.user.email}
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/api/auth/polar/portal"
            className="rounded-full bg-[hsl(280,100%,70%)] px-8 py-3 font-semibold text-white no-underline transition hover:bg-[hsl(280,100%,60%)]"
          >
            Voir mon espace client
          </Link>

          <Link
            href="/"
            className="rounded-full bg-white/10 px-8 py-3 font-semibold no-underline transition hover:bg-white/20"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
