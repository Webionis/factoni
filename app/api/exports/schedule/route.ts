import { NextResponse } from "next/server";

import { requireAccountingExportAccess } from "@/lib/exports/auth";
import { logServerError } from "@/lib/logger";
import type { ExportFormat } from "@/lib/exports/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAccountingExportAccess();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from("export_schedules")
    .select("*")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) {
    logServerError("exportSchedule.get", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ schedule: data });
}

export async function PUT(request: Request) {
  const auth = await requireAccountingExportAccess();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  let body: {
    enabled?: boolean;
    format?: ExportFormat;
    recipientEmail?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const email = body.recipientEmail?.trim();
  if (body.enabled && !email) {
    return NextResponse.json(
      { error: "Email destinataire requis" },
      { status: 400 },
    );
  }

  const payload = {
    user_id: auth.user.id,
    enabled: Boolean(body.enabled),
    format: body.format ?? "xlsx",
    recipient_email: email ?? "",
    export_type: "invoices" as const,
    frequency: "monthly" as const,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await auth.supabase
    .from("export_schedules")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) {
    logServerError("exportSchedule.put", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ schedule: data });
}
