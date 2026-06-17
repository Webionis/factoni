"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { LiquidGlassNavFilter } from "@/components/layout/liquid-glass-nav-filter";
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
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/quotes", label: "Devis", icon: ClipboardList },
  { href: "/invoices", label: "Factures", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
] as const;

const navItemBaseClassName =
  "relative flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-2xl px-0.5 text-[11px] font-semibold transition-[color,background-color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.96] touch-manipulation";

const navItemInactiveClassName = "text-black dark:text-white";

const navItemActiveClassName = "text-black dark:text-white";

const navItemActivePillClassName =
  "bg-[rgba(15,23,42,0.07)] dark:bg-[rgba(255,255,255,0.16)]";

export function BottomNav() {
  const navRef = useRef<HTMLElement>(null);
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
      <LiquidGlassNavFilter targetRef={navRef} />
      <nav
        ref={navRef}
        className={cn(
          "ff-bottom-nav fixed inset-x-4 z-50 md:hidden",
          "bottom-[max(0.75rem,env(safe-area-inset-bottom))]",
        )}
        aria-label="Navigation principale"
      >
        <ul className="relative z-[1] mx-auto grid max-w-lg grid-cols-6 px-1 py-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  prefetch
                  onClick={href === "/dashboard" ? handleDashboardClick : undefined}
                  className={cn(
                    navItemBaseClassName,
                    active ? navItemActiveClassName : navItemInactiveClassName,
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={cn(
                      "relative inline-flex rounded-2xl p-2 transition-[background-color,color] duration-[180ms]",
                      active && navItemActivePillClassName,
                    )}
                  >
                    <Icon
                      className="size-5"
                      strokeWidth={active ? 2.35 : 2}
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
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                navItemBaseClassName,
                "w-full",
                moreActive ? navItemActiveClassName : navItemInactiveClassName,
              )}
              aria-expanded={moreOpen}
              aria-haspopup="dialog"
            >
              <span
                className={cn(
                  "rounded-2xl p-2 transition-[background-color,color] duration-[180ms]",
                  moreActive && navItemActivePillClassName,
                )}
              >
                <MoreHorizontal
                  className="size-5"
                  strokeWidth={moreActive ? 2.35 : 2}
                  aria-hidden
                />
              </span>
              <span className="max-w-full truncate">Plus</span>
            </button>
          </li>
        </ul>
      </nav>

      <MobileMoreMenu open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
