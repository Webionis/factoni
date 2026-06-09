"use client";

import { Eraser } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SignaturePadHandle {
  isEmpty: () => boolean;
  toDataUrl: () => string;
  clear: () => void;
}

interface SignaturePadProps {
  className?: string;
}

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad({ className }, ref) {
    const padRef = useRef<SignatureCanvas | null>(null);

    useImperativeHandle(ref, () => ({
      isEmpty: () => padRef.current?.isEmpty() ?? true,
      toDataUrl: () => padRef.current?.toDataURL("image/png") ?? "",
      clear: () => padRef.current?.clear(),
    }));

    return (
      <div className={cn("space-y-2", className)}>
        <div className="relative overflow-hidden rounded-xl border border-border bg-white shadow-inner dark:bg-zinc-950">
          <SignatureCanvas
            ref={padRef}
            penColor="#0f172a"
            canvasProps={{
              className: "h-40 w-full touch-none sm:h-44",
              "aria-label": "Zone de signature",
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-8 mx-6 border-b border-dashed border-slate-300" />
          <p className="pointer-events-none absolute bottom-2 left-4 text-[11px] text-muted-foreground">
            Signez ici
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 text-muted-foreground"
          onClick={() => padRef.current?.clear()}
        >
          <Eraser className="size-3.5" aria-hidden />
          Effacer la signature
        </Button>
      </div>
    );
  },
);
