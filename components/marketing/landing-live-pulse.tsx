"use client";

export function LandingLivePulse() {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-[#94a3b8]">
      <span className="relative flex size-2" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#4ade80] opacity-50 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2 rounded-full bg-[#4ade80]" />
      </span>
      Mise à jour live
    </span>
  );
}
