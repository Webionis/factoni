/** Données publiques — API Recherche d'entreprises (data.gouv.fr / INSEE). */

const API_BASE = "https://recherche-entreprises.api.gouv.fr/search";

export interface CompanyLookupSuggestion {
  /** Clé stable (SIREN). */
  id: string;
  label: string;
  subtitle: string;
  trade_name: string;
  legal_name: string;
  address_line1: string;
  address_line2: string;
  postal_code: string;
  city: string;
  country: string;
  siren: string;
  siret: string;
  vat_number: string;
}

interface ApiSiege {
  siret?: string;
  numero_voie?: string | null;
  type_voie?: string | null;
  libelle_voie?: string | null;
  complement_adresse?: string | null;
  code_postal?: string | null;
  libelle_commune?: string | null;
  libelle_commune_etranger?: string | null;
  code_pays_etranger?: string | null;
  libelle_pays_etranger?: string | null;
  adresse?: string | null;
  nom_commercial?: string | null;
  liste_enseignes?: string[] | null;
  etat_administratif?: string | null;
}

interface ApiEntreprise {
  siren: string;
  nom_complet?: string | null;
  nom_raison_sociale?: string | null;
  etat_administratif?: string | null;
  siege?: ApiSiege | null;
}

interface ApiSearchResponse {
  results?: ApiEntreprise[];
}

/** Calcule le n° TVA intracommunautaire français à partir du SIREN. */
export function frenchVatNumberFromSiren(siren: string): string | null {
  if (!/^\d{9}$/.test(siren)) return null;
  const sirenNum = Number(siren);
  const key = (12 + 3 * (sirenNum % 97)) % 97;
  return `FR${String(key).padStart(2, "0")}${siren}`;
}

function buildAddressLine1(siege: ApiSiege): string {
  const structured = [siege.numero_voie, siege.type_voie, siege.libelle_voie]
    .filter((part) => part && String(part).trim() !== "")
    .join(" ")
    .trim();

  if (structured) return structured;
  if (siege.adresse?.trim()) return siege.adresse.trim();
  return "";
}

function mapCountry(siege: ApiSiege): string {
  if (siege.code_pays_etranger) {
    return siege.code_pays_etranger === "99100" ? "FR" : siege.code_pays_etranger;
  }
  return "FR";
}

function mapCity(siege: ApiSiege): string {
  return (
    siege.libelle_commune?.trim() ||
    siege.libelle_commune_etranger?.trim() ||
    ""
  );
}

function mapEntrepriseToSuggestion(entreprise: ApiEntreprise): CompanyLookupSuggestion | null {
  const siren = entreprise.siren?.trim();
  const siege = entreprise.siege;
  if (!siren || !siege?.siret) return null;
  if (entreprise.etat_administratif === "C") return null;
  if (siege.etat_administratif === "F") return null;

  const legalName =
    entreprise.nom_raison_sociale?.trim() ||
    entreprise.nom_complet?.trim() ||
    "";
  const tradeName =
    siege.nom_commercial?.trim() ||
    siege.liste_enseignes?.[0]?.trim() ||
    legalName;

  const city = mapCity(siege);
  const postalCode = siege.code_postal?.trim() ?? "";
  const subtitle = [siren, city].filter(Boolean).join(" · ");

  return {
    id: siren,
    label: entreprise.nom_complet?.trim() || legalName,
    subtitle,
    trade_name: tradeName,
    legal_name: legalName,
    address_line1: buildAddressLine1(siege),
    address_line2: siege.complement_adresse?.trim() ?? "",
    postal_code: postalCode,
    city,
    country: mapCountry(siege),
    siren,
    siret: siege.siret.trim(),
    vat_number: frenchVatNumberFromSiren(siren) ?? "",
  };
}

export async function searchFrenchCompanies(
  query: string,
  options?: { limit?: number },
): Promise<CompanyLookupSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const limit = options?.limit ?? 8;
  const url = new URL(API_BASE);
  url.searchParams.set("q", q);
  url.searchParams.set("page", "1");
  url.searchParams.set("per_page", String(Math.min(limit, 25)));
  url.searchParams.set("etat_administratif", "A");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "Factoni/1.0 (https://factoni.fr; contact@factoni.fr)",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Recherche entreprises: HTTP ${response.status}`);
  }

  const data = (await response.json()) as ApiSearchResponse;
  const suggestions: CompanyLookupSuggestion[] = [];

  for (const entreprise of data.results ?? []) {
    const mapped = mapEntrepriseToSuggestion(entreprise);
    if (mapped) suggestions.push(mapped);
    if (suggestions.length >= limit) break;
  }

  return suggestions;
}
