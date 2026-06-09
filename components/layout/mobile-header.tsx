"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { UnreadNotificationBadge } from "@/components/layout/unread-notification-badge";
import { useUnreadNotifications } from "@/components/notifications/unread-notifications-provider";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  className?: string;
}

export function MobileHeader({ className }: MobileHeaderProps) {
  const { unreadCount } = useUnreadNotifications();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-14 shrink-0 items-center justify-between border-b border-[rgba(15,23,42,0.06)] bg-white/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-sm dark:border-[rgba(148,163,184,0.12)] dark:bg-[rgba(15,23,42,0.85)] md:hidden",
        className,
      )}
    >
      <Link
        href="/dashboard"
        className="inline-flex items-center py-1 outline-none transition-opacity active:opacity-80"
        aria-label="Accueil Factoni"
      >
        <BrandLogo variant="auto" size="sm" />
      </Link>
      <Link
        href="/dashboard"
        className="relative flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
            : "Notifications"
        }
      >
        <Bell className="size-5" aria-hidden />
        <UnreadNotificationBadge
          count={unreadCount}
          className="absolute -right-0.5 -top-0.5 h-4 min-w-4 px-1 text-[10px] leading-none"
        />
      </Link>
    </header>
  );
}
