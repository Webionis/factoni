"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
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
  transitionPremiumClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setServerError(null);
    setSuccessMessage(null);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings/company`,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    setSuccessMessage(
      "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
    );
  }

  return (
    <Card className={authCardClassName}>
      <CardHeader className={authCardHeaderClassName}>
        <CardTitle className={authCardTitleClassName}>
          Mot de passe oublié
        </CardTitle>
        <CardDescription className={authCardDescriptionClassName}>
          Nous vous enverrons un lien pour choisir un nouveau mot de passe.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className={authCardContentClassName}>
          {serverError ? (
            <p
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {serverError}
            </p>
          ) : null}
          {successMessage ? (
            <p
              className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm"
              role="status"
            >
              {successMessage}
            </p>
          ) : null}
          <FormField
            label="Email"
            htmlFor="email"
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="h-11"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
          </FormField>
        </CardContent>
        <CardFooter className={authCardFooterClassName}>
          <Button
            type="submit"
            className="h-11 w-full"
            disabled={isSubmitting || !!successMessage}
          >
            {isSubmitting ? "Envoi…" : "Envoyer le lien"}
          </Button>
          <Link
            href="/login"
            className={cn(
              "text-center text-sm text-[#2563eb]",
              transitionPremiumClassName,
              "hover:underline",
            )}
          >
            Retour à la connexion
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
