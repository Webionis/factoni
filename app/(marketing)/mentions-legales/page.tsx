import Link from "next/link";

import {
  LegalPageShell,
  LegalSection,
} from "@/components/marketing/legal-page-shell";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("legalNotice", {
  description: "Mentions légales du service Factoni.",
});

export default function MentionsLegalesPage() {
  return (
    <LegalPageShell
      title="Mentions légales"
      lead="Informations relatives à l’éditeur, à l’hébergement et aux conditions d’utilisation du site Factoni."
    >
      <LegalSection title="Éditeur du site">
        <ul className="list-none space-y-1 p-0">
          <li>
            <strong className="font-medium text-[#334155]">Nom commercial :</strong>{" "}
            Factoni
          </li>
          <li>
            <strong className="font-medium text-[#334155]">
              Responsable de publication :
            </strong>{" "}
            À compléter
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Forme juridique :</strong>{" "}
            À compléter
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Adresse :</strong> À compléter
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Email de contact :</strong>{" "}
            À compléter
          </li>
          <li>
            <strong className="font-medium text-[#334155]">SIREN / SIRET :</strong> À
            compléter si société déclarée
          </li>
          <li>
            <strong className="font-medium text-[#334155]">
              TVA intracommunautaire :
            </strong>{" "}
            À compléter si applicable
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          <strong className="font-medium text-[#334155]">Hébergeur :</strong> Vercel Inc.
        </p>
        <p>
          <strong className="font-medium text-[#334155]">Adresse :</strong> 440 N Barranca
          Ave #4133, Covina, CA 91723, États-Unis
        </p>
        <p>
          <strong className="font-medium text-[#334155]">Site :</strong>{" "}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2563eb] hover:underline"
          >
            vercel.com
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Directeur de publication">
        <p>À compléter</p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L&apos;ensemble du site, de son interface, de ses textes, éléments graphiques,
          logos, icônes, composants et contenus sont protégés par le droit de la
          propriété intellectuelle. Toute reproduction, représentation, modification ou
          exploitation non autorisée est interdite.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <p>
          Factoni met tout en œuvre pour assurer l&apos;exactitude des informations
          présentées, mais ne garantit pas l&apos;absence d&apos;erreurs ou
          d&apos;interruptions. L&apos;utilisateur reste responsable de l&apos;usage du
          service, des informations saisies et des documents générés.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Pour en savoir plus sur le traitement de vos données personnelles, consultez
          notre{" "}
          <Link href="/confidentialite" className="font-medium text-[#2563eb] hover:underline">
            politique de confidentialité
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          Le site peut utiliser des cookies strictement nécessaires au fonctionnement du
          service. Si des cookies analytiques ou marketing sont ajoutés plus tard, un
          bandeau de consentement devra être mis en place.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          <strong className="font-medium text-[#334155]">Email :</strong> À compléter
        </p>
      </LegalSection>

      <p className="rounded-xl border border-dashed border-[rgba(15,23,42,0.1)] bg-white/60 px-4 py-3 text-[13px] leading-relaxed text-[#94a3b8]">
        Cette page est fournie à titre informatif et doit être adaptée à votre situation
        juridique avant ouverture publique.
      </p>
    </LegalPageShell>
  );
}
