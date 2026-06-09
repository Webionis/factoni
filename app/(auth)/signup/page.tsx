import { SignupForm } from "@/components/forms/signup-form";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("signup");

export default function SignupPage() {
  return <SignupForm />;
}
