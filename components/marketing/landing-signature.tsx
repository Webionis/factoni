import {
  landingMockGlowClassName,
  landingMockHoverClassName,
  landingMockStackClassName,
  landingSignatureBeamClassName,
  landingSignatureGridClassName,
  landingSignatureHaloClassName,
} from "@/lib/constants/marketing-landing";
import { cn } from "@/lib/utils";

/** Texture grille + halo — identité Factoni */
export function LandingSignatureBackdrop({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  return (
    <>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-100",
          variant === "dark" ? "ff-signature-dark-grid" : landingSignatureGridClassName,
          className,
        )}
        aria-hidden
      />
      {variant === "light" ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            landingSignatureHaloClassName,
          )}
          aria-hidden
        />
      ) : null}
    </>
  );
}

/** Ligne lumineuse signature en haut de section */
export function LandingSignatureBeam({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0",
        landingSignatureBeamClassName,
        className,
      )}
      aria-hidden
    />
  );
}

/** Cadre mock premium : layering + glow signature */
export function LandingMockFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div
        className="pointer-events-none absolute -inset-x-2 -bottom-3 top-6 -z-10 rounded-2xl border border-[rgba(37,99,235,0.07)] bg-gradient-to-b from-white to-[#f5f8ff] shadow-[0_12px_40px_rgba(37,99,235,0.09),0_24px_56px_rgba(15,23,42,0.05)] sm:-inset-x-4 sm:-bottom-4 sm:top-8"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-6 top-12 z-0 hidden h-[72%] w-[55%] rounded-xl border border-[rgba(15,23,42,0.04)] bg-white/50 shadow-[0_8px_32px_rgba(15,23,42,0.04)] sm:block"
        aria-hidden
      />
      <div
        className={cn(
          "relative z-10",
          landingMockStackClassName,
          landingMockHoverClassName,
        )}
      >
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
