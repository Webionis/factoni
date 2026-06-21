import Link from "next/link";

import { LegalCrossLinks } from "@/components/marketing/legal-cross-links";
import { LegalHostingDetails } from "@/components/marketing/legal-hosting-details";
import {
  LegalPublicationDirector,
  LegalPublisherDetails,
} from "@/components/marketing/legal-publisher-details";
import {
  LegalPageShell,
  LegalSection,
} from "@/components/marketing/legal-page-shell";
import {
  DATA_HOSTING,
  PAYMENT_PROVIDER,
  SITE_HOSTING,
} from "@/lib/legal/hosting";
import { getLegalPublisher } from "@/lib/legal/publisher";
import { LEGAL_ROUTES } from "@/lib/legal/urls";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("legalNotice", {
  description:
    "Mentions légales du site et du service Factoni — éditeur, hébergement, propriété intellectuelle et contact.",
});

export default function MentionsLegalesPage() {
  const publisher = getLegalPublisher();

  return (
    <LegalPageShell
      title="Mentions légales"
      updatedAt="02/06/2026"
      lead="Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN), les présentes mentions légales précisent l'identité des intervenants et les conditions d'accès au site Factoni."
    >
      <LegalSection title="Présentation du service">
        <p>
          {publisher.tradeName} est un service en ligne de facturation et de gestion
          commerciale à destination des artisans, indépendants et petites entreprises
          en France (devis, factures, relances, exports comptables et fonctionnalités
          associées).
        </p>
        <p>
          L&apos;accès au service suppose l&apos;acceptation des présentes mentions
          légales, des{" "}
          <Link href={LEGAL_ROUTES.cgu} className="font-medium text-[#2563eb] hover:underline">
            conditions générales d&apos;utilisation (CGU)
          </Link>
          , des{" "}
          <Link href={LEGAL_ROUTES.cgv} className="font-medium text-[#2563eb] hover:underline">
            conditions générales de vente (CGV)
          </Link>{" "}
          le cas échéant, et de la{" "}
          <Link
            href={LEGAL_ROUTES.confidentialite}
            className="font-medium text-[#2563eb] hover:underline"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Éditeur du site">
        <LegalPublisherDetails />
      </LegalSection>

      <LegalSection title="Directeur de la publication">
        <LegalPublicationDirector />
      </LegalSection>

      <LegalSection title="Hébergement du site">
        <LegalHostingDetails provider={SITE_HOSTING} />
      </LegalSection>

      <LegalSection title="Hébergement des données">
        <LegalHostingDetails provider={DATA_HOSTING} />
        <p className="text-[14px] text-[#94a3b8]">
          Les données applicatives (comptes, clients, factures, fichiers) sont
          traitées via des prestataires techniques agissant en qualité de
          sous-traitants au sens du RGPD.
        </p>
      </LegalSection>

      <LegalSection title="Paiements en ligne">
        <p>
          Les abonnements payants à {publisher.tradeName} sont traités par{" "}
          <strong className="font-medium text-[#334155]">
            {PAYMENT_PROVIDER.name}
          </strong>{" "}
          ({PAYMENT_PROVIDER.role}). Les coordonnées bancaires ne sont pas
          stockées par {publisher.tradeName} : elles sont collectées directement
          par le prestataire de paiement.
        </p>
        <p>
          <a
            href={PAYMENT_PROVIDER.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2563eb] hover:underline"
          >
            {PAYMENT_PROVIDER.websiteLabel}
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L&apos;ensemble du site {publisher.websiteUrl}, de son interface, de ses
          textes, éléments graphiques, logos, icônes, composants logiciels,
          documentations et contenus est la propriété exclusive de l&apos;éditeur ou
          de ses partenaires, sauf mention contraire.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication,
          adaptation ou exploitation, totale ou partielle, par quelque procédé que
          ce soit, sans autorisation écrite préalable de l&apos;éditeur, est
          interdite et constitue une contrefaçon susceptible d&apos;engager la
          responsabilité civile et pénale de son auteur.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <p>
          {publisher.tradeName} s&apos;efforce d&apos;assurer l&apos;exactitude et la
          mise à jour des informations diffusées sur le site. Toutefois, l&apos;éditeur
          ne peut garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des
          informations mises à disposition, ni l&apos;absence d&apos;interruption ou
          d&apos;erreur du service.
        </p>
        <p>
          L&apos;utilisateur reste seul responsable de l&apos;usage du service, des
          informations qu&apos;il saisit, des documents qu&apos;il émet (devis,
          factures, mentions obligatoires, TVA, archivage) et du respect de ses
          obligations légales, comptables et fiscales.
        </p>
        <p>
          {publisher.tradeName} est un outil d&apos;aide à la gestion : il ne se
          substitue pas à un expert-comptable, un avocat ou un conseiller fiscal.
        </p>
      </LegalSection>

      <LegalSection title="Liens hypertextes">
        <p>
          Le site peut contenir des liens vers des sites tiers. {publisher.tradeName}{" "}
          n&apos;exerce aucun contrôle sur ces sites et décline toute responsabilité
          quant à leur contenu ou aux éventuels dommages résultant de leur
          consultation.
        </p>
        <p>
          Tout lien vers le site {publisher.websiteUrl} doit faire l&apos;objet d&apos;une
          autorisation préalable écrite de l&apos;éditeur, sauf lien simple
          mentionnant clairement la destination.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Pour connaître les modalités de collecte et de traitement de vos données
          personnelles, consultez notre{" "}
          <Link
            href={LEGAL_ROUTES.confidentialite}
            className="font-medium text-[#2563eb] hover:underline"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Cookies et traceurs">
        <p>
          Le site utilise des cookies et traceurs strictement nécessaires au
          fonctionnement du service (session, authentification, préférences
          essentielles).
        </p>
        <p>
          Si des cookies de mesure d&apos;audience ou marketing sont déployés
          ultérieurement, un mécanisme de recueil du consentement conforme au
          réglement applicable sera mis en place avant leur activation.
        </p>
      </LegalSection>

      <LegalSection title="Droit applicable et litiges">
        <p>
          Les présentes mentions légales sont régies par le droit français. En cas
          de litige, et à défaut de résolution amiable, les tribunaux français
          seront seuls compétents, sous réserve des règles impératives applicables
          aux consommateurs.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Pour toute question relative au site ou au service, vous pouvez nous
          écrire à{" "}
          <a
            href={`mailto:${publisher.email}`}
            className="font-medium text-[#2563eb] hover:underline"
          >
            {publisher.email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalCrossLinks current={LEGAL_ROUTES.mentionsLegales} />
    </LegalPageShell>
  );
}
