import { NextResponse } from "next/server";

import { requireAccountingExportAccess } from "@/lib/exports/auth";
import { listExportHistory } from "@/lib/exports/history";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAccountingExportAccess();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const history = await listExportHistory(auth.supabase, auth.user.id);
  return NextResponse.json({ history });
}
