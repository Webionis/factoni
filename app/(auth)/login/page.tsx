import { Suspense } from "react";

import { LoginForm } from "@/components/forms/login-form";
import { pageMetadata } from "@/lib/metadata";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  authCardClassName,
  authCardContentClassName,
  authCardHeaderClassName,
} from "@/lib/constants/ui";

export const metadata = pageMetadata("login");

function LoginFormFallback() {
  return (
    <Card className={authCardClassName}>
      <CardHeader className={authCardHeaderClassName}>
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className={authCardContentClassName}>
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
