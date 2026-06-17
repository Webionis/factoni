"use client";

import { useEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

import {
  buildLiquidGlassFilterMarkup,
  navGlassOptionsForSize,
} from "@/lib/ui/liquid-glass-filter";

const LIQUID_READY_CLASS = "ff-bottom-nav--liquid";

type LiquidGlassNavFilterProps = {
  targetRef: RefObject<HTMLElement | null>;
};

export function LiquidGlassNavFilter({ targetRef }: LiquidGlassNavFilterProps) {
  const [filterMarkup, setFilterMarkup] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;

    const rebuild = () => {
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      if (width < 2 || height < 2) return;

      const radius = Math.min(width, height) / 2;
      const markup = buildLiquidGlassFilterMarkup(
        width,
        height,
        radius,
        navGlassOptionsForSize(width, height),
      );
      if (!markup) return;

      setFilterMarkup(markup);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        element.classList.add(LIQUID_READY_CLASS);
      });
    };

    const scheduleRebuild = () => {
      clearTimeout(timer);
      timer = setTimeout(rebuild, 16);
    };

    scheduleRebuild();

    const resizeObserver = new ResizeObserver(scheduleRebuild);
    resizeObserver.observe(element);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      element.classList.remove(LIQUID_READY_CLASS);
    };
  }, [targetRef]);

  if (!mounted || !filterMarkup) return null;

  return createPortal(
    <svg
      aria-hidden
      className="pointer-events-none fixed size-0 overflow-hidden"
      xmlns="http://www.w3.org/2000/svg"
      colorInterpolationFilters="sRGB"
    >
      <defs dangerouslySetInnerHTML={{ __html: filterMarkup }} />
    </svg>,
    document.body,
  );
}
