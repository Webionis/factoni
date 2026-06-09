import type { Metadata } from "next";

import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { PublicThemeGuard } from "@/components/theme/public-theme-guard";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.ogTitle,
    description: siteConfig.description,
    url: siteConfig.url,
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicThemeGuard />
      <MarketingHeader />
      <main className="flex flex-1 flex-col overflow-x-hidden ff-app-gradient">
        {children}
      </main>
      <MarketingFooter />
    </>
  );
}
