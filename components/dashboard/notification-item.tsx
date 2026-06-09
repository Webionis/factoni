"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Bell, CircleDollarSign, FileCheck } from "lucide-react";

import { useUnreadNotifications } from "@/components/notifications/unread-notifications-provider";
import { markNotificationAsReadAction } from "@/lib/actions/notifications";
import { formatRelativeTimeFr } from "@/lib/date/relative";
import {
  fadeInUpClassName,
  interactiveRowClassName,
  transitionPremiumClassName,
} from "@/lib/constants/ui";
import { formatCurrency } from "@/lib/invoices/calculate";
import type { DashboardNotification } from "@/lib/data/notifications";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: DashboardNotification;
  index: number;
  onRead?: (notificationId: string) => void;
}

function activityDocumentNumber(notification: DashboardNotification): string {
  if (
    notification.type === "invoice_paid" ||
    notification.type === "invoice_reminder_sent"
  ) {
    return notification.data.invoice_number;
  }
  return notification.data.quote_number;
}

function activityClientName(notification: DashboardNotification): string {
  return notification.data.client_name;
}

function activityAmountLabel(notification: DashboardNotification): string {
  if (
    notification.type === "quote_deposit_requested" ||
    notification.type === "quote_deposit_paid"
  ) {
    return formatCurrency(notification.data.deposit_amount);
  }
  if (notification.type === "invoice_reminder_sent") {
    return formatCurrency(notification.data.amount_ttc);
  }
  return `${formatCurrency(notification.data.amount_ttc)} TTC`;
}

export function NotificationItem({
  notification,
  index,
  onRead,
}: NotificationItemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { decrementUnreadCount } = useUnreadNotifications();

  function handleOpen() {
    startTransition(async () => {
      if (notification.isUnread) {
        decrementUnreadCount();
        onRead?.(notification.id);
        await markNotificationAsReadAction(notification.id);
      }
      router.push(notification.href);
    });
  }

  const actionLabel =
    notification.type === "invoice_paid" ||
    notification.type === "invoice_reminder_sent"
      ? "Voir la facture"
      : "Voir le devis";
  const isDepositNotification =
    notification.type === "quote_deposit_requested" ||
    notification.type === "quote_deposit_paid";
  const isReminderNotification =
    notification.type === "invoice_reminder_sent";

  return (
    <li
      className={cn(
        fadeInUpClassName,
        "motion-safe:[animation-delay:calc(var(--ff-stagger,0ms)+40ms*var(--ff-i,0))]",
      )}
      style={
        {
          "--ff-i": index,
        } as React.CSSProperties
      }
    >
      <button
        type="button"
        onClick={handleOpen}
        disabled={isPending}
        className={cn(
          "group flex w-full items-start gap-3 px-5 py-4 text-left sm:items-center sm:px-6",
          interactiveRowClassName,
          transitionPremiumClassName,
        )}
      >
        <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(37,99,235,0.08)] dark:bg-[rgba(59,130,246,0.14)]">
          {notification.type === "invoice_paid" ||
          notification.type === "quote_deposit_paid" ? (
            <CircleDollarSign
              className="size-4.5 text-[#2563eb] dark:text-[#93c5fd]"
              aria-hidden
            />
          ) : isReminderNotification ? (
            <Bell
              className="size-4.5 text-[#2563eb] dark:text-[#93c5fd]"
              aria-hidden
            />
          ) : (
            <FileCheck
              className="size-4.5 text-[#2563eb] dark:text-[#93c5fd]"
              aria-hidden
            />
          )}
          {notification.isUnread ? (
            <span
              className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[#2563eb] ring-2 ring-white motion-safe:animate-pulse dark:bg-[#60a5fa] dark:ring-[rgba(30,41,59,0.9)]"
              aria-hidden
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              {notification.title}
            </p>
            {notification.isUnread ? (
              <span className="inline-flex shrink-0 items-center rounded-full bg-[rgba(37,99,235,0.1)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#2563eb] dark:bg-[rgba(59,130,246,0.18)] dark:text-[#93c5fd]">
                Nouveau
              </span>
            ) : null}
          </div>
          <p className="text-sm leading-relaxed text-[#64748b] dark:text-[#94a3b8]">
            <span className="font-medium text-[#0f172a] dark:text-[#f1f5f9]">
              {activityClientName(notification)}
            </span>
            {" · "}
            {activityDocumentNumber(notification)}
            {" · "}
            <span className="tabular-nums">
              {activityAmountLabel(notification)}
              {isDepositNotification
                ? " acompte"
                : isReminderNotification
                  ? " TTC"
                  : ""}
            </span>
          </p>
          <p className="text-xs text-[#94a3b8] dark:text-[#64748b]">
            {formatRelativeTimeFr(notification.createdAt)}
          </p>
        </div>

        <span
          className={cn(
            "hidden shrink-0 rounded-lg border border-[rgba(37,99,235,0.12)] px-3 py-1.5 text-xs font-semibold text-[#2563eb]",
            "group-hover:border-[rgba(37,99,235,0.22)] group-hover:bg-[rgba(37,99,235,0.04)]",
            "dark:border-[rgba(96,165,250,0.2)] dark:text-[#93c5fd] dark:group-hover:bg-[rgba(59,130,246,0.1)]",
            "sm:inline-flex",
            transitionPremiumClassName,
          )}
        >
          {actionLabel}
        </span>
      </button>
    </li>
  );
}
