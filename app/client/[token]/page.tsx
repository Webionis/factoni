import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ClientPortalView } from "@/components/client-portal/client-portal-view";
import { getClientPortalByToken } from "@/lib/client-portal/data";
import { siteConfig } from "@/lib/site";

interface ClientPortalPageProps {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: `Espace client — ${siteConfig.name}`,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ClientPortalPage({
  params,
}: ClientPortalPageProps) {
  const { token } = await params;
  const payload = await getClientPortalByToken(token);

  if (!payload) {
    notFound();
  }

  return <ClientPortalView payload={payload} />;
}
