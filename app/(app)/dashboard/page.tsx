import Link from "next/link";
import { Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d&apos;ensemble — données en Phase 4.
          </p>
        </div>
        <Link
          href="/invoices/new"
          className={cn(buttonVariants(), "shrink-0 gap-1.5")}
        >
          <Plus className="size-4" aria-hidden />
          <span className="hidden sm:inline">Nouvelle facture</span>
          <span className="sm:hidden">Facture</span>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Brouillons", value: "—" },
          { label: "En retard", value: "—" },
          { label: "Ce mois", value: "—" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bienvenue sur FactureFlash</CardTitle>
          <CardDescription>
            Phase 0 terminée. Prochaine étape : migrations Supabase (Phase 1).
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Complétez votre profil entreprise, ajoutez des clients, puis créez
          votre première facture.
        </CardContent>
      </Card>
    </div>
  );
}
