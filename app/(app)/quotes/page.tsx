import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { QuotesList } from "@/components/quotes/quotes-list";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { pageMetadata } from "@/lib/metadata";
import { assertQuoteListIntegrity } from "@/lib/documents/list-integrity";
import { listQuotesForUser } from "@/lib/data/quotes";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata("quotes");

export default async function QuotesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const quotes = await listQuotesForUser(supabase, user.id);

  if (process.env.NODE_ENV === "development") {
    assertQuoteListIntegrity(quotes);
  }

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Devis"
        description="Créez, envoyez et transformez vos devis en factures."
        action={
          <Link
            href="/quotes/new"
            className={cn(buttonVariants(), "h-11 gap-1.5")}
          >
            <Plus className="size-4" aria-hidden />
            <span className="hidden sm:inline">Nouveau devis</span>
            <span className="sm:hidden">Nouveau</span>
          </Link>
        }
      />
      <QuotesList quotes={quotes} />
    </div>
  );
}
