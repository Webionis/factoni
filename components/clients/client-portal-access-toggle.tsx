"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { toggleClientPortalAccessAction } from "@/lib/client-portal/actions";

interface ClientPortalAccessToggleProps {
  clientId: string;
  enabled: boolean;
}

export function ClientPortalAccessToggle({
  clientId,
  enabled,
}: ClientPortalAccessToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleClientPortalAccessAction(clientId, !enabled);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        enabled
          ? "Accès portail désactivé"
          : "Accès portail activé",
      );
      router.refresh();
    });
  }

  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <input
        type="checkbox"
        className="size-4 rounded border-border"
        checked={enabled}
        disabled={isPending}
        onChange={handleToggle}
      />
      <span>
        Accès portail client{" "}
        <span className="text-muted-foreground">
          {enabled ? "activé" : "désactivé"}
        </span>
      </span>
    </label>
  );
}
