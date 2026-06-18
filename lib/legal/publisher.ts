import { siteConfig } from "@/lib/site";

/**
 * Informations légales de l'éditeur — source unique pour mentions légales et confidentialité.
 * Surcharge possible via variables NEXT_PUBLIC_LEGAL_* (Vercel / .env.local).
 */
export type LegalPublisher = {
  tradeName: string;
  companyName: string;
  legalForm: string;
  address: string;
  email: string;
  phone: string | null;
  publicationDirector: string;
  siren: string;
  siret: string;
  vatNumber: string | null;
  rcs: string | null;
  shareCapital: string | null;
  websiteUrl: string;
};

const LEGAL_DEFAULTS = {
  companyName: "LEBRE Alexandre",
  legalForm: "Micro-entreprise (auto-entrepreneur)",
  address: "344 rue du Capitaine d'Hers, 83160 La Valette-du-Var",
  publicationDirector: "Alexandre LEBRE",
  siren: "901829424",
  siret: "90182942400026",
  /** Franchise en base — à mettre à jour si assujetti à la TVA. */
  vatNumber: "TVA non applicable, art. 293 B du CGI",
  rcs: "Non applicable (entrepreneur individuel)",
  shareCapital: "Non applicable (entrepreneur individuel)",
} as const;

export function getLegalPublisher(): LegalPublisher {
  return {
    tradeName: siteConfig.name,
    companyName: readEnv("NEXT_PUBLIC_LEGAL_COMPANY_NAME") ?? LEGAL_DEFAULTS.companyName,
    legalForm: readEnv("NEXT_PUBLIC_LEGAL_FORM") ?? LEGAL_DEFAULTS.legalForm,
    address: readEnv("NEXT_PUBLIC_LEGAL_ADDRESS") ?? LEGAL_DEFAULTS.address,
    email: readEnv("NEXT_PUBLIC_LEGAL_EMAIL") ?? "contact@factoni.fr",
    phone: readEnv("NEXT_PUBLIC_LEGAL_PHONE"),
    publicationDirector:
      readEnv("NEXT_PUBLIC_LEGAL_DIRECTOR") ?? LEGAL_DEFAULTS.publicationDirector,
    siren: readEnv("NEXT_PUBLIC_LEGAL_SIREN") ?? LEGAL_DEFAULTS.siren,
    siret: readEnv("NEXT_PUBLIC_LEGAL_SIRET") ?? LEGAL_DEFAULTS.siret,
    vatNumber: readEnv("NEXT_PUBLIC_LEGAL_VAT") ?? LEGAL_DEFAULTS.vatNumber,
    rcs: readEnv("NEXT_PUBLIC_LEGAL_RCS") ?? LEGAL_DEFAULTS.rcs,
    shareCapital: readEnv("NEXT_PUBLIC_LEGAL_CAPITAL") ?? LEGAL_DEFAULTS.shareCapital,
    websiteUrl: siteConfig.productionUrl,
  };
}

export function legalDisplayValue(
  value: string | null | undefined,
  placeholder = "À compléter",
): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : placeholder;
}

function readEnv(key: string): string | null {
  const value = process.env[key]?.trim();
  return value || null;
}
