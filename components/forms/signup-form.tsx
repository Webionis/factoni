"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  betaBadgeHintClassName,
  transitionPremiumClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { signupSchema, type SignupFormValues } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignupFormValues) {
    setServerError(null);
    setSuccessMessage(null);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    if (data.user && !data.session) {
      setSuccessMessage(
        "Un email de confirmation vous a été envoyé. Cliquez sur le lien pour activer votre compte.",
      );
      return;
    }

    router.refresh();
    router.push("/onboarding");
  }

  return (
    <Card className={authCardClassName}>
      <CardHeader className={authCardHeaderClassName}>
        <CardTitle className={authCardTitleClassName}>Créer un compte</CardTitle>
        <p className={betaBadgeHintClassName}>Accès gratuit pendant la bêta.</p>
        <CardDescription className={authCardDescriptionClassName}>
          Commencez à facturer en quelques minutes.
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
              className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground"
              role="status"
            >
              {successMessage}
            </p>
          ) : null}
          <FormField
            label="Nom complet"
            htmlFor="fullName"
            error={errors.fullName?.message}
          >
            <Input
              id="fullName"
              autoComplete="name"
              className="h-11"
              aria-invalid={!!errors.fullName}
              {...register("fullName")}
            />
          </FormField>
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
          <FormField
            label="Mot de passe"
            htmlFor="password"
            error={errors.password?.message}
            hint="8 caractères minimum, lettre et chiffre"
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              className="h-11"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
          </FormField>
          <FormField
            label="Confirmer le mot de passe"
            htmlFor="confirmPassword"
            error={errors.confirmPassword?.message}
          >
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="h-11"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
          </FormField>
        </CardContent>
        <CardFooter className={authCardFooterClassName}>
          <Button
            type="submit"
            className="h-11 w-full"
            disabled={isSubmitting || !!successMessage}
          >
            {isSubmitting ? "Création…" : "Créer mon compte"}
          </Button>
          <p className="text-center text-sm">
            <Link
              href="/login"
              className={cn(
                "text-[#2563eb]",
                transitionPremiumClassName,
                "hover:underline",
              )}
            >
              Déjà un compte ? Se connecter
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
