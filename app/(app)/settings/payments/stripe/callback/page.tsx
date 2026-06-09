import { redirect } from "next/navigation";

import { getStripeConnectProfile, syncStripeConnectProfileFromStripe } from "@/lib/data/stripe-connect";
import { isStripeConfigured } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

export default async function StripeConnectCallbackPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (isStripeConfigured()) {
    const connectProfile = await getStripeConnectProfile(supabase, user.id);
    if (connectProfile?.accountId) {
      await syncStripeConnectProfileFromStripe(
        supabase,
        user.id,
        connectProfile.accountId,
      );
    }
  }

  redirect("/settings/payments");
}
