"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  CreditCard,
  Download,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { UnreadNotificationBadge } from "@/components/layout/unread-notification-badge";
import { useUnreadNotifications } from "@/components/notifications/unread-notifications-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { sidebarWidthClassName } from "@/lib/constants/layout";
import {
  clearDashboardActivityIntent,
  stripDashboardActivityHash,
} from "@/lib/navigation/dashboard-activity";
import {
  sidebarNavItemActiveClassName,
  sidebarNavItemClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/quotes", label: "Devis", icon: ClipboardList },
  { href: "/invoices", label: "Factures", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/settings/company", label: "Mon entreprise", icon: Settings },
  { href: "/settings/payments", label: "Paiements", icon: Wallet },
  { href: "/settings/billing", label: "Abonnement", icon: CreditCard },
  { href: "/settings/exports", label: "Exports", icon: Download },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount } = useUnreadNotifications();

  function handleDashboardClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    clearDashboardActivityIntent();
    stripDashboardActivityHash();

    if (pathname === "/dashboard") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    router.push("/dashboard", { scroll: true });
  }

  function handleLogoClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/dashboard") return;

    event.preventDefault();
    clearDashboardActivityIntent();
    stripDashboardActivityHash();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <aside
      className={cn(
        "sticky top-0 z-40 hidden h-dvh flex-col border-r border-[rgba(15,23,42,0.06)] bg-[#fcfcfd] dark:border-[rgba(148,163,184,0.12)] dark:bg-[rgba(15,23,42,0.92)] md:flex",
        sidebarWidthClassName,
      )}
      aria-label="Navigation principale"
    >
      <div className="flex h-[4.75rem] shrink-0 items-center px-5">
        <Link
          href="/dashboard"
          onClick={handleLogoClick}
          className="inline-flex items-center py-1 outline-none transition-opacity hover:opacity-90 focus-visible:ring-4 focus-visible:ring-[#2563eb]/20"
        >
          <BrandLogo variant="auto" size="md" />
        </Link>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2"
        aria-label="Navigation"
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={href === "/dashboard" ? handleDashboardClick : undefined}
              className={cn(
                sidebarNavItemClassName,
                "w-full justify-between",
                active && sidebarNavItemActiveClassName,
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Icon className="size-[1.125rem] shrink-0" aria-hidden />
                <span className="truncate">{label}</span>
              </span>
              {href === "/dashboard" ? (
                <UnreadNotificationBadge count={unreadCount} />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-[rgba(15,23,42,0.06)] p-3 dark:border-[rgba(148,163,184,0.12)]">
        <ThemeToggle />
        <SignOutButton />
      </div>
    </aside>
  );
}
