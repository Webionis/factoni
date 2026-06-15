"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarked,
  CreditCard,
  Download,
  LogOut,
  Send,
  Settings,
  Wallet,
} from "lucide-react";
import { useTransition } from "react";

import { MobileBottomSheet } from "@/components/layout/mobile-bottom-sheet";
import { signOut } from "@/lib/actions/auth";
import {
  mobileMoreMenuItemActiveClassName,
  mobileMoreMenuItemClassName,
  mobileNavItemActiveClassName,
} from "@/lib/constants/mobile";
import { cn } from "@/lib/utils";

const moreNavItems = [
  { href: "/settings/company", label: "Mon entreprise", icon: Settings },
  { href: "/settings/catalog", label: "Catalogue", icon: BookMarked },
  { href: "/settings/einvoicing", label: "Facturation électronique", icon: Send },
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
                    mobileMoreMenuItemClassName,
                    active && mobileMoreMenuItemActiveClassName,
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[1.125rem] shrink-0",
                      active ? mobileNavItemActiveClassName : "text-inherit",
                    )}
                    strokeWidth={active ? 2.25 : 2.15}
                    aria-hidden
                  />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-3 border-t border-border/50 px-2 pt-3">
        <button
          type="button"
          onClick={() => {
            onClose();
            startTransition(() => signOut());
          }}
          disabled={isPending}
          className={cn(
            mobileMoreMenuItemClassName,
            "text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/10",
          )}
        >
          <LogOut className="size-[1.125rem] shrink-0" aria-hidden />
          <span>{isPending ? "Déconnexion…" : "Se déconnecter"}</span>
        </button>
      </div>
    </MobileBottomSheet>
  );
}
