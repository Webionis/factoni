"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  Download,
  LogOut,
  Settings,
  Wallet,
} from "lucide-react";
import { useTransition } from "react";

import { MobileBottomSheet } from "@/components/layout/mobile-bottom-sheet";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { signOut } from "@/lib/actions/auth";
import { sidebarNavItemActiveClassName, sidebarNavItemClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const moreNavItems = [
  { href: "/settings/company", label: "Mon entreprise", icon: Settings },
  { href: "/settings/payments", label: "Paiements", icon: Wallet },
  { href: "/settings/billing", label: "Abonnement", icon: CreditCard },
  { href: "/settings/exports", label: "Exports", icon: Download },
] as const;

interface MobileMoreMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMoreMenu({ open, onClose }: MobileMoreMenuProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <MobileBottomSheet open={open} onClose={onClose} title="Plus">
      <nav aria-label="Réglages et options">
        <ul className="space-y-0.5">
          {moreNavItems.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={cn(
                    sidebarNavItemClassName,
                    "min-h-12 w-full rounded-xl px-4",
                    active && sidebarNavItemActiveClassName,
                  )}
                >
                  <Icon className="size-[1.125rem] shrink-0" aria-hidden />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-3 space-y-2 border-t border-border/50 px-2 pt-3">
        <div className="flex min-h-12 items-center justify-between rounded-xl px-3">
          <span className="text-sm font-medium">Thème</span>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={() => {
            onClose();
            startTransition(() => signOut());
          }}
          disabled={isPending}
          className={cn(
            sidebarNavItemClassName,
            "min-h-12 w-full rounded-xl px-4 text-destructive hover:bg-destructive/10 hover:text-destructive",
          )}
        >
          <LogOut className="size-[1.125rem] shrink-0" aria-hidden />
          <span>{isPending ? "Déconnexion…" : "Se déconnecter"}</span>
        </button>
      </div>
    </MobileBottomSheet>
  );
}
