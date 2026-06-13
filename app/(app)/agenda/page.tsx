import { redirect } from "next/navigation";

import { AgendaView } from "@/components/agenda/agenda-view";
import { PageHeader } from "@/components/layout/page-header";
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

export const metadata = pageMetadata("agenda");

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
    <div className="w-full space-y-6 pb-8">
      <PageHeader
        title="Agenda"
        description={agendaCopy.pageDescription}
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
