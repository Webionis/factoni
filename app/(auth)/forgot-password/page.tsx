import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("forgotPassword");

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
