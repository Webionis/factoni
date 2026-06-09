"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import {
  BRAND_LOGO_BLACK_SRC,
  BRAND_LOGO_WHITE_SRC,
  brandLogoDisplayHeightPx,
  brandLogoDisplayWidth,
  brandLogoHeightClassName,
} from "@/lib/constants/brand";
import { cn } from "@/lib/utils";

export type BrandLogoVariant = "auto" | "black" | "white";
export type BrandLogoSize = keyof typeof brandLogoDisplayHeightPx;

export interface BrandLogoProps {
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  className?: string;
  priority?: boolean;
}

function resolveLogoSrc(variant: "black" | "white"): string {
  return variant === "white" ? BRAND_LOGO_WHITE_SRC : BRAND_LOGO_BLACK_SRC;
}

export function BrandLogo({
  variant = "auto",
  size = "md",
  className,
  priority = false,
}: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedVariant: "black" | "white" =
    variant === "auto"
      ? mounted && resolvedTheme === "dark"
        ? "white"
        : "black"
      : variant;

  const displayHeight = brandLogoDisplayHeightPx[size];
  const displayWidth = brandLogoDisplayWidth(size);

  return (
    <span className={cn("inline-flex shrink-0 items-center leading-none", className)}>
      <Image
        src={resolveLogoSrc(resolvedVariant)}
        alt="Factoni"
        width={displayWidth}
        height={displayHeight}
        priority={priority}
        unoptimized
        className={cn(
          "block w-auto max-w-none shrink-0 object-contain object-left",
          brandLogoHeightClassName[size],
        )}
      />
    </span>
  );
}
