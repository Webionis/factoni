import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 shrink-0 items-center border-b border-[rgba(15,23,42,0.06)] bg-white px-5 sm:h-[4.75rem] sm:px-8 dark:border-[rgba(148,163,184,0.12)] dark:bg-[#0f172a]">
        <Link
          href="/"
          className="inline-flex items-center py-1 outline-none transition-opacity hover:opacity-90 focus-visible:ring-4 focus-visible:ring-[#2563eb]/20"
        >
          <BrandLogo variant="black" size="lg" />
        </Link>
      </header>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8 pb-12">
        {children}
      </main>
    </div>
  );
}
