import { getCompanyForUser } from "@/lib/auth/profile";
import { createInvoicePaidNotification } from "@/lib/data/notifications";
import { sendInvoicePaidEmail } from "@/lib/email/send-invoice-paid-email";
import { logInvoicePaid } from "@/lib/invoices/paid-transition-log";
import { logServerError } from "@/lib/logger";
import { invoiceDisplayNumber } from "@/lib/invoices/status";
import { parseClientSnapshot, parseCompanySnapshot } from "@/lib/pdf/parse-snapshots";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

interface NotifyOwnerInvoicePaidParams {
  invoice: Database["public"]["Tables"]["invoices"]["Row"];
  paidAt: string;
}

export interface NotifyOwnerInvoicePaidResult {
  notificationCreated: boolean;
  emailSent: boolean;
}

async function resolveOwnerEmail(
  userId: string,
): Promise<{ email: string | null; fullName: string | null }> {
  if (!isAdminClientConfigured()) {
    return { email: null, fullName: null };
  }

  const admin = createAdminClient();

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    logServerError("notifyOwnerInvoicePaid.profile", profileError, { userId });
  }

  let email = profile?.email?.trim() ?? null;
  const fullName = profile?.full_name ?? null;

  if (!email) {
    const { data: authUser, error: authError } =
      await admin.auth.admin.getUserById(userId);

    if (authError) {
      logServerError("notifyOwnerInvoicePaid.authUser", authError, { userId });
    } else {
      email = authUser?.user?.email?.trim() ?? null;
    }
  }

  return { email, fullName };
}

export async function notifyOwnerInvoicePaid(
  params: NotifyOwnerInvoicePaidParams,
): Promise<NotifyOwnerInvoicePaidResult> {
  const { invoice, paidAt } = params;
  const companyFromSnapshot = parseCompanySnapshot(invoice.company_snapshot);
  const clientFromSnapshot = parseClientSnapshot(invoice.client_snapshot);
  const clientName = clientFromSnapshot?.name ?? "Client";
  const invoiceNumber = invoiceDisplayNumber(
    invoice.invoice_number,
    invoice.id,
  );
  const totalTtc = Number(invoice.total_ttc);

  let notificationCreated = false;

  try {
    notificationCreated = await createInvoicePaidNotification({
      ownerUserId: invoice.user_id,
      invoiceId: invoice.id,
      invoiceNumber,
      clientName,
      amountTtc: totalTtc,
      paidAt,
    });
  } catch (notificationError) {
    logServerError("notifyOwnerInvoicePaid.notification", notificationError, {
      invoiceId: invoice.id,
    });
  }

  if (!notificationCreated) {
    return { notificationCreated: false, emailSent: false };
  }

  const { email: ownerEmail, fullName } = await resolveOwnerEmail(invoice.user_id);

  if (!ownerEmail) {
    logServerError("notifyOwnerInvoicePaid", "owner_email_missing", {
      invoiceId: invoice.id,
      userId: invoice.user_id,
    });
    return { notificationCreated: true, emailSent: false };
  }

  const admin = isAdminClientConfigured() ? createAdminClient() : null;
  const company = admin
    ? await getCompanyForUser(admin, invoice.user_id)
    : null;

  logInvoicePaid("email_send_attempt", {
    invoiceId: invoice.id,
    ownerEmailDomain: ownerEmail.split("@")[1] ?? "unknown",
  });

  try {
    const emailSent = await sendInvoicePaidEmail({
      invoiceId: invoice.id,
      invoiceNumber,
      ownerEmail,
      ownerName:
        fullName ?? companyFromSnapshot?.party.name ?? company?.trade_name,
      clientName,
      totalTtc,
      paidAt,
    });

    return { notificationCreated: true, emailSent };
  } catch (emailError) {
    logServerError("notifyOwnerInvoicePaid.email", emailError, {
      invoiceId: invoice.id,
    });
    return { notificationCreated: true, emailSent: false };
  }
}
