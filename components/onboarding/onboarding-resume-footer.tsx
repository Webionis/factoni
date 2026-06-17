"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingResumeFooterProps {
  userEmail?: string | null;
  className?: string;
}

export function OnboardingResumeFooter({
  userEmail,
  className,
}: OnboardingResumeFooterProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <section
      className={cn(
        "mt-10 border-t border-[rgba(15,23,42,0.06)] pt-8 dark:border-[rgba(148,163,184,0.12)]",
        className,
      )}
      aria-labelledby="onboarding-resume-heading"
    >
      <h2
        id="onboarding-resume-heading"
        className="text-center text-sm font-semibold text-[#0f172a] dark:text-[#f8fafc]"
      >
        Terminer plus tard ?
      </h2>
      <p className="mx-auto mt-2 max-w-md text-center text-sm leading-relaxed text-[#64748b] dark:text-[#94a3b8]">
        Vous pouvez quitter cette étape et revenir quand vous voulez. Utilisez
        la même adresse email et le mot de passe définis à l&apos;inscription
        pour vous reconnecter — vous retrouverez automatiquement ce formulaire
        tant que votre entreprise n&apos;est pas enregistrée.
      </p>
      {userEmail ? (
        <p className="mt-3 text-center text-xs text-[#94a3b8] dark:text-[#64748b]">
          Compte connecté :{" "}
          <span className="font-medium text-[#475569] dark:text-[#cbd5e1]">
            {userEmail}
          </span>
        </p>
      ) : null}
      <div className="mt-4 flex justify-center">
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2 px-4"
          disabled={isPending}
          onClick={() => startTransition(() => signOut())}
        >
          <LogOut className="size-4" aria-hidden />
          {isPending ? "Déconnexion…" : "Se déconnecter et revenir plus tard"}
        </Button>
      </div>
    </section>
  );
}
