import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { AgendaView } from "@/components/agenda/agenda-view";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { listClientsForUser } from "@/lib/data/clients";
import { listScheduledJobsForRange } from "@/lib/data/scheduled-jobs";
import {
  endOfWeek,
  startOfWeek,
  toIsoDate,
} from "@/lib/dates/calendar-range";
import { agendaCopy } from "@/lib/agenda/copy";
import { pageMetadata } from "@/lib/metadata";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata("agenda");

/** Cache navigation client — affichage instantané entre sections. */
export const unstable_dynamicStaleTime = 300;

interface AgendaPageProps {
  searchParams: Promise<{ create?: string }>;
}

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const { create } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const today = new Date();
  const weekStart = startOfWeek(today, true);
  const weekEnd = endOfWeek(today, true);
  const from = toIsoDate(weekStart);
  const to = toIsoDate(weekEnd);

  const [clients, initialJobs] = await Promise.all([
    listClientsForUser(supabase, user.id),
    listScheduledJobsForRange(supabase, user.id, from, to),
  ]);

  return (
    <div className="min-w-0 space-y-6 pb-8">
      <PageHeader
        title="Agenda"
        description={agendaCopy.pageDescription}
        action={
          <Link
            href="/agenda?create=1"
            className={cn(buttonVariants(), "h-11 gap-1.5")}
          >
            <Plus className="size-4" aria-hidden />
            <span className="hidden sm:inline">{agendaCopy.plan}</span>
            <span className="sm:hidden">Planifier</span>
          </Link>
        }
      />

      <AgendaView
        clients={clients}
        initialJobs={initialJobs}
        initialRange={{ from, to }}
        initialOpenCreate={create === "1"}
      />
    </div>
  );
}
