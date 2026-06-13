import { NextResponse } from "next/server";

import { listScheduledJobsForRange } from "@/lib/data/scheduled-jobs";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json(
      { error: "Paramètres from et to requis (YYYY-MM-DD)" },
      { status: 400 },
    );
  }

  const jobs = await listScheduledJobsForRange(supabase, user.id, from, to);

  return NextResponse.json({ jobs });
}
