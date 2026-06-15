import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";

interface AppPageShellProps {
  backHref: string;
  backLabel: string;
  title: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AppPageShell({
  backHref,
  backLabel,
  title,
  description,
  eyebrow,
  action,
  children,
  className,
}: AppPageShellProps) {
  return (
    <div className={cn("w-full space-y-6 md:space-y-8", className)}>
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {backLabel}
      </Link>
      <PageHeader
        title={title}
        description={description}
        eyebrow={eyebrow}
        action={action}
      />
      {children}
    </div>
  );
}
