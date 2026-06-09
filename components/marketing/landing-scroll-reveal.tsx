"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface LandingScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isMobileViewport(): boolean {
  return window.matchMedia("(max-width: 767px)").matches;
}

function isElementInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const viewHeight =
    window.innerHeight || document.documentElement.clientHeight;
  return rect.top < viewHeight * 0.95 && rect.bottom > 8;
}

/**
 * Révélation au scroll — desktop uniquement.
 * Mobile : toujours visible via CSS (Safari iOS ne déclenche pas
 * IntersectionObserver de façon fiable sur la landing).
 */
export function LandingScrollReveal({
  children,
  className,
  delayMs = 0,
}: LandingScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion() || isMobileViewport()) {
      setVisible(true);
      return;
    }

    let observer: IntersectionObserver | null = null;
    let fallbackId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const reveal = () => {
      if (cancelled) return;
      setVisible(true);
      observer?.disconnect();
      observer = null;
      if (fallbackId !== undefined) {
        clearTimeout(fallbackId);
        fallbackId = undefined;
      }
    };

    const startObserver = () => {
      if (cancelled || isElementInViewport(el)) {
        reveal();
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) reveal();
        },
        { threshold: 0, rootMargin: "0px" },
      );
      observer.observe(el);

      fallbackId = setTimeout(reveal, 600);
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(startObserver);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (fallbackId !== undefined) clearTimeout(fallbackId);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "max-md:translate-y-0 max-md:opacity-100 max-md:transition-none",
        "md:transition-all md:duration-[280ms] md:ease-[cubic-bezier(0.22,1,0.36,1)]",
        "motion-reduce:md:translate-y-0 motion-reduce:md:opacity-100",
        visible
          ? "md:translate-y-0 md:opacity-100"
          : "md:translate-y-3 md:opacity-0",
        className,
      )}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
