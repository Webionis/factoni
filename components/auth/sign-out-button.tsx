"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  className?: string;
  variant?: "sidebar" | "ghost";
}

export function SignOutButton({
  className,
  variant = "sidebar",
}: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        variant === "sidebar" &&
          "w-full justify-start gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-[#f8fafc]",
        className,
      )}
      disabled={isPending}
      onClick={() => startTransition(() => signOut())}
    >
      <LogOut className="size-4 shrink-0" aria-hidden />
      {isPending ? "Déconnexion…" : "Se déconnecter"}
    </Button>
  );
}
