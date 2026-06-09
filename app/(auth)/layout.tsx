import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { PublicThemeGuard } from "@/components/theme/public-theme-guard";
import { transitionPremiumClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ff-app-gradient flex min-h-dvh flex-col items-center justify-start overflow-y-auto px-5 pb-[max(3.5rem,env(safe-area-inset-bottom))] pt-[max(3.5rem,env(safe-area-inset-top))] sm:justify-center sm:px-6 sm:py-16">
      <PublicThemeGuard />
      <Link
        href="/"
        className={cn(
          "mb-12 flex flex-col items-center sm:mb-14",
          transitionPremiumClassName,
          "hover:opacity-90",
        )}
      >
        <BrandLogo variant="black" size="xl" priority />
      </Link>
      <div className="w-full max-w-[26rem]">{children}</div>
    </div>
  );
}
