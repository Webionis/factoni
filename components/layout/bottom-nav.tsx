"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  MoreHorizontal,
  Users,
} from "lucide-react";

import { MobileMoreMenu } from "@/components/layout/mobile-more-menu";
import { UnreadNotificationBadge } from "@/components/layout/unread-notification-badge";
import { useUnreadNotifications } from "@/components/notifications/unread-notifications-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/quotes", label: "Devis", icon: ClipboardList },
  { href: "/invoices", label: "Factures", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useUnreadNotifications();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive = moreOpen || pathname.startsWith("/settings/");

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-24 bg-gradient-to-t from-[rgba(241,245,249,0.95)] via-[rgba(241,245,249,0.5)] to-transparent md:hidden dark:from-[rgba(15,23,42,0.85)] dark:via-[rgba(15,23,42,0.35)]"
        aria-hidden
      />

      <nav
        className={cn(
          "ff-bottom-nav fixed inset-x-3 z-50 md:hidden",
          "bottom-[max(0.5rem,env(safe-area-inset-bottom))]",
          "rounded-2xl border border-[rgba(15,23,42,0.08)]",
          "bg-white/88 shadow-[0_8px_32px_rgba(15,23,42,0.1),0_2px_8px_rgba(15,23,42,0.04)]",
          "backdrop-blur-xl backdrop-saturate-150",
          "dark:border-[rgba(148,163,184,0.14)] dark:bg-[rgba(15,23,42,0.88)]",
          "dark:shadow-[0_8px_32px_rgba(0,0,0,0.35),0_2px_8px_rgba(0,0,0,0.2)]",
        )}
        aria-label="Navigation principale"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5 px-1 py-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "relative flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-semibold transition-[color,background-color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.96] touch-manipulation",
                    active
                      ? "text-[#2563eb]"
                      : "text-[#94a3b8] hover:text-[#475569] dark:hover:text-[#e2e8f0]",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {active ? (
                    <span
                      className="absolute inset-x-2.5 top-0.5 h-[3px] rounded-full bg-[#2563eb] shadow-[0_0_8px_rgba(37,99,235,0.35)]"
                      aria-hidden
                    />
                  ) : null}
                  <span
                    className={cn(
                      "relative inline-flex rounded-xl p-1.5 transition-colors duration-[180ms]",
                      active && "bg-[rgba(37,99,235,0.08)] dark:bg-[rgba(59,130,246,0.14)]",
                    )}
                  >
                    <Icon
                      className={cn("size-[1.125rem]", active && "text-[#2563eb]")}
                      strokeWidth={active ? 2.25 : 2}
                      aria-hidden
                    />
                    {href === "/dashboard" ? (
                      <UnreadNotificationBadge
                        count={unreadCount}
                        className="absolute -right-2 -top-1.5 h-4 min-w-4 px-1 text-[10px] leading-none"
                      />
                    ) : null}
                  </span>
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                "relative flex min-h-[48px] w-full flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-semibold transition-[color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.96] touch-manipulation",
                moreActive
                  ? "text-[#2563eb]"
                  : "text-[#94a3b8] hover:text-[#475569] dark:hover:text-[#e2e8f0]",
              )}
              aria-expanded={moreOpen}
              aria-haspopup="dialog"
            >
              {moreActive ? (
                <span
                  className="absolute inset-x-2.5 top-0.5 h-[3px] rounded-full bg-[#2563eb] shadow-[0_0_8px_rgba(37,99,235,0.35)]"
                  aria-hidden
                />
              ) : null}
              <span
                className={cn(
                  "rounded-xl p-1.5 transition-colors duration-[180ms]",
                  moreActive && "bg-[rgba(37,99,235,0.08)] dark:bg-[rgba(59,130,246,0.14)]",
                )}
              >
                <MoreHorizontal
                  className={cn("size-[1.125rem]", moreActive && "text-[#2563eb]")}
                  strokeWidth={moreActive ? 2.25 : 2}
                  aria-hidden
                />
              </span>
              <span>Plus</span>
            </button>
          </li>
        </ul>
      </nav>

      <MobileMoreMenu open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
