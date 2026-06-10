import { formatCurrency } from "@/lib/invoices/calculate";
import type { DashboardStats, RevenueChartPayload } from "@/lib/data/dashboard";
import type { DashboardNotification } from "@/lib/data/notifications";

export type HeroInsightTone = "positive" | "neutral";

export interface HeroInsight {
  label: string;
  tone: HeroInsightTone;
}

function isToday(iso: string, reference = new Date()): boolean {
  const date = new Date(iso);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

export function buildHeroInsights({
  stats,
  revenueChart,
  notifications,
  reference = new Date(),
}: {
  stats: DashboardStats;
  revenueChart: RevenueChartPayload;
  notifications: DashboardNotification[];
  reference?: Date;
}): HeroInsight[] {
  const insights: HeroInsight[] = [];

  const months = revenueChart.last6Months;
  if (months.length >= 2) {
    const previous = months[months.length - 2].revenue;
    const current = months[months.length - 1].revenue;
    if (previous > 0 && current !== previous) {
      const pct = Math.round(((current - previous) / previous) * 100);
      insights.push({
        label: `${pct > 0 ? "+" : ""}${pct}% vs mois dernier`,
        tone: pct >= 0 ? "positive" : "neutral",
      });
    }
  }

  if (stats.monthRevenueTtc > 0) {
    insights.push({
      label: `${formatCurrency(stats.monthRevenueTtc)} ce mois`,
      tone: "neutral",
    });
  }

  const paidToday = notifications.filter(
    (n) => n.type === "invoice_paid" && isToday(n.createdAt, reference),
  ).length;

  if (paidToday > 0) {
    insights.push({
      label: `${paidToday} facture${paidToday > 1 ? "s" : ""} payée${paidToday > 1 ? "s" : ""} aujourd'hui`,
      tone: "positive",
    });
  }

  return insights.slice(0, 2);
}

export function getGreetingName({
  tradeName,
  email,
}: {
  tradeName?: string | null;
  email?: string | null;
}): string {
  const fromEmail = email?.split("@")[0]?.split(/[._-]/)[0];
  if (fromEmail && fromEmail.length >= 2) {
    return fromEmail.charAt(0).toUpperCase() + fromEmail.slice(1).toLowerCase();
  }
  if (tradeName?.trim()) {
    const first = tradeName.trim().split(/\s+/)[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
  }
  return "vous";
}
