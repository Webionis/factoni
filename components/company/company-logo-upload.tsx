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
import {
  formSectionDescriptionClassName,
  formSectionTitleClassName,
  surfaceCardClassName,
} from "@/lib/constants/ui";
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
    <section
      className={cn(
        surfaceCardClassName,
        "min-w-0 overflow-hidden p-4 sm:p-5",
      )}
    >
      <div>
        <h2 className={formSectionTitleClassName}>Identité visuelle</h2>
        <p className={cn("mt-0.5 text-[13px]", formSectionDescriptionClassName)}>
          Logo sur vos factures PDF — PNG, JPG ou WebP (max. 2 Mo).
        </p>
      </div>
      <FeaturePlanHint
        feature="customLogo"
        variant={isBeta ? "beta-offered" : "future-plan"}
        className="mt-2"
      />

      {!hasCompany ? (
        <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">
          Enregistrez d&apos;abord votre entreprise pour ajouter un logo.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <div
            className={cn(
              "flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-[rgba(15,23,42,0.1)] bg-[#fafbfc]/80 p-4 dark:border-[rgba(148,163,184,0.14)] dark:bg-[rgba(15,23,42,0.35)]",
              previewUrl && "border-[rgba(37,99,235,0.12)]",
            )}
          >
            {previewUrl ? (
              <div className="relative h-16 w-full max-w-[180px]">
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

          <div className="flex w-full min-w-0 flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full gap-2"
              disabled={uploading || removing}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
              ) : (
                <Upload className="size-4 shrink-0" aria-hidden />
              )}
              <span className="truncate">
                {uploading
                  ? "Envoi…"
                  : previewUrl
                    ? "Remplacer le logo"
                    : "Ajouter un logo"}
              </span>
            </Button>
            {previewUrl ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full gap-2 border-destructive/25 text-destructive hover:bg-destructive/5 hover:text-destructive"
                disabled={uploading || removing}
                onClick={handleRemove}
              >
                {removing ? (
                  <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="size-4 shrink-0" aria-hidden />
                )}
                Supprimer le logo
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
