"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { transitionPremiumClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "menu" | "icon";
  className?: string;
}

export function ThemeToggle({ variant = "menu", className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={cn(
          "flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          className,
        )}
        aria-pressed={isDark}
        aria-label={isDark ? "Activer le mode jour" : "Activer le mode nuit"}
      >
        {isDark ? (
          <Sun className="size-5" aria-hidden />
        ) : (
          <Moon className="size-5" aria-hidden />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium",
        transitionPremiumClassName,
        "text-[#475569] hover:border-[rgba(15,23,42,0.06)] hover:bg-white hover:text-[#0f172a]",
        "dark:text-slate-300 dark:hover:border-[rgba(148,163,184,0.12)] dark:hover:bg-white/5 dark:hover:text-[#f8fafc]",
      )}
      aria-pressed={isDark}
      aria-label={isDark ? "Activer le mode jour" : "Activer le mode nuit"}
    >
      {isDark ? (
        <Sun className="size-4 shrink-0 opacity-90" aria-hidden />
      ) : (
        <Moon className="size-4 shrink-0 opacity-90" aria-hidden />
      )}
      <span>{isDark ? "Mode jour" : "Mode nuit"}</span>
    </button>
  );
}
