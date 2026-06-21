import Link from "next/link";

import { LegalCrossLinks } from "@/components/marketing/legal-cross-links";
import {
  LegalPageShell,
  LegalSection,
} from "@/components/marketing/legal-page-shell";
import { LegalPublisherDetails } from "@/components/marketing/legal-publisher-details";
import { LAUNCH_OFFER, PUBLIC_PRICING_PLANS } from "@/lib/billing/plans";
import { getLegalPublisher } from "@/lib/legal/publisher";
import { LEGAL_ROUTES } from "@/lib/legal/urls";
import { pageMetadata } from "@/lib/metadata";

const starterPlan = PUBLIC_PRICING_PLANS.find((plan) => plan.id === "starter")!;
const proPlan = PUBLIC_PRICING_PLANS.find((plan) => plan.id === "pro")!;

export const metadata = pageMetadata("termsOfUse", {
  description:
    "Conditions générales d'utilisation du service Factoni — droits, obligations et responsabilités.",
});

export default function CguPage() {
  const publisher = getLegalPublisher();

  return (
    <LegalPageShell
      title="Conditions générales d'utilisation"
      updatedAt="02/06/2026"
      lead={`Les présentes conditions générales d'utilisation (« CGU ») régissent l'accès et l'utilisation du service ${publisher.tradeName}, accessible depuis ${publisher.websiteUrl.replace(/^https?:\/\//, "")}.`}
    >
      <LegalSection title="1. Objet et champ d'application">
        <p>
          Les CGU définissent les modalités d&apos;accès et d&apos;utilisation du
          service {publisher.tradeName}, logiciel en ligne de facturation et de
          gestion commerciale (devis, factures, clients, agenda, exports et
          fonctionnalités associées).
        </p>
        <p>
          Elles s&apos;appliquent à toute personne physique ou morale créant un
          compte ou utilisant le service (« l&apos;Utilisateur »). L&apos;éditeur
          est l&apos;entrepreneur identifié ci-dessous (« l&apos;Éditeur »).
        </p>
        <p>
          Les conditions financières des abonnements payants sont complétées par
          les{" "}
          <Link href={LEGAL_ROUTES.cgv} className="text-[#2563eb] hover:underline">
            conditions générales de vente (CGV)
          </Link>
          . Le traitement des données personnelles est décrit dans la{" "}
          <Link
            href={LEGAL_ROUTES.confidentialite}
            className="text-[#2563eb] hover:underline"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Éditeur du service">
        <LegalPublisherDetails />
      </LegalSection>

      <LegalSection title="3. Acceptation">
        <p>
          La création d&apos;un compte et l&apos;utilisation du service impliquent
          l&apos;acceptation pleine et entière des présentes CGU, des CGV le cas
          échéant, et de la politique de confidentialité.
        </p>
        <p>
          Si l&apos;Utilisateur n&apos;accepte pas ces conditions, il ne doit pas
          utiliser le service.
        </p>
      </LegalSection>

      <LegalSection title="4. Description du service">
        <p>
          {publisher.tradeName} permet notamment de créer et gérer des devis et
          factures, un carnet clients, un agenda d&apos;interventions, des
          exports comptables, et — selon l&apos;offre souscrite — des
          fonctionnalités avancées (relances automatiques, liens clients,
          signature de devis, paiements en ligne, etc.).
        </p>
        <p>
          Le service est fourni en l&apos;état, sous forme d&apos;abonnement
          logiciel (SaaS), accessible via un navigateur web compatible. Certaines
          fonctionnalités peuvent évoluer, être ajoutées, modifiées ou retirées
          dans le respect des offres souscrites et avec un préavis raisonnable
          lorsque cela affecte substantiellement l&apos;usage.
        </p>
        <p>
          Pendant la phase d&apos;{LAUNCH_OFFER.name.toLowerCase()}, un accès
          anticipé peut être proposé selon les conditions affichées sur le site
          ({LAUNCH_OFFER.foundersProFootnote}).
        </p>
      </LegalSection>

      <LegalSection title="5. Création de compte et sécurité">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            L&apos;Utilisateur fournit des informations exactes lors de
            l&apos;inscription et de la configuration de son entreprise.
          </li>
          <li>
            Il est responsable de la confidentialité de ses identifiants et de
            toute activité réalisée depuis son compte.
          </li>
          <li>
            Il doit informer l&apos;Éditeur sans délai en cas d&apos;accès non
            autorisé suspecté à{" "}
            <a
              href={`mailto:${publisher.email}`}
              className="text-[#2563eb] hover:underline"
            >
              {publisher.email}
            </a>
            .
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Obligations de l'Utilisateur">
        <p>L&apos;Utilisateur s&apos;engage à :</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Utiliser le service conformément aux lois et règlements applicables
            (droit commercial, fiscal, comptable, protection des données de ses
            propres clients, etc.).
          </li>
          <li>
            Vérifier l&apos;exactitude des documents émis (devis, factures,
            mentions obligatoires, TVA, délais de paiement).
          </li>
          <li>
            Ne pas utiliser le service à des fins illicites, frauduleuses ou
            portant atteinte aux droits de tiers.
          </li>
          <li>
            Ne pas tenter de contourner les mesures de sécurité, d&apos;extraire
            massivement des données ou de perturber le fonctionnement du
            service.
          </li>
          <li>
            Ne pas revendre, sous-licencier ou mettre à disposition de tiers le
            service sans autorisation écrite de l&apos;Éditeur.
          </li>
        </ul>
        <p>
          {publisher.tradeName} est un outil d&apos;aide à la gestion : il ne
          remplace pas un expert-comptable, un avocat ou un conseiller fiscal.
          L&apos;Utilisateur reste seul responsable de ses obligations légales et
          de la conformité des documents qu&apos;il émet.
        </p>
      </LegalSection>

      <LegalSection title="7. Données saisies et hébergement">
        <p>
          L&apos;Utilisateur conserve la propriété des données qu&apos;il saisie
          (clients, devis, factures, etc.). Il accorde à l&apos;Éditeur une
          licence limitée d&apos;héberger, traiter et afficher ces données
          uniquement pour fournir le service.
        </p>
        <p>
          Les modalités de traitement des données personnelles (y compris celles
          des clients de l&apos;Utilisateur) sont détaillées dans la{" "}
          <Link
            href={LEGAL_ROUTES.confidentialite}
            className="text-[#2563eb] hover:underline"
          >
            politique de confidentialité
          </Link>
          . Lorsque l&apos;Utilisateur traite des données de ses clients via le
          service, il agit en qualité de responsable de traitement et
          {publisher.tradeName} agit en qualité de sous-traitant pour le compte de
          l&apos;Utilisateur, dans la limite des fonctionnalités proposées.
        </p>
      </LegalSection>

      <LegalSection title="8. Offres et fonctionnalités">
        <p>Les offres payantes actuellement proposées sont notamment :</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="font-medium text-[#334155]">
              {starterPlan.name}
            </strong>{" "}
            — {starterPlan.priceLabel}
            {starterPlan.priceSuffix ?? ""} (voir CGV)
          </li>
          <li>
            <strong className="font-medium text-[#334155]">{proPlan.name}</strong>{" "}
            — {proPlan.priceLabel}
            {proPlan.priceSuffix ?? ""} (voir CGV)
          </li>
        </ul>
        <p>
          Les fonctionnalités incluses dans chaque offre sont décrites sur le site
          et dans l&apos;application. L&apos;Éditeur peut faire évoluer le
          périmètre fonctionnel des offres pour les nouveaux abonnements, sans
          réduire les fonctionnalités essentielles déjà incluses dans une offre
          payante en cours sans préavis.
        </p>
      </LegalSection>

      <LegalSection title="9. Propriété intellectuelle">
        <p>
          Le service, son interface, ses logiciels, textes, graphismes, logos et
          documentations sont protégés par le droit de la propriété
          intellectuelle. Toute reproduction ou exploitation non autorisée est
          interdite.
        </p>
        <p>
          La marque {publisher.tradeName} et les éléments associés restent la
          propriété de l&apos;Éditeur.
        </p>
      </LegalSection>

      <LegalSection title="10. Disponibilité et maintenance">
        <p>
          L&apos;Éditeur s&apos;efforce d&apos;assurer la disponibilité du
          service mais ne garantit pas une disponibilité ininterrompue. Des
          opérations de maintenance, mises à jour ou incidents techniques peuvent
          entraîner des interruptions temporaires.
        </p>
        <p>
          L&apos;Éditeur pourra suspendre l&apos;accès en cas de violation des
          CGU, de risque de sécurité ou de demande d&apos;une autorité
          compétente.
        </p>
      </LegalSection>

      <LegalSection title="11. Limitation de responsabilité">
        <p>
          Dans les limites autorisées par la loi, la responsabilité de
          l&apos;Éditeur ne saurait être engagée pour les dommages indirects,
          pertes de chiffre d&apos;affaires, pertes de données imputables à
          l&apos;Utilisateur, ou erreurs contenues dans les documents émis par
          l&apos;Utilisateur.
        </p>
        <p>
          La responsabilité totale de l&apos;Éditeur, toutes causes confondues,
          est limitée au montant des sommes effectivement versées par
          l&apos;Utilisateur au titre de l&apos;abonnement sur les douze (12)
          derniers mois précédant le fait générateur, sauf faute lourde ou dol.
        </p>
      </LegalSection>

      <LegalSection title="12. Résiliation">
        <p>
          L&apos;Utilisateur peut supprimer son compte ou résilier son abonnement
          selon les modalités prévues dans les CGV et dans l&apos;interface
          (portail de gestion d&apos;abonnement le cas échéant).
        </p>
        <p>
          L&apos;Éditeur peut résilier ou suspendre un compte en cas de
          manquement grave aux CGU, après notification lorsque possible.
        </p>
      </LegalSection>

      <LegalSection title="13. Modifications des CGU">
        <p>
          L&apos;Éditeur peut modifier les présentes CGU. La date de mise à jour
          est indiquée en tête de page. En cas de modification substantielle,
          l&apos;Utilisateur sera informé par email ou notification dans
          l&apos;application. La poursuite de l&apos;utilisation du service
          après entrée en vigueur vaut acceptation, sauf droit de résiliation
          conformément aux CGV.
        </p>
      </LegalSection>

      <LegalSection title="14. Droit applicable et litiges">
        <p>
          Les CGU sont régies par le droit français. En cas de litige, les parties
          rechercheront une solution amiable. À défaut, les tribunaux du ressort
          du siège de l&apos;Éditeur seront compétents, sous réserve des règles
          impératives applicables.
        </p>
      </LegalSection>

      <LegalSection title="15. Contact">
        <p>
          Pour toute question :{" "}
          <a
            href={`mailto:${publisher.email}`}
            className="font-medium text-[#2563eb] hover:underline"
          >
            {publisher.email}
          </a>
        </p>
      </LegalSection>

      <LegalCrossLinks current={LEGAL_ROUTES.cgu} />
    </LegalPageShell>
  );
}
