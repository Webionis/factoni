import { NextResponse } from "next/server";

import { requireAccountingExportAccess } from "@/lib/exports/auth";
import { loadFilteredInvoices } from "@/lib/exports/generate-invoices";
import { computeInvoiceExportSummary } from "@/lib/exports/invoice-export";
import { parseInvoiceExportFilters } from "@/lib/exports/invoice-export";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAccountingExportAccess();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const filters = parseInvoiceExportFilters(
    new URL(request.url).searchParams,
  );

  const invoices = await loadFilteredInvoices(
    auth.supabase,
    auth.user.id,
    filters,
  );

  return NextResponse.json(computeInvoiceExportSummary(invoices));
}
