import Link from "next/link";

import { LegalCrossLinks } from "@/components/marketing/legal-cross-links";
import {
  LegalPageShell,
  LegalSection,
} from "@/components/marketing/legal-page-shell";
import { LegalPublisherDetails } from "@/components/marketing/legal-publisher-details";
import { LAUNCH_OFFER, PUBLIC_PRICING_PLANS } from "@/lib/billing/plans";
import { PAYMENT_PROVIDER } from "@/lib/legal/hosting";
import { getLegalPublisher } from "@/lib/legal/publisher";
import { LEGAL_ROUTES } from "@/lib/legal/urls";
import { pageMetadata } from "@/lib/metadata";

const starterPlan = PUBLIC_PRICING_PLANS.find((plan) => plan.id === "starter")!;
const proPlan = PUBLIC_PRICING_PLANS.find((plan) => plan.id === "pro")!;

export const metadata = pageMetadata("termsOfSale", {
  description:
    "Conditions générales de vente des abonnements Factoni Starter et Pro.",
});

export default function CgvPage() {
  const publisher = getLegalPublisher();

  return (
    <LegalPageShell
      title="Conditions générales de vente"
      updatedAt="02/06/2026"
      lead={`Les présentes conditions générales de vente (« CGV ») régissent la souscription et l'utilisation des abonnements payants au service ${publisher.tradeName}.`}
    >
      <LegalSection title="1. Objet et identification du vendeur">
        <p>
          Les CGV encadrent la vente d&apos;abonnements au service SaaS{" "}
          {publisher.tradeName}, proposé par l&apos;éditeur ci-dessous.
        </p>
        <LegalPublisherDetails />
        <p className="text-[14px] text-[#94a3b8]">
          TVA : {publisher.vatNumber}
        </p>
      </LegalSection>

      <LegalSection title="2. Produits et tarifs">
        <p>
          {publisher.tradeName} est proposé sous forme d&apos;abonnement mensuel
          sans engagement de durée minimale, selon les offres suivantes (prix
          indicatifs affichés sur le site au moment de la souscription) :
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-[#334155]">
              Abonnement {starterPlan.name}
            </strong>{" "}
            — {starterPlan.priceLabel}
            {starterPlan.priceSuffix ?? ""} : {starterPlan.tagline}.
          </li>
          <li>
            <strong className="font-medium text-[#334155]">
              Abonnement {proPlan.name}
            </strong>{" "}
            — {proPlan.priceLabel}
            {proPlan.priceSuffix ?? ""} : {proPlan.tagline}.
          </li>
        </ul>
        <p>
          Le détail des fonctionnalités incluses est disponible sur la page
          tarifs du site et dans l&apos;application. Les prix sont exprimés en
          euros. Sauf mention contraire, ils s&apos;entendent tels qu&apos;affichés
          au moment de la commande (TVA selon le régime applicable de
          l&apos;éditeur).
        </p>
        <p>
          Pendant l&apos;{LAUNCH_OFFER.name.toLowerCase()}, un accès gratuit ou
          tarif préférentiel peut être proposé : {LAUNCH_OFFER.foundersProFootnote}
        </p>
      </LegalSection>

      <LegalSection title="3. Commande et souscription">
        <p>
          La souscription s&apos;effectue depuis l&apos;espace client
          {publisher.tradeName}, section Abonnement, via un parcours de paiement
          sécurisé. L&apos;Utilisateur choisit son offre (Starter ou Pro) et
          valide sa commande après avoir pris connaissance des présentes CGV et
          des{" "}
          <Link href={LEGAL_ROUTES.cgu} className="text-[#2563eb] hover:underline">
            CGU
          </Link>
          .
        </p>
        <p>
          La commande n&apos;est définitive qu&apos;après confirmation du
          paiement par le prestataire {PAYMENT_PROVIDER.name} et réception de
          la confirmation par {publisher.tradeName}.
        </p>
      </LegalSection>

      <LegalSection title="4. Paiement">
        <p>
          Les paiements d&apos;abonnement sont traités par{" "}
          <strong className="font-medium text-[#334155]">
            {PAYMENT_PROVIDER.name}
          </strong>{" "}
          ({PAYMENT_PROVIDER.role}). Les coordonnées bancaires ne sont pas
          stockées par {publisher.tradeName}.
        </p>
        <p>
          Le paiement est exigible à la souscription puis à chaque échéance
          mensuelle, par prélèvement ou carte selon les moyens proposés par
          Stripe. En cas d&apos;échec de paiement, l&apos;accès aux
          fonctionnalités payantes peut être suspendu après notification.
        </p>
      </LegalSection>

      <LegalSection title="5. Durée, reconduction et changement d'offre">
        <p>
          L&apos;abonnement est conclu pour une période mensuelle, tacitement
          reconductible pour une durée identique, sauf résiliation par
          l&apos;Utilisateur ou l&apos;Éditeur.
        </p>
        <p>
          L&apos;Utilisateur peut changer d&apos;offre (upgrade ou downgrade)
          depuis l&apos;application. Un passage vers une offre supérieure peut
          être facturé au prorata. Un passage vers une offre inférieure peut
          prendre effet en fin de période en cours, selon les modalités affichées
          lors du changement.
        </p>
      </LegalSection>

      <LegalSection title="6. Résiliation">
        <p>
          L&apos;Utilisateur peut résilier son abonnement à tout moment depuis
          l&apos;espace Abonnement ou le portail client Stripe. La résiliation
          prend en principe effet à la fin de la période de facturation en cours
          : l&apos;accès aux fonctionnalités payantes est maintenu jusqu&apos;à
          cette date.
        </p>
        <p>
          La suppression du compte utilisateur peut être demandée par email à{" "}
          <a
            href={`mailto:${publisher.email}`}
            className="text-[#2563eb] hover:underline"
          >
            {publisher.email}
          </a>
          , sous réserve des obligations légales de conservation.
        </p>
      </LegalSection>

      <LegalSection title="7. Droit de rétractation">
        <p>
          Le service est destiné en priorité à des professionnels (artisans,
          indépendants, petites entreprises). Lorsque l&apos;Utilisateur agit en
          qualité de professionnel pour les besoins de son activité, le droit de
          rétractation prévu pour les consommateurs (articles L221-18 et suivants
          du Code de la consommation) ne s&apos;applique pas.
        </p>
        <p>
          Si l&apos;Utilisateur est un consommateur au sens du Code de la
          consommation, il dispose d&apos;un délai de quatorze (14) jours à
          compter de la souscription pour exercer son droit de rétractation,
          sauf renonciation expresse pour un service numérique exécuté
          immédiatement après souscription conformément à l&apos;article L221-28.
        </p>
      </LegalSection>

      <LegalSection title="8. Remboursements">
        <p>
          Sauf disposition légale impérative ou erreur de facturation imputable à
          l&apos;Éditeur, les sommes versées au titre d&apos;une période
          d&apos;abonnement déjà entamée ne sont pas remboursées au prorata en
          cas de résiliation en cours de période.
        </p>
        <p>
          Toute demande exceptionnelle peut être adressée à{" "}
          <a
            href={`mailto:${publisher.email}`}
            className="text-[#2563eb] hover:underline"
          >
            {publisher.email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="9. Garanties et responsabilité">
        <p>
          L&apos;Éditeur s&apos;engage à fournir le service conformément aux
          fonctionnalités de l&apos;offre souscrite. Les limitations de
          responsabilité applicables à l&apos;utilisation du service sont
          détaillées dans les{" "}
          <Link href={LEGAL_ROUTES.cgu} className="text-[#2563eb] hover:underline">
            CGU
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="10. Données personnelles">
        <p>
          Le traitement des données personnelles lié à la gestion de la relation
          commerciale est décrit dans la{" "}
          <Link
            href={LEGAL_ROUTES.confidentialite}
            className="text-[#2563eb] hover:underline"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="11. Médiation et litiges">
        <p>
          En cas de litige, l&apos;Utilisateur peut contacter l&apos;Éditeur à
          l&apos;adresse indiquée ci-dessus. À défaut de résolution amiable, le
          litige sera soumis aux tribunaux compétents du ressort du siège de
          l&apos;Éditeur, sous réserve des règles impératives.
        </p>
        <p className="text-[14px] text-[#94a3b8]">
          Médiation de la consommation : en tant que micro-entreprise, l&apos;éditeur
          n&apos;est pas tenu de adhérer à un médiateur de la consommation tant
          qu&apos;il n&apos;y est pas légalement obligé. Cette mention sera mise à
          jour le cas échéant.
        </p>
      </LegalSection>

      <LegalSection title="12. Modification des CGV">
        <p>
          L&apos;Éditeur peut modifier les présentes CGV. Les nouvelles
          conditions s&apos;appliquent aux souscriptions futures. Pour les
          abonnements en cours, l&apos;Utilisateur sera informé avant
          l&apos;application de tarifs ou conditions substantiellement
          différents, avec la possibilité de résilier avant leur entrée en
          vigueur.
        </p>
      </LegalSection>

      <LegalCrossLinks current={LEGAL_ROUTES.cgv} />
    </LegalPageShell>
  );
}
