import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>
          Accédez à vos factures et clients. Formulaire fonctionnel en Phase 2.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Configurez Supabase dans <code className="text-xs">.env.local</code>{" "}
          puis implémentez l&apos;auth email.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-sm">
        <Link href="/signup" className="text-primary hover:underline">
          Créer un compte
        </Link>
        <Link
          href="/forgot-password"
          className="text-muted-foreground hover:underline"
        >
          Mot de passe oublié
        </Link>
      </CardFooter>
    </Card>
  );
}
