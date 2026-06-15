import type { InvoiceDetail } from "@/lib/data/invoices";
import { mapInvoicePdfDataToFacturXInput } from "@/lib/factur-x/map-invoice-input";
import type { InvoicePdfData } from "@/lib/pdf/types";
import { validateInput, Profile, Flavor } from "@stackforge-eu/factur-x";

import { isPlatformEinvoicingActive } from "@/lib/e-invoicing/config";
import type {
  EinvoicingReadinessItem,
  EinvoicingReadinessReport,
} from "@/lib/e-invoicing/types";
import type { Database } from "@/types/database";

type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

function item(
  id: string,
  level: EinvoicingReadinessItem["level"],
  message: string,
  href?: string,
): EinvoicingReadinessItem {
  return { id, level, message, href };
}

function hasCompanyIdentifier(company: CompanyRow): boolean {
  return Boolean(company.siren?.trim() || company.siret?.trim());
}

function hasClientIdentifier(client: ClientRow): boolean {
  return Boolean(client.siren?.trim() || client.siret?.trim());
}

function hasCompleteAddress(
  row: Pick<
    CompanyRow | ClientRow,
    "address_line1" | "postal_code" | "city" | "country"
  >,
): boolean {
  return Boolean(
    row.address_line1?.trim() &&
      row.postal_code?.trim() &&
      row.city?.trim() &&
      row.country?.trim(),
  );
}

export function assessCompanyEinvoicingReadiness(
  company: CompanyRow | null,
  options?: { platformPaEnabled?: boolean },
): EinvoicingReadinessReport {
  const platformPaEnabled =
    options?.platformPaEnabled ?? isPlatformEinvoicingActive();
  const items: EinvoicingReadinessItem[] = [];

  if (!company) {
    return {
      ready: false,
      items: [
        item(
          "company-missing",
          "error",
          "Complétez les informations de votre entreprise.",
          "/settings/company",
        ),
      ],
    };
  }

  if (!hasCompanyIdentifier(company)) {
    items.push(
      item(
        "company-siren",
        "error",
        "Renseignez le SIREN ou le SIRET de votre entreprise.",
        "/settings/company",
      ),
    );
  }

  if (!hasCompleteAddress(company)) {
    items.push(
      item(
        "company-address",
        "error",
        "Complétez l'adresse postale de votre entreprise.",
        "/settings/company",
      ),
    );
  }

  if (company.vat_regime === "standard" && !company.vat_number?.trim()) {
    items.push(
      item(
        "company-vat",
        "warning",
        "Numéro de TVA intracommunautaire recommandé pour les échanges B2B.",
        "/settings/company",
      ),
    );
  }

  items.push(
    item(
      "factur-x-ready",
      "ok",
      "Factoni génère déjà des factures au format Factur-X (EN 16931).",
    ),
  );

  if (platformPaEnabled) {
    items.push(
      item(
        "pa-embedded",
        "ok",
        "Transmission automatique via la Plateforme Agréée intégrée à Factoni.",
      ),
    );
  } else {
    items.push(
      item(
        "pa-not-connected",
        "warning",
        "Plateforme Agréée Factoni en cours d'activation.",
        "/settings/einvoicing",
      ),
    );
  }

  const blocking = items.filter((entry) => entry.level === "error");
  return { ready: blocking.length === 0, items };
}

export function assessClientEinvoicingReadiness(
  client: ClientRow,
): EinvoicingReadinessReport {
  const items: EinvoicingReadinessItem[] = [];

  if (client.client_type !== "company") {
    items.push(
      item(
        "client-b2c",
        "warning",
        "La réforme 2027 concerne surtout les factures B2B (client professionnel).",
        `/clients/${client.id}/edit`,
      ),
    );
    return { ready: true, items };
  }

  if (!hasClientIdentifier(client)) {
    items.push(
      item(
        "client-siren",
        "error",
        "Renseignez le SIREN ou le SIRET du client professionnel.",
        `/clients/${client.id}/edit`,
      ),
    );
  }

  if (!hasCompleteAddress(client)) {
    items.push(
      item(
        "client-address",
        "error",
        "Complétez l'adresse du client professionnel.",
        `/clients/${client.id}/edit`,
      ),
    );
  }

  const blocking = items.filter((entry) => entry.level === "error");
  return { ready: blocking.length === 0, items };
}

export function assessInvoiceEinvoicingReadiness(params: {
  invoice: InvoiceDetail;
  client: ClientRow;
  pdfData: InvoicePdfData;
  providerConfigured: boolean;
}): EinvoicingReadinessReport {
  const { invoice, client, pdfData, providerConfigured } = params;
  const items: EinvoicingReadinessItem[] = [];

  if (invoice.document_type !== "invoice") {
    return {
      ready: false,
      items: [item("not-invoice", "error", "Seules les factures peuvent être transmises.")],
    };
  }

  if (invoice.status === "draft" || invoice.status === "ready") {
    items.push(
      item(
        "invoice-not-sent",
        "error",
        "Validez et marquez la facture comme envoyée avant transmission.",
      ),
    );
  }

  if (!invoice.invoice_number?.trim()) {
    items.push(
      item("invoice-number", "error", "La facture doit avoir un numéro légal."),
    );
  }

  const clientReport = assessClientEinvoicingReadiness(client);
  items.push(...clientReport.items);

  const facturXInput = mapInvoicePdfDataToFacturXInput(pdfData);
  const validation = validateInput(facturXInput, Profile.EN16931, Flavor.FACTUR_X);
  if (!validation.valid) {
    items.push(
      item(
        "factur-x-invalid",
        "error",
        `Données Factur-X invalides : ${validation.errors.map((e) => e.message).join("; ")}`,
      ),
    );
  } else {
    items.push(
      item("factur-x-valid", "ok", "Le fichier Factur-X de cette facture est valide."),
    );
  }

  if (!providerConfigured) {
    items.push(
      item(
        "pa-not-connected",
        "warning",
        "Plateforme Agréée Factoni en cours d'activation.",
        "/settings/einvoicing",
      ),
    );
  } else {
    items.push(
      item(
        "pa-auto-transmit",
        "ok",
        "À l'envoi, Factoni transmet automatiquement la facture à la Plateforme Agréée.",
      ),
    );
  }

  const blocking = items.filter((entry) => entry.level === "error");
  return { ready: blocking.length === 0 && providerConfigured, items };
}
