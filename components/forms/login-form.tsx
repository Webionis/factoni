"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  authCardClassName,
  authCardContentClassName,
  authCardDescriptionClassName,
  authCardFooterClassName,
  authCardHeaderClassName,
  authCardTitleClassName,
  inputClassName,
  transitionPremiumClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";
import { FormField } from "@/components/ui/form-field";
import { loginSchema } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";

const AUTH_ERRORS: Record<string, string> = {
  auth_callback: "La connexion a échoué. Réessayez.",
  invalid_credentials: "Email ou mot de passe incorrect.",
  session_expired: "Votre session a expiré. Reconnectez-vous.",
};

function readLoginValues(form: HTMLFormElement) {
  const email = (
    form.elements.namedItem("email") as HTMLInputElement | null
  )?.value?.trim() ?? "";
  const password = (
    form.elements.namedItem("password") as HTMLInputElement | null
  )?.value ?? "";
  return { email, password };
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const errorCode = searchParams.get("error");
  const [serverError, setServerError] = useState<string | null>(
    errorCode ? (AUTH_ERRORS[errorCode] ?? "Une erreur est survenue.") : null,
  );
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitLogin(email: string, password: string) {
    setIsSubmitting(true);
    setServerError(null);
    setFieldErrors({});

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setServerError(
          error.message.includes("Invalid login")
            ? AUTH_ERRORS.invalid_credentials
            : error.message,
        );
        return;
      }

      router.refresh();
      router.push(redirectTo);

      // Safari iOS : fallback si la navigation client ne part pas.
      window.setTimeout(() => {
        if (window.location.pathname === "/login") {
          window.location.assign(redirectTo);
        }
      }, 400);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Connexion impossible. Réessayez.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const values = readLoginValues(form);
    const parsed = loginSchema.safeParse(values);

    if (!parsed.success) {
      const issues = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        email: issues.email?.[0],
        password: issues.password?.[0],
      });
      setServerError(
        issues.email?.[0] ??
          issues.password?.[0] ??
          "Vérifiez votre email et votre mot de passe.",
      );
      return;
    }

    await submitLogin(parsed.data.email, parsed.data.password);
  }

  return (
    <Card className={authCardClassName}>
      <CardHeader className={authCardHeaderClassName}>
        <CardTitle className={authCardTitleClassName}>Connexion</CardTitle>
        <CardDescription className={authCardDescriptionClassName}>
          Accédez à vos factures et à votre espace professionnel.
        </CardDescription>
      </CardHeader>
      <form
        ref={formRef}
        onSubmit={(event) => void handleFormSubmit(event)}
        noValidate
        className="touch-manipulation"
      >
        <CardContent className={authCardContentClassName}>
          {serverError ? (
            <p
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {serverError}
            </p>
          ) : null}
          <FormField
            label="Email"
            htmlFor="email"
            error={fieldErrors.email}
          >
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="vous@exemple.fr"
              aria-invalid={!!fieldErrors.email}
              className={inputClassName}
            />
          </FormField>
          <FormField
            label="Mot de passe"
            htmlFor="password"
            error={fieldErrors.password}
          >
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              enterKeyHint="go"
              aria-invalid={!!fieldErrors.password}
              className={inputClassName}
            />
          </FormField>
        </CardContent>
        <CardFooter className={authCardFooterClassName}>
          <button
            type="submit"
            className={cn(
              buttonVariants(),
              "h-11 min-h-11 w-full touch-manipulation",
            )}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Connexion…" : "Se connecter"}
          </button>
          <div className="flex w-full flex-col gap-2 text-center text-sm">
            <Link
              href="/signup"
              className={cn(
                "text-[#2563eb]",
                transitionPremiumClassName,
                "hover:underline",
              )}
            >
              Créer un compte
            </Link>
            <Link
              href="/forgot-password"
              className={cn(
                "text-[#64748b]",
                transitionPremiumClassName,
                "hover:text-[#0f172a] hover:underline",
              )}
            >
              Mot de passe oublié
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
