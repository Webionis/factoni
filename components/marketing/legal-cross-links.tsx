import Link from "next/link";

import { LEGAL_ROUTES } from "@/lib/legal/urls";

const LINKS = [
  { href: LEGAL_ROUTES.mentionsLegales, label: "Mentions légales" },
  { href: LEGAL_ROUTES.cgu, label: "CGU" },
  { href: LEGAL_ROUTES.cgv, label: "CGV" },
  { href: LEGAL_ROUTES.confidentialite, label: "Politique de confidentialité" },
] as const;

interface LegalCrossLinksProps {
  /** Page courante — masquée de la liste */
  current?: (typeof LINKS)[number]["href"];
}

export function LegalCrossLinks({ current }: LegalCrossLinksProps) {
  const visible = LINKS.filter((link) => link.href !== current);

  return (
    <p className="text-[13px] leading-relaxed text-[#94a3b8]">
      Voir aussi :{" "}
      {visible.map((link, index) => (
        <span key={link.href}>
          {index > 0 ? " · " : null}
          <Link href={link.href} className="text-[#2563eb] hover:underline">
            {link.label}
          </Link>
        </span>
      ))}
    </p>
  );
}
