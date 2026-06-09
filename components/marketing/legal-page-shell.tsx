import Link from "next/link";

import {
  legalPageDisclaimerClassName,
  legalPageSectionCardClassName,
  legalPageSectionTitleClassName,
  marketingSectionClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface LegalPageShellProps {
  title: string;
  lead?: string;
  updatedAt?: string;
  children: React.ReactNode;
}

export function LegalPageShell({
  title,
  lead,
  updatedAt,
  children,
}: LegalPageShellProps) {
  return (
    <div className={cn(marketingSectionClassName, "flex-1 px-5 py-12 sm:px-8 sm:py-16")}>
      <article className="mx-auto w-full max-w-3xl">
        <header className="mb-10 sm:mb-12">
          {updatedAt ? (
            <p className="text-xs font-medium tracking-wide text-[#94a3b8]">
              Dernière mise à jour : {updatedAt}
            </p>
          ) : null}
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#0f172a] sm:text-[1.75rem]">
            {title}
          </h1>
          {lead ? (
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#64748b]">
              {lead}
            </p>
          ) : null}
        </header>

        <div className="space-y-5">{children}</div>

        <p className={cn(legalPageDisclaimerClassName, "mt-10")}>
          Ces informations doivent être adaptées à votre situation juridique, votre
          structure et vos prestataires avant mise en production. Elles ne
          constituent pas une validation juridique définitive.
        </p>

        <p className="mt-8">
          <Link
            href="/"
            className="text-[15px] font-medium text-[#2563eb] transition-opacity duration-[180ms] hover:opacity-80"
          >
            ← Retour à l&apos;accueil
          </Link>
        </p>
      </article>
    </div>
  );
}

interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className={legalPageSectionCardClassName}>
      <h2 className={legalPageSectionTitleClassName}>{title}</h2>
      <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-[#64748b]">
        {children}
      </div>
    </section>
  );
}
