import Link from "next/link";
import { FileText, Smartphone, Zap } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-10 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium text-primary">
            Facturation rapide pour pros
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Créez vos factures en quelques secondes, même sur chantier
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            FactureFlash aide artisans, indépendants et petites entreprises à
            éditer, envoyer et archiver des factures conformes — depuis mobile,
            tablette ou ordinateur.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
              Commencer gratuitement
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Se connecter
            </Link>
          </div>
        </div>

        <ul className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Smartphone,
              title: "Mobile-first",
              desc: "Interface pensée pour une utilisation au doigt, en déplacement.",
            },
            {
              icon: Zap,
              title: "Rapide",
              desc: "Client, lignes, TVA et totaux en un flux simple.",
            },
            {
              icon: FileText,
              title: "PDF prêt",
              desc: "Téléchargez une facture professionnelle en un clic (Phase 5).",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <li
              key={title}
              className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm"
            >
              <Icon className="mb-3 size-8 text-primary" aria-hidden />
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
