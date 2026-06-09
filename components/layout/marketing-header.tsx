import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { marketingHeaderClassName, transitionPremiumClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
  return (
    <header className={marketingHeaderClassName}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:h-[4.75rem] sm:px-8">
        <Link
          href="/"
          className={cn(
            "inline-flex items-center py-1 outline-none focus-visible:ring-4 focus-visible:ring-[#2563eb]/20",
            transitionPremiumClassName,
            "hover:opacity-90",
          )}
        >
          <BrandLogo variant="black" size="lg" priority />
        </Link>
        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden h-9 px-3 text-[#64748b] hover:text-[#0f172a] sm:inline-flex sm:h-10 sm:px-4",
            )}
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-9 whitespace-nowrap px-3.5 text-sm shadow-sm sm:h-10 sm:px-5",
            )}
          >
            Créer un compte
          </Link>
        </nav>
      </div>
    </header>
  );
}
