"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MoreHorizontal,
  Users,
} from "lucide-react";

import { MobileMoreMenu } from "@/components/layout/mobile-more-menu";
import { UnreadNotificationBadge } from "@/components/layout/unread-notification-badge";
import { useUnreadNotifications } from "@/components/notifications/unread-notifications-provider";
import {
  clearDashboardActivityIntent,
  stripDashboardActivityHash,
} from "@/lib/navigation/dashboard-activity";
import {
  mobileNavItemActiveBgClassName,
  mobileNavItemActiveClassName,
  mobileNavItemInactiveClassName,
} from "@/lib/constants/mobile";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/quotes", label: "Devis", icon: ClipboardList },
  { href: "/invoices", label: "Factures", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
] as const;

function NavActiveIndicator({ active }: { active: boolean }) {
  return (
    <span
      className="flex h-[3px] w-7 items-center justify-center"
      aria-hidden
    >
      {active ? (
        <span className="h-full w-full rounded-full bg-[#2563eb] shadow-[0_0_8px_rgba(37,99,235,0.35)]" />
      ) : null}
    </span>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount } = useUnreadNotifications();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive = moreOpen || pathname.startsWith("/settings/");

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

  return (
    <>
      <div
        className="ff-liquid-glass-fade-bottom pointer-events-none fixed inset-x-0 bottom-0 z-40 h-36 md:hidden"
        aria-hidden
      />

      <nav
        className={cn(
          "ff-bottom-nav ff-liquid-glass-surface ff-liquid-glass-surface--bar fixed inset-x-3 z-50 md:hidden",
          "bottom-[max(0.625rem,env(safe-area-inset-bottom))]",
        )}
        aria-label="Navigation principale"
      >
        <div className="ff-liquid-glass-surface__lens" aria-hidden />
        <div className="ff-liquid-glass-surface__mirror" aria-hidden />
        <div className="ff-liquid-glass-surface__rim" aria-hidden />
        <ul className="relative isolate z-[2] mx-auto grid max-w-lg grid-cols-6 px-0.5 py-1.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={href === "/dashboard" ? handleDashboardClick : undefined}
                  className={cn(
                    "relative flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 text-[10px] font-semibold transition-[color,background-color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.96] touch-manipulation",
                    active
                      ? mobileNavItemActiveClassName
                      : mobileNavItemInactiveClassName,
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={cn(
                      "relative inline-flex rounded-xl p-1.5 transition-colors duration-[180ms]",
                      active && mobileNavItemActiveBgClassName,
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-[1.125rem]",
                        active ? mobileNavItemActiveClassName : "text-inherit",
                      )}
                      strokeWidth={active ? 2.25 : 2.15}
                      aria-hidden
                    />
                    {href === "/dashboard" ? (
                      <UnreadNotificationBadge
                        count={unreadCount}
                        className="absolute -right-2 -top-1.5 h-4 min-w-4 px-1 text-[10px] leading-none"
                      />
                    ) : null}
                  </span>
                  <span className="max-w-full truncate">{label}</span>
                  <NavActiveIndicator active={active} />
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                "relative flex min-h-[48px] w-full flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 text-[10px] font-semibold transition-[color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.96] touch-manipulation",
                moreActive
                  ? mobileNavItemActiveClassName
                  : mobileNavItemInactiveClassName,
              )}
              aria-expanded={moreOpen}
              aria-haspopup="dialog"
            >
              <span
                className={cn(
                  "rounded-xl p-1.5 transition-colors duration-[180ms]",
                  moreActive && mobileNavItemActiveBgClassName,
                )}
              >
                <MoreHorizontal
                  className={cn(
                    "size-[1.125rem]",
                    moreActive ? mobileNavItemActiveClassName : "text-inherit",
                  )}
                  strokeWidth={moreActive ? 2.25 : 2.15}
                  aria-hidden
                />
              </span>
              <span className="max-w-full truncate">Plus</span>
              <NavActiveIndicator active={moreActive} />
            </button>
          </li>
        </ul>
      </nav>

      <MobileMoreMenu open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
