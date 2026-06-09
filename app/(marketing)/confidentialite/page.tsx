import Link from "next/link";

import {
  LegalPageShell,
  LegalSection,
} from "@/components/marketing/legal-page-shell";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("privacy", {
  description:
    "Politique de confidentialité et traitement des données personnelles sur Factoni.",
});

export default function ConfidentialitePage() {
  return (
    <LegalPageShell
      title="Politique de confidentialité"
      updatedAt="03/06/2026"
      lead="La présente politique explique comment Factoni collecte, utilise, conserve et protège les données personnelles des utilisateurs du service."
    >
      <LegalSection title="Introduction">
        <p>
          La présente politique explique comment Factoni collecte, utilise, conserve
          et protège les données personnelles des utilisateurs du service.
        </p>
      </LegalSection>

      <LegalSection title="Responsable du traitement">
        <ul className="list-none space-y-1 p-0">
          <li>
            <strong className="font-medium text-[#334155]">Nom :</strong> À compléter
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Adresse :</strong> À compléter
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Email :</strong> À compléter
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Données collectées">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="font-medium text-[#334155]">Données de compte :</strong>{" "}
            nom, email, mot de passe chiffré via Supabase Auth
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Données entreprise :</strong>{" "}
            nom commercial, raison sociale, adresse, SIREN/SIRET, TVA, logo
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Données clients :</strong>{" "}
            nom, email, téléphone, adresse, informations de facturation
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Données de facturation :</strong>{" "}
            factures, lignes, montants, statuts, PDF, notes
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Données techniques :</strong>{" "}
            adresse IP, logs techniques, informations de session
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Données de support</strong> si
            l&apos;utilisateur contacte Factoni
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Finalités">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Création et gestion du compte utilisateur</li>
          <li>Authentification</li>
          <li>Création et gestion des clients</li>
          <li>Création, génération et suivi des factures</li>
          <li>Génération de PDF</li>
          <li>Sécurisation du service</li>
          <li>Support utilisateur</li>
          <li>Amélioration du produit</li>
          <li>Obligations légales et comptables</li>
        </ul>
      </LegalSection>

      <LegalSection title="Bases légales RGPD">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Exécution du contrat</li>
          <li>Obligation légale</li>
          <li>Intérêt légitime</li>
          <li>Consentement lorsque nécessaire</li>
        </ul>
      </LegalSection>

      <LegalSection title="Durées de conservation">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="font-medium text-[#334155]">Données de compte :</strong>{" "}
            durée d&apos;utilisation du service puis suppression sur demande
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Factures :</strong> durée
            nécessaire aux obligations comptables et légales applicables
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Logs techniques :</strong>{" "}
            durée limitée nécessaire à la sécurité
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Données de support :</strong>{" "}
            durée nécessaire au traitement de la demande
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Destinataires et sous-traitants">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="font-medium text-[#334155]">Supabase :</strong>{" "}
            authentification, base de données, stockage
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Vercel :</strong> hébergement
          </li>
          <li>
            <strong className="font-medium text-[#334155]">
              Outil d&apos;erreur / monitoring
            </strong>{" "}
            si activé : Sentry
          </li>
          <li>Aucun partage commercial avec des tiers</li>
        </ul>
      </LegalSection>

      <LegalSection title="Hébergement et transferts hors UE">
        <p>
          Les données peuvent être hébergées ou traitées par des prestataires techniques.
          Supabase est configuré en région Europe lorsque applicable. Si certains
          prestataires sont situés hors Union européenne, des garanties appropriées
          (clauses contractuelles types ou équivalent) doivent être mises en place.
        </p>
      </LegalSection>

      <LegalSection title="Sécurité">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Accès sécurisé et authentification</li>
          <li>Row Level Security (RLS) sur Supabase</li>
          <li>Bucket privé pour les logos</li>
          <li>Contrôle d&apos;accès par compte utilisateur</li>
          <li>Mesures techniques et organisationnelles raisonnables</li>
        </ul>
      </LegalSection>

      <LegalSection title="Droits des utilisateurs">
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Droit d&apos;accès</li>
          <li>Rectification</li>
          <li>Effacement</li>
          <li>Opposition</li>
          <li>Limitation du traitement</li>
          <li>Portabilité</li>
          <li>Retrait du consentement lorsque le traitement en est fondé</li>
          <li>
            Réclamation auprès de la{" "}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2563eb] hover:underline"
            >
              CNIL
            </a>
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Exercer ses droits">
        <p>
          Pour exercer vos droits, contactez-nous à l&apos;adresse suivante :{" "}
          <strong className="font-medium text-[#334155]">À compléter</strong>
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          Les cookies strictement nécessaires au fonctionnement du service peuvent être
          utilisés. Les cookies analytiques ou marketing nécessiteront un consentement
          préalable s&apos;ils sont ajoutés ultérieurement.
        </p>
      </LegalSection>

      <LegalSection title="Modification de la politique">
        <p>
          Factoni peut modifier cette politique afin de refléter les évolutions du
          service ou de la réglementation. La date de mise à jour est indiquée en haut de
          cette page.
        </p>
      </LegalSection>

      <p className="text-[13px] leading-relaxed text-[#94a3b8]">
        Voir également nos{" "}
        <Link href="/mentions-legales" className="text-[#2563eb] hover:underline">
          mentions légales
        </Link>
        .
      </p>
    </LegalPageShell>
  );
}
