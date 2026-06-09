import type { SupabaseClient } from "@supabase/supabase-js";

import { countClientsForUser } from "@/lib/data/clients";
import { listInvoicesForDashboard, type InvoiceWithClient } from "@/lib/data/invoices";
import {
  ACTIVITY_INITIAL_VISIBLE,
  countNotificationsForUser,
  getUnreadNotificationsCount,
  listNotificationsForUser,
  type DashboardNotification,
} from "@/lib/data/notifications";
import { isInvoiceDocument, isQuoteDocument } from "@/lib/documents/types";
import { listQuotesForDashboard, type QuoteWithClient } from "@/lib/data/quotes";
import { isQuotePending } from "@/lib/quotes/expiry";
import { type QuoteStatus } from "@/lib/quotes/status";
import {
  countsTowardRevenue,
  isEffectivelyOverdue,
  isInCurrentMonth,
} from "@/lib/invoices/overdue";
import { toInvoiceStatus } from "@/lib/invoices/status";
import type { Database } from "@/types/database";

export type DashboardStats = {
  totalInvoices: number;
  draftCount: number;
  overdueCount: number;
  monthRevenueTtc: number;
  clientCount: number;
  hasRevenueThisMonth: boolean;
};

export type MonthlyRevenuePoint = {
  key: string;
  label: string;
  revenue: number;
};

/** Libellés courts pour la vue annuelle (12 mois). */
const CALENDAR_MONTH_LABELS = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
] as const;

export type RevenueChartPayload = {
  last6Months: MonthlyRevenuePoint[];
  /** Clé = année (ex. "2026"). */
  byYear: Record<string, MonthlyRevenuePoint[]>;
  availableYears: number[];
  defaultYear: number;
};

export type QuoteDashboardStats = {
  totalQuotes: number;
  pendingCount: number;
  acceptedCount: number;
  /** Pourcentage acceptés / (envoyés + consultés + acceptés), null si aucun envoyé. */
  conversionRate: number | null;
};

export type DashboardData = {
  stats: DashboardStats;
  quoteStats: QuoteDashboardStats;
  recentInvoices: InvoiceWithClient[];
  monthlyRevenue: MonthlyRevenuePoint[];
  revenueChart: RevenueChartPayload;
  notifications: DashboardNotification[];
  unreadNotificationCount: number;
  totalActivitiesCount: number;
  hasMoreActivities: boolean;
};

export function computeDashboardStats(
  invoices: InvoiceWithClient[],
  clientCount: number,
  reference = new Date(),
): DashboardStats {
  let draftCount = 0;
  let overdueCount = 0;
  let monthRevenueTtc = 0;

  for (const inv of invoices) {
    if (!isInvoiceDocument(inv.document_type)) continue;

    const status = toInvoiceStatus(inv.status);
    if (status === "draft") draftCount++;
    if (isEffectivelyOverdue(status, inv.due_date, reference)) {
      overdueCount++;
    }
    if (
      countsTowardRevenue(status, inv.due_date, reference) &&
      isInCurrentMonth(inv.issue_date, reference)
    ) {
      monthRevenueTtc += Number(inv.total_ttc);
    }
  }

  const monthRevenueRounded = Math.round(monthRevenueTtc * 100) / 100;

  const invoiceRows = invoices.filter((inv) =>
    isInvoiceDocument(inv.document_type),
  );

  return {
    totalInvoices: invoiceRows.length,
    draftCount,
    overdueCount,
    monthRevenueTtc: monthRevenueRounded,
    clientCount,
    hasRevenueThisMonth: monthRevenueRounded > 0,
  };
}

export function computeMonthlyRevenue(
  invoices: InvoiceWithClient[],
  months = 6,
  reference = new Date(),
): MonthlyRevenuePoint[] {
  const points: MonthlyRevenuePoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(reference.getFullYear(), reference.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("fr-FR", {
      month: "short",
      year: "2-digit",
    }).format(d);

    let revenue = 0;
    for (const inv of invoices) {
      if (!inv.issue_date.startsWith(key)) continue;
      if (!countsTowardRevenue(toInvoiceStatus(inv.status), inv.due_date, d)) continue;
      revenue += Number(inv.total_ttc);
    }

    points.push({
      key,
      label,
      revenue: Math.round(revenue * 100) / 100,
    });
  }

  return points;
}

/** CA TTC par mois calendaire pour une année complète (12 barres). */
export function computeCalendarYearRevenue(
  invoices: InvoiceWithClient[],
  year: number,
): MonthlyRevenuePoint[] {
  const points: MonthlyRevenuePoint[] = [];

  for (let month = 0; month < 12; month++) {
    const d = new Date(year, month, 1);
    const key = `${year}-${String(month + 1).padStart(2, "0")}`;

    let revenue = 0;
    for (const inv of invoices) {
      if (!inv.issue_date.startsWith(key)) continue;
      if (!countsTowardRevenue(toInvoiceStatus(inv.status), inv.due_date, d)) continue;
      revenue += Number(inv.total_ttc);
    }

    points.push({
      key,
      label: CALENDAR_MONTH_LABELS[month],
      revenue: Math.round(revenue * 100) / 100,
    });
  }

  return points;
}

/** Années présentes dans les factures comptant pour le CA (+ année courante). */
export function getAvailableRevenueYears(
  invoices: InvoiceWithClient[],
  reference = new Date(),
): number[] {
  const years = new Set<number>([reference.getFullYear()]);

  for (const inv of invoices) {
    const issueYear = Number(inv.issue_date.slice(0, 4));
    if (!Number.isFinite(issueYear)) continue;
    const monthDate = new Date(issueYear, Number(inv.issue_date.slice(5, 7)) - 1, 1);
    if (countsTowardRevenue(toInvoiceStatus(inv.status), inv.due_date, monthDate)) {
      years.add(issueYear);
    }
  }

  return Array.from(years).sort((a, b) => b - a);
}

export function buildRevenueChartPayload(
  invoices: InvoiceWithClient[],
  reference = new Date(),
): RevenueChartPayload {
  const availableYears = getAvailableRevenueYears(invoices, reference);
  const byYear: Record<string, MonthlyRevenuePoint[]> = {};

  for (const year of availableYears) {
    byYear[String(year)] = computeCalendarYearRevenue(invoices, year);
  }

  return {
    last6Months: computeMonthlyRevenue(invoices, 6, reference),
    byYear,
    availableYears,
    defaultYear: reference.getFullYear(),
  };
}

function sortByRecent(invoices: InvoiceWithClient[]): InvoiceWithClient[] {
  return [...invoices].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
}

export function computeQuoteDashboardStats(
  quotes: QuoteWithClient[],
  reference = new Date(),
): QuoteDashboardStats {
  let pendingCount = 0;
  let acceptedCount = 0;
  let sentPipeline = 0;

  for (const quote of quotes) {
    if (!isQuoteDocument(quote.document_type)) continue;

    const status = quote.status as QuoteStatus;
    if (status === "accepted") {
      acceptedCount++;
      sentPipeline++;
      continue;
    }
    if (isQuotePending(status, quote.due_date, reference)) {
      pendingCount++;
    }
    if (status === "sent" || status === "viewed") {
      sentPipeline++;
    }
  }

  const conversionRate =
    sentPipeline > 0
      ? Math.round((acceptedCount / sentPipeline) * 100)
      : null;

  return {
    totalQuotes: quotes.length,
    pendingCount,
    acceptedCount,
    conversionRate,
  };
}

export async function getDashboardData(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<DashboardData> {
  const [
    invoices,
    quotes,
    clientCount,
    notifications,
    unreadNotificationCount,
    totalActivitiesCount,
  ] = await Promise.all([
    listInvoicesForDashboard(supabase, userId),
    listQuotesForDashboard(supabase, userId),
    countClientsForUser(supabase, userId),
    listNotificationsForUser(supabase, userId),
    getUnreadNotificationsCount(supabase, userId),
    countNotificationsForUser(supabase, userId),
  ]);

  const sorted = sortByRecent(invoices);
  const reference = new Date();

  return {
    stats: computeDashboardStats(invoices, clientCount, reference),
    quoteStats: computeQuoteDashboardStats(quotes, reference),
    recentInvoices: sorted.slice(0, 5),
    monthlyRevenue: computeMonthlyRevenue(invoices, 6, reference),
    revenueChart: buildRevenueChartPayload(invoices, reference),
    notifications,
    unreadNotificationCount,
    totalActivitiesCount,
    hasMoreActivities: totalActivitiesCount > ACTIVITY_INITIAL_VISIBLE,
  };
}
