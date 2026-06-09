import { CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PortalEmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  variant?: "default" | "success";
}

export function PortalEmptyState({
  icon: Icon,
  title,
  description,
  variant = "default",
}: PortalEmptyStateProps) {
  if (variant === "success") {
    return (
      <section
        className={cn(
          "rounded-xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/60 to-teal-50/25 px-6 py-10 text-center",
          "dark:border-emerald-900/40 dark:from-emerald-950/20 dark:to-teal-950/10",
        )}
      >
        <CheckCircle2
          className="mx-auto size-10 text-emerald-600 dark:text-emerald-400"
          aria-hidden
        />
        <h3 className="mt-4 text-base font-semibold tracking-tight">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      </section>
    );
  }

  return (
    <Card className="border-dashed shadow-none">
      <CardHeader className="items-center gap-3 pb-2 text-center">
        <Icon className="size-8 text-muted-foreground/50" aria-hidden />
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-8 text-center text-sm text-muted-foreground">
        {description}
      </CardContent>
    </Card>
  );
}
