"use client";

import { usePathname } from "next/navigation";

import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileQuickFab } from "@/components/layout/mobile-quick-fab";
import { Sidebar } from "@/components/layout/sidebar";
import { UnreadNotificationsProvider } from "@/components/notifications/unread-notifications-provider";
import {
  appContentAreaClassName,
  appContentInnerClassName,
  appContentMaxWidthClass,
} from "@/lib/constants/layout";
import { mobileMainPaddingBottomClassName } from "@/lib/constants/mobile";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  unreadNotificationCount?: number;
}

export function AppShell({
  children,
  title,
  unreadNotificationCount = 0,
}: AppShellProps) {
  const pathname = usePathname();
  const contentMaxWidth = appContentMaxWidthClass(pathname);

  return (
    <UnreadNotificationsProvider initialCount={unreadNotificationCount}>
      <div className="flex min-h-dvh overflow-x-hidden bg-[#fcfcfd] dark:bg-transparent md:h-dvh md:min-h-0">
        <Sidebar />

        <div className={cn(appContentAreaClassName, "min-h-dvh")}>
          <MobileHeader />

          {title ? (
            <header className="sticky top-0 z-30 hidden h-14 shrink-0 items-center border-b border-[rgba(15,23,42,0.06)] bg-white/90 px-4 backdrop-blur-sm dark:border-[rgba(148,163,184,0.12)] dark:bg-[rgba(15,23,42,0.85)] md:flex md:px-8">
              <h1 className="text-base font-semibold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
                {title}
              </h1>
            </header>
          ) : null}

          <main
            className={cn(
              "relative z-0 min-w-0 w-full flex-1 px-4 py-4 sm:py-6 md:min-h-0 md:overflow-y-auto md:px-8 md:py-10 lg:px-10",
              mobileMainPaddingBottomClassName,
            )}
            data-mobile-main="mounted"
          >
            <div className={cn(appContentInnerClassName, contentMaxWidth)}>
              {process.env.NODE_ENV === "development" ? (
                <p
                  className="mb-2 font-mono text-[10px] text-amber-600 md:hidden"
                  data-mobile-debug="content-mounted"
                >
                  content mounted
                </p>
              ) : null}
              {children}
            </div>
          </main>

          <MobileQuickFab />
          <BottomNav />
        </div>
      </div>
    </UnreadNotificationsProvider>
  );
}
