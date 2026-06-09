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
      <nav
        className="ff-glass fixed inset-x-0 bottom-0 z-50 border-t pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(15,23,42,0.06)] md:hidden"
        aria-label="Navigation principale"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5 px-1 pt-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "relative flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-medium transition-[color,background-color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] touch-manipulation",
                    active
                      ? "text-[#2563eb]"
                      : "text-muted-foreground hover:text-slate-900 dark:hover:text-[#f8fafc]",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {active ? (
                    <span
                      className="absolute inset-x-2 top-1 h-0.5 rounded-full bg-primary"
                      aria-hidden
                    />
                  ) : null}
                  <span className="relative inline-flex">
                    <Icon
                      className={cn("size-5", active && "text-primary")}
                      aria-hidden
                    />
                    {href === "/dashboard" ? (
                      <UnreadNotificationBadge
                        count={unreadCount}
                        className="absolute -right-2.5 -top-1.5 h-4 min-w-4 px-1 text-[10px] leading-none"
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
                "relative flex min-h-[52px] w-full flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-medium transition-[color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] touch-manipulation",
                moreActive
                  ? "text-[#2563eb]"
                  : "text-muted-foreground hover:text-slate-900 dark:hover:text-[#f8fafc]",
              )}
              aria-expanded={moreOpen}
              aria-haspopup="dialog"
            >
              {moreActive ? (
                <span
                  className="absolute inset-x-2 top-1 h-0.5 rounded-full bg-primary"
                  aria-hidden
                />
              ) : null}
              <MoreHorizontal
                className={cn("size-5", moreActive && "text-primary")}
                aria-hidden
              />
              <span>Plus</span>
            </button>
          </li>
        </ul>
      </nav>

      <MobileMoreMenu open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
