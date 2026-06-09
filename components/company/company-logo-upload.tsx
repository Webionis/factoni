"use client";

import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  removeCompanyLogoAction,
  uploadCompanyLogoAction,
} from "@/lib/actions/company-logo";
import { FeaturePlanHint } from "@/components/billing/feature-plan-hint";
import { useSubscriptionAccess } from "@/components/billing/subscription-provider";
import { applyActionResult, runServerAction } from "@/lib/client/action-feedback";
import { Button } from "@/components/ui/button";
import { surfaceCardClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface CompanyLogoUploadProps {
  initialPreviewUrl: string | null;
  hasCompany: boolean;
}

export function CompanyLogoUpload({
  initialPreviewUrl,
  hasCompany,
}: CompanyLogoUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialPreviewUrl,
  );
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const { isBeta } = useSubscriptionAccess();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploading || removing) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await runServerAction(() =>
      uploadCompanyLogoAction(formData),
    );

    if (
      applyActionResult(result, router, {
        successMessage: "Logo enregistré",
      })
    ) {
      setPreviewUrl(result.previewUrl ?? null);
      router.refresh();
    }

    setUploading(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (uploading || removing) return;
    setRemoving(true);
    const result = await runServerAction(() => removeCompanyLogoAction());
    if (
      applyActionResult(result, router, {
        successMessage: "Logo supprimé",
      })
    ) {
      setPreviewUrl(null);
      router.refresh();
    }
    setRemoving(false);
  }

  return (
    <section className={cn(surfaceCardClassName, "p-6 sm:p-7")}>
      <h2 className="text-base font-semibold tracking-tight text-foreground">
        Identité visuelle
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Votre logo sur chaque facture PDF — PNG, JPG ou WebP (max. 2 Mo).
      </p>
      <FeaturePlanHint
        feature="customLogo"
        variant={isBeta ? "beta-offered" : "future-plan"}
        className="mt-2"
      />

      {!hasCompany ? (
        <p className="mt-4 text-sm text-amber-700 dark:text-amber-400">
          Enregistrez d&apos;abord votre entreprise ci-dessous pour ajouter un
          logo.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <div
            className={cn(
              "flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-slate-200/90 bg-white p-6 shadow-sm",
              previewUrl ? "border-slate-200/90" : "",
            )}
          >
            {previewUrl ? (
              <div className="relative h-20 w-full max-w-[200px]">
                <Image
                  src={previewUrl}
                  alt="Logo entreprise"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon className="size-10 opacity-50" aria-hidden />
                <span className="text-sm">Aucun logo</span>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={uploading || removing}
            onChange={handleFileChange}
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 gap-2"
              disabled={uploading || removing}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Upload className="size-4" aria-hidden />
              )}
              {uploading
                ? "Envoi…"
                : previewUrl
                  ? "Remplacer le logo"
                  : "Ajouter un logo"}
            </Button>
            {previewUrl ? (
              <Button
                type="button"
                variant="ghost"
                className="h-11 gap-2 text-destructive hover:text-destructive"
                disabled={uploading || removing}
                onClick={handleRemove}
              >
                {removing ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="size-4" aria-hidden />
                )}
                Supprimer
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
