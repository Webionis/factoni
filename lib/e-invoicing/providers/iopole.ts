import { getPlatformEinvoicingConfig } from "@/lib/e-invoicing/config";
import type {
  EinvoicingProvider,
  EinvoicingProviderSubmitInput,
  EinvoicingProviderSubmitResult,
} from "@/lib/e-invoicing/types";

async function parseIopoleResponse(
  response: Response,
): Promise<EinvoicingProviderSubmitResult> {
  const bodyText = await response.text();
  let payload: { id?: string; status?: string; message?: string } | null = null;

  if (bodyText) {
    try {
      payload = JSON.parse(bodyText) as {
        id?: string;
        status?: string;
        message?: string;
      };
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    throw new Error(
      payload?.message ||
        bodyText ||
        `Transmission Iopole refusée (${response.status}).`,
    );
  }

  const externalId = payload?.id?.trim();
  if (!externalId) {
    throw new Error("Réponse Iopole invalide : identifiant de facture manquant.");
  }

  const normalizedStatus = payload?.status?.toLowerCase();
  if (normalizedStatus === "accepted" || normalizedStatus === "delivered") {
    return { externalId, status: "accepted" };
  }

  return { externalId, status: "submitted" };
}

export const iopoleEinvoicingProvider: EinvoicingProvider = {
  slug: "iopole",
  label: "Iopole",
  async submit(
    input: EinvoicingProviderSubmitInput,
  ): Promise<EinvoicingProviderSubmitResult> {
    const config = getPlatformEinvoicingConfig();

    if (!config.apiKey) {
      throw new Error("Clé API Plateforme Agréée non configurée.");
    }

    const formData = new FormData();
    const pdfBlob = new Blob([new Uint8Array(input.payload.pdf)], {
      type: "application/pdf",
    });
    formData.append(
      "file",
      pdfBlob,
      `${input.payload.invoiceNumber}-factur-x.pdf`,
    );
    formData.append("invoiceNumber", input.payload.invoiceNumber);
    if (input.sellerSiren) {
      formData.append("sellerSiren", input.sellerSiren);
    }
    if (input.buyerSiren) {
      formData.append("buyerSiren", input.buyerSiren);
    }
    if (input.buyerSiret) {
      formData.append("buyerSiret", input.buyerSiret);
    }

    const response = await fetch(`${config.apiBaseUrl}/v1/invoices`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: "application/json",
      },
      body: formData,
    });

    return parseIopoleResponse(response);
  },
};
