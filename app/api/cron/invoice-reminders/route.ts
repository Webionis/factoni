import { NextResponse } from "next/server";

import {
  INVOICE_REMINDER_CRON_ENABLED,
  isValidCronRequest,
} from "@/lib/invoices/reminder-config";
import { processAutomaticInvoiceReminders } from "@/lib/invoices/reminders";
import { logServerError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!INVOICE_REMINDER_CRON_ENABLED) {
    return NextResponse.json(
      { ok: false, error: "cron_disabled" },
      { status: 503 },
    );
  }

  const authorization = request.headers.get("authorization");
  if (!isValidCronRequest(authorization)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processAutomaticInvoiceReminders();

    return NextResponse.json({
      ok: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logServerError("cron.invoice-reminders", error);
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 },
    );
  }
}
