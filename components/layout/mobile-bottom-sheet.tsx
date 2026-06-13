"use client";

import { useEffect, useId } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface MobileBottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function MobileBottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
}: MobileBottomSheetProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/40 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] animate-in fade-in-0 md:hidden"
        onClick={onClose}
        aria-hidden={false}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "fixed inset-x-0 bottom-0 z-[61] flex max-h-[min(85dvh,36rem)] flex-col overflow-hidden rounded-t-2xl border-t border-[rgba(15,23,42,0.06)] bg-popover shadow-[0_-8px_32px_rgba(15,23,42,0.12)] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] animate-in slide-in-from-bottom md:hidden",
          "pb-[env(safe-area-inset-bottom)]",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border/50 bg-popover/95 px-4 py-3 backdrop-blur-sm">
          <h2 id={titleId} className="text-base font-semibold tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fermer le menu"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2">
          {children}
        </div>
        {footer ? (
          <div className="shrink-0 border-t border-border/50 bg-popover px-4 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </>
  );
}
