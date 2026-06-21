import Link from "next/link";

import { LegalCrossLinks } from "@/components/marketing/legal-cross-links";
import {
  LegalPageShell,
  LegalSection,
} from "@/components/marketing/legal-page-shell";
import { LegalPublisherDetails } from "@/components/marketing/legal-publisher-details";
import { LegalSubprocessorsList } from "@/components/marketing/legal-subprocessors-list";
import { getLegalPublisher } from "@/lib/legal/publisher";
import { LEGAL_ROUTES } from "@/lib/legal/urls";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("privacy", {
  description:
    "Politique de confidentialité et traitement des données personnelles sur Factoni.",
});

export default function ConfidentialitePage() {
  const publisher = getLegalPublisher();

  return (
    <LegalPageShell
      title="Politique de confidentialité"
      updatedAt="02/06/2026"
      lead={`La présente politique explique comment ${publisher.tradeName} collecte, utilise, conserve et protège les données personnelles des utilisateurs du service et, le cas échéant, des personnes dont les données sont saisies par les utilisateurs (clients, contacts).`}
    >
      <LegalSection title="1. Introduction">
        <p>
          {publisher.tradeName} accorde une importance particulière à la protection
          des données personnelles. Cette politique s&apos;applique au site{" "}
          {publisher.websiteUrl.replace(/^https?:\/\//, "")} et à
          l&apos;application associée.
        </p>
        <p>
          Elle complète les{" "}
          <Link href={LEGAL_ROUTES.cgu} className="text-[#2563eb] hover:underline">
            CGU
          </Link>{" "}
          et les{" "}
          <Link href={LEGAL_ROUTES.cgv} className="text-[#2563eb] hover:underline">
            CGV
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Responsable du traitement">
        <p>
          Pour les données relatives à la gestion des comptes utilisateurs et de
          la relation commerciale avec {publisher.tradeName}, le responsable du
          traitement est :
        </p>
        <LegalPublisherDetails />
      </LegalSection>

      <LegalSection title="3. Rôles : utilisateur et sous-traitant">
        <p>
          Lorsque vous utilisez {publisher.tradeName} pour gérer vos clients et
          émettre des documents, vous traitez généralement les données de vos
          clients en qualité de <strong className="font-medium text-[#334155]">responsable de traitement</strong>.
          {publisher.tradeName} traite ces données pour votre compte en qualité de{" "}
          <strong className="font-medium text-[#334155]">sous-traitant</strong>,
          conformément à vos instructions (création de devis/factures, envoi de
          relances, liens publics, etc.) et aux présentes conditions.
        </p>
        <p>
          Pour toute question relative aux données de vos propres clients, vous
          restez responsable du respect du RGPD vis-à-vis de ceux-ci (information,
          base légale, durées de conservation, droits).
        </p>
      </LegalSection>

      <LegalSection title="4. Données collectées">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="font-medium text-[#334155]">Compte :</strong> nom,
            email, mot de passe (chiffré via Supabase Auth), préférences
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Entreprise :</strong>{" "}
            nom commercial, raison sociale, adresse, SIREN/SIRET, TVA, logo,
            paramètres de relance
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Clients :</strong> nom,
            email, téléphone, adresse, informations de facturation, accès portail
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Documents :</strong>{" "}
            devis, factures, lignes, montants, statuts, PDF, signatures
            électroniques, liens publics
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Agenda :</strong>{" "}
            rendez-vous planifiés, notes, lieux d&apos;intervention
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Abonnement :</strong>{" "}
            plan, statut, identifiants Stripe (customer / subscription), historique
            de facturation SaaS
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Paiements :</strong>{" "}
            statuts de paiement, références Stripe Connect le cas échéant (sans
            stockage des coordonnées bancaires par {publisher.tradeName})
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Technique :</strong>{" "}
            adresse IP, journaux techniques, cookies strictement nécessaires,
            informations de session
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Support :</strong>{" "}
            échanges par email si vous nous contactez
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Finalités">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Création et gestion du compte utilisateur</li>
          <li>Authentification et sécurisation du service</li>
          <li>Fourniture des fonctionnalités (devis, factures, clients, agenda, exports)</li>
          <li>Gestion des abonnements et facturation SaaS</li>
          <li>Paiements en ligne via Stripe Connect (si activé)</li>
          <li>Envoi d&apos;emails transactionnels (relances, notifications)</li>
          <li>Préparation et transmission e-facturation (si activée)</li>
          <li>Support et amélioration du produit</li>
          <li>Respect des obligations légales</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Bases légales (RGPD)">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="font-medium text-[#334155]">Exécution du contrat</strong>{" "}
            (CGU/CGV) : fourniture du service
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Obligation légale</strong>{" "}
            : conservation comptable le cas échéant
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Intérêt légitime</strong>{" "}
            : sécurité, amélioration, prévention de la fraude
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Consentement</strong>{" "}
            lorsque requis (cookies non essentiels, le cas échéant)
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Durées de conservation">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="font-medium text-[#334155]">Compte :</strong>{" "}
            durée d&apos;utilisation du service, puis suppression ou anonymisation
            sur demande, sous réserve des obligations légales
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Documents métier :</strong>{" "}
            jusqu&apos;à suppression par l&apos;utilisateur ou clôture du compte,
            puis selon les délais légaux applicables à l&apos;utilisateur
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Facturation SaaS :</strong>{" "}
            durée légale de conservation des pièces comptables
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Logs techniques :</strong>{" "}
            durée limitée nécessaire à la sécurité (généralement quelques mois)
          </li>
          <li>
            <strong className="font-medium text-[#334155]">Support :</strong>{" "}
            durée du traitement de la demande
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Destinataires et sous-traitants">
        <LegalSubprocessorsList />
      </LegalSection>

      <LegalSection title="9. Hébergement et transferts hors UE">
        <p>
          Les données sont hébergées via des prestataires pouvant être situés
          dans ou hors de l&apos;Union européenne. Lorsque des transferts hors UE
          ont lieu, des garanties appropriées sont mises en place (clauses
          contractuelles types de la Commission européenne ou mécanismes
          équivalents proposés par les prestataires).
        </p>
        <p>
          Supabase est configuré en région Europe (UE) lorsque applicable pour le
          projet de production.
        </p>
      </LegalSection>

      <LegalSection title="10. Sécurité">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Authentification sécurisée et sessions protégées</li>
          <li>Row Level Security (RLS) sur la base de données</li>
          <li>Stockage privé pour les fichiers sensibles (logos, signatures)</li>
          <li>Isolation des données par compte utilisateur</li>
          <li>Webhooks et accès cron protégés par secrets serveur</li>
        </ul>
      </LegalSection>

      <LegalSection title="11. Droits des personnes concernées">
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Accès, rectification, effacement</li>
          <li>Limitation et opposition au traitement</li>
          <li>Portabilité des données</li>
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

      <LegalSection title="12. Exercer vos droits">
        <p>
          Pour exercer vos droits relatifs à votre compte {publisher.tradeName},
          contactez-nous à{" "}
          <a
            href={`mailto:${publisher.email}`}
            className="font-medium text-[#2563eb] hover:underline"
          >
            {publisher.email}
          </a>
          . Une pièce d&apos;identité pourra être demandée en cas de doute sur
          l&apos;identité du demandeur.
        </p>
        <p>
          Si vos données ont été saisies par un utilisateur de {publisher.tradeName}
          (ex. votre artisan), adressez-vous en priorité à cet utilisateur, qui
          agit en tant que responsable de traitement.
        </p>
      </LegalSection>

      <LegalSection title="13. Cookies et traceurs">
        <p>
          Des cookies strictement nécessaires au fonctionnement du service sont
          utilisés (session, authentification, préférences essentielles).
        </p>
        <p>
          Si des cookies de mesure d&apos;audience ou marketing sont déployés
          ultérieurement, un mécanisme de recueil du consentement conforme sera
          mis en place avant leur activation.
        </p>
      </LegalSection>

      <LegalSection title="14. Modifications">
        <p>
          Cette politique peut être mise à jour pour refléter les évolutions du
          service ou de la réglementation. La date de dernière mise à jour figure
          en tête de page.
        </p>
      </LegalSection>

      <LegalCrossLinks current={LEGAL_ROUTES.confidentialite} />
    </LegalPageShell>
  );
}
