"use client";

import { Link2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getClientPortalLinkAction } from "@/lib/client-portal/actions";

interface CopyClientPortalLinkButtonProps {
  clientId: string;
  disabled?: boolean;
}

export function CopyClientPortalLinkButton({
  clientId,
  disabled = false,
}: CopyClientPortalLinkButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleCopy() {
    if (isPending || disabled) return;
    startTransition(async () => {
      const result = await getClientPortalLinkAction(clientId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      try {
        await navigator.clipboard.writeText(result.url);
        toast.success("Lien espace client copié");
      } catch {
        toast.error("Impossible de copier le lien.");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="gap-2"
      disabled={disabled || isPending}
      onClick={handleCopy}
    >
      <Link2 className="size-4" aria-hidden />
      {isPending ? "…" : "Copier lien espace client"}
    </Button>
  );
}
