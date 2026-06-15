"use client";

import { useCallback, useState } from "react";
import { BellOff, ChevronDown } from "lucide-react";

import { NotificationItem } from "@/components/dashboard/notification-item";
import { Button } from "@/components/ui/button";
import {
  ACTIVITY_INITIAL_VISIBLE,
  type DashboardNotification,
} from "@/lib/data/notifications";
import {
  fadeInUpClassName,
  sectionHeadingClassName,
  sectionSubheadingClassName,
  surfaceCardClassName,
} from "@/lib/constants/ui";
import { DASHBOARD_ACTIVITY_SECTION_ID } from "@/lib/navigation/dashboard-activity";
import { cn } from "@/lib/utils";

interface DashboardNotificationsProps {
  notifications: DashboardNotification[];
  unreadCount: number;
  hasMoreActivities: boolean;
}

export function DashboardNotifications({
  notifications: initialNotifications,
  unreadCount: initialUnreadCount,
  hasMoreActivities,
}: DashboardNotificationsProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [expanded, setExpanded] = useState(false);

  const visibleNotifications = expanded
    ? notifications
    : notifications.slice(0, ACTIVITY_INITIAL_VISIBLE);

  const showExpandButton =
    hasMoreActivities && notifications.length > ACTIVITY_INITIAL_VISIBLE;

  const handleNotificationRead = useCallback((notificationId: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              isUnread: false,
              readAt: notification.readAt ?? new Date().toISOString(),
            }
          : notification,
      ),
    );
    setUnreadCount((current) => Math.max(0, current - 1));
  }, []);

  return (
    <section
      id={DASHBOARD_ACTIVITY_SECTION_ID}
      className="scroll-mt-[calc(3.5rem+env(safe-area-inset-top)+0.75rem)] min-w-0 space-y-4 md:scroll-mt-6"
      aria-labelledby="notifications-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="notifications-heading" className={sectionHeadingClassName}>
              Activité récente
            </h2>
            {unreadCount > 0 ? (
              <span className="inline-flex items-center rounded-full bg-[rgba(37,99,235,0.1)] px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[#2563eb] dark:bg-[rgba(59,130,246,0.16)] dark:text-[#93c5fd]">
                {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
              </span>
            ) : null}
          </div>
          <p className={cn("mt-0.5", sectionSubheadingClassName)}>
            Paiements, relances et événements sur vos documents.
          </p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div
          className={cn(
            surfaceCardClassName,
            fadeInUpClassName,
            "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
          )}
        >
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f8fafc] dark:bg-[rgba(15,23,42,0.5)]">
            <BellOff
              className="size-5 text-[#94a3b8] dark:text-[#64748b]"
              aria-hidden
            />
          </div>
          <p className="text-sm text-[#64748b] dark:text-[#94a3b8]">
            Aucune activité récente.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <ul
            className={cn(
              surfaceCardClassName,
              "divide-y divide-[rgba(15,23,42,0.06)] overflow-hidden dark:divide-[rgba(148,163,184,0.1)]",
            )}
          >
            {visibleNotifications.map((notification, index) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                index={index}
                onRead={handleNotificationRead}
              />
            ))}
          </ul>

          {showExpandButton && !expanded ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="h-11 gap-2"
                onClick={() => setExpanded(true)}
              >
                <ChevronDown className="size-4" aria-hidden />
                Voir plus
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
