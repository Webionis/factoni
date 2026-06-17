"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { UnreadNotificationBadge } from "@/components/layout/unread-notification-badge";
import { useUnreadNotifications } from "@/components/notifications/unread-notifications-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  clearDashboardActivityIntent,
  scrollToDashboardActivity,
  setDashboardActivityIntent,
  stripDashboardActivityHash,
} from "@/lib/navigation/dashboard-activity";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  className?: string;
}

export function MobileHeader({ className }: MobileHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount } = useUnreadNotifications();
  const hasUnread = unreadCount > 0;
  const onDashboard = pathname === "/dashboard";

  function handleBellClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!hasUnread) return;

    event.preventDefault();

    if (onDashboard) {
      scrollToDashboardActivity();
      return;
    }

    setDashboardActivityIntent();
    router.push("/dashboard");
  }

  function handleLogoClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/dashboard") return;

    event.preventDefault();
    clearDashboardActivityIntent();
    stripDashboardActivityHash();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur-md md:hidden dark:bg-[rgba(15,23,42,0.92)]",
        className,
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-[rgba(15,23,42,0.06)] px-4 dark:border-[rgba(148,163,184,0.12)]">
        <Link
          href="/dashboard"
          onClick={handleLogoClick}
          className="inline-flex items-center outline-none transition-opacity active:opacity-80"
          aria-label="Accueil Factoni"
        >
          <BrandLogo variant="auto" size="sm" />
        </Link>
        <div className="flex items-center gap-0.5">
          <ThemeToggle variant="icon" />
          <Link
            href="/dashboard"
            onClick={handleBellClick}
            className="relative flex size-10 items-center justify-center rounded-xl text-black transition-colors hover:bg-[rgba(15,23,42,0.06)] dark:text-white dark:hover:bg-[rgba(255,255,255,0.1)]"
            aria-label={
              hasUnread
                ? `Notifications, ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                : "Notifications"
            }
          >
            <Bell className="size-5" aria-hidden />
            <UnreadNotificationBadge
              count={unreadCount}
              className="absolute -right-1 top-1 h-4 min-w-4 px-1 text-[10px] leading-none"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
