import { SubscriptionProvider } from "@/components/billing/subscription-provider";
import { AppShell } from "@/components/layout/app-shell";
import { AppThemeProvider } from "@/components/theme/app-theme-provider";
import { AppThemeScript } from "@/components/theme/app-theme-script";
import { buildSubscriptionAccess } from "@/lib/billing/access";
import { getUnreadNotificationsCount } from "@/lib/data/notifications";
import { getSubscriptionForUser } from "@/lib/data/subscriptions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/** Zone authentifiée : jamais de cache statique (session Supabase). */
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [subscription, unreadNotificationCount] = await Promise.all([
    getSubscriptionForUser(supabase, user.id),
    getUnreadNotificationsCount(supabase, user.id),
  ]);
  const access = buildSubscriptionAccess(subscription);

  return (
    <>
      <AppThemeScript />
      <AppThemeProvider>
        <SubscriptionProvider access={access}>
          <AppShell unreadNotificationCount={unreadNotificationCount}>
            {children}
          </AppShell>
        </SubscriptionProvider>
      </AppThemeProvider>
    </>
  );
}
