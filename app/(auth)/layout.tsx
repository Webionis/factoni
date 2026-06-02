import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-lg font-semibold"
      >
        <Zap className="size-5 text-primary" aria-hidden />
        FactureFlash
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
