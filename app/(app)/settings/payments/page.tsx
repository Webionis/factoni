import { redirect } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { StripeConnectCard } from "@/components/settings/stripe-connect-card";
import { getStripeConnectProfile } from "@/lib/data/stripe-connect";
import { pageMetadata } from "@/lib/metadata";
import { isStripeConfigured } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

export const metadata = pageMetadata("payments");

export default async function PaymentsSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const connectProfile = await getStripeConnectProfile(supabase, user.id);

  return (
    <div className="w-full space-y-8 pb-4">
      <PageHeader
        title="Paiements"
        description="Connectez Stripe pour que vos clients paient vos factures en ligne. Les fonds arrivent directement sur votre compte."
      />
      <StripeConnectCard
        connectProfile={connectProfile}
        stripeConfigured={isStripeConfigured()}
      />
    </div>
  );
}
