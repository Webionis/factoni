"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface LandingParallaxProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  /** Désactive la parallaxe en dessous de ce breakpoint Tailwind */
  disableBelow?: "sm" | "md" | "lg" | "xl";
}

/** Parallaxe scroll très légère — hero mock uniquement */
const BREAKPOINT_MIN: Record<NonNullable<LandingParallaxProps["disableBelow"]>, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export function LandingParallax({
  children,
  className,
  strength = 0.04,
  disableBelow,
}: LandingParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [parallaxEnabled, setParallaxEnabled] = useState(!disableBelow);

  useEffect(() => {
    if (!disableBelow) {
      setParallaxEnabled(true);
      return;
    }

    const minWidth = BREAKPOINT_MIN[disableBelow];
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);

    const update = () => setParallaxEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [disableBelow]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !parallaxEnabled) {
      setOffset(0);
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const viewCenter = window.innerHeight / 2;
        const delta = (center - viewCenter) * strength;
        setOffset(Math.max(-10, Math.min(10, delta)));
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [strength, parallaxEnabled]);

  return (
    <div
      ref={ref}
      className={cn("will-change-transform motion-reduce:transform-none", className)}
      style={{ transform: `translate3d(0, ${offset}px, 0)` }}
    >
      {children}
    </div>
  );
}
