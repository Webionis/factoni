import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  getPublicDocumentByToken,
} from "@/lib/data/public-documents";
import { hasFeatureForUser } from "@/lib/billing/feature-guard";
import { canAcceptQuote } from "@/lib/quotes/expiry";
import {
  buildAcceptanceSnapshot,
  computeSignatureHash,
} from "@/lib/quotes/acceptance-proof";
import { normalizeQuoteStatus } from "@/lib/quotes/status";
import { logServerError } from "@/lib/logger";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import {
  SIGNATURES_BUCKET,
  buildSignatureStoragePath,
} from "@/lib/storage/signatures";
import { notifyOwnerQuoteSigned } from "@/lib/quotes/notify-owner-quote-signed";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ token: string }>;
}

interface SignQuoteBody {
  signerName?: string;
  signatureDataUrl?: string;
  confirmed?: boolean;
}

const PNG_DATA_URL_RE = /^data:image\/png;base64,(.+)$/;

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")?.trim() ??
    ""
  );
}

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const trimmedToken = token.trim();

  if (trimmedToken.length < 16) {
    return NextResponse.json({ error: "Lien invalide." }, { status: 400 });
  }

  if (!isAdminClientConfigured()) {
    return NextResponse.json(
      {
        error:
          "La signature électronique n'est pas configurée sur le serveur.",
      },
      { status: 503 },
    );
  }

  let body: SignQuoteBody;
  try {
    body = (await request.json()) as SignQuoteBody;
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const signerName = body.signerName?.trim() ?? "";
  const signatureDataUrl = body.signatureDataUrl?.trim() ?? "";

  if (!body.confirmed) {
    return NextResponse.json(
      { error: "Veuillez confirmer l'acceptation du devis." },
      { status: 400 },
    );
  }

  if (signerName.length < 2) {
    return NextResponse.json(
      { error: "Veuillez indiquer votre nom complet." },
      { status: 400 },
    );
  }

  const match = PNG_DATA_URL_RE.exec(signatureDataUrl);
  if (!match) {
    return NextResponse.json(
      { error: "Signature invalide." },
      { status: 400 },
    );
  }

  const signatureBuffer = Buffer.from(match[1], "base64");
  if (signatureBuffer.length < 120) {
    return NextResponse.json(
      { error: "Veuillez dessiner votre signature." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const payload = await getPublicDocumentByToken(supabase, trimmedToken);

  if (!payload || payload.document.document_type !== "quote") {
    return NextResponse.json({ error: "Devis introuvable." }, { status: 404 });
  }

  const doc = payload.document;
  const quoteStatus = normalizeQuoteStatus(doc.status);

  const hasSignature = await hasFeatureForUser(
    supabase,
    doc.user_id,
    "advancedTracking",
  );
  if (!hasSignature) {
    return NextResponse.json(
      { error: "La signature en ligne n'est pas disponible pour ce devis." },
      { status: 403 },
    );
  }

  if (
    !canAcceptQuote(
      quoteStatus,
      doc.due_date,
      doc.converted_to_invoice_id,
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Ce devis ne peut plus être accepté (expiré, déjà traité ou lien invalide).",
      },
      { status: 409 },
    );
  }

  const signaturePath = buildSignatureStoragePath(doc.id);

  try {
    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage
      .from(SIGNATURES_BUCKET)
      .upload(signaturePath, signatureBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      logServerError("sign-quote.upload", uploadError, {
        quoteId: doc.id,
        signaturePath,
      });
      return NextResponse.json(
        { error: "Impossible d'enregistrer la signature." },
        { status: 500 },
      );
    }

    const signedAt = new Date().toISOString();
    const snapshot = buildAcceptanceSnapshot({
      quoteId: doc.id,
      quoteNumber: doc.invoice_number,
      totalHt: Number(doc.total_ht),
      totalVat: Number(doc.total_vat),
      totalTtc: Number(doc.total_ttc),
      issueDate: doc.issue_date,
      dueDate: doc.due_date,
      signerName,
      signedAt,
    });
    const signatureHash = computeSignatureHash(snapshot, signaturePath);

    const { data: signed, error: rpcError } = await supabase.rpc(
      "sign_quote_by_public_token",
      {
        p_token: trimmedToken,
        p_signer_name: signerName,
        p_signature_path: signaturePath,
        p_ip: clientIp(request),
        p_user_agent: request.headers.get("user-agent") ?? "",
        p_signature_hash: signatureHash,
        p_acceptance_snapshot: snapshot as unknown as Json,
      },
    );

    if (rpcError || signed !== true) {
      await admin.storage.from(SIGNATURES_BUCKET).remove([signaturePath]);
      logServerError("sign-quote.rpc", rpcError, { quoteId: doc.id });
      return NextResponse.json(
        {
          error:
            "Ce devis ne peut plus être accepté (expiré, déjà traité ou lien invalide).",
        },
        { status: 409 },
      );
    }

    const { data: acceptedQuote } = await admin
      .from("invoices")
      .select("*")
      .eq("id", doc.id)
      .maybeSingle();

    if (acceptedQuote?.status === "accepted") {
      try {
        await notifyOwnerQuoteSigned(supabase, {
          quote: acceptedQuote,
          acceptedByName: signerName,
          signedAt: acceptedQuote.accepted_at ?? signedAt,
        });
      } catch (notifyError) {
        logServerError("sign-quote.notify", notifyError, { quoteId: doc.id });
      }
    }

    revalidatePath(`/d/${trimmedToken}`);

    return NextResponse.json({
      success: true,
      acceptedAt: acceptedQuote?.accepted_at ?? signedAt,
      signerName,
      totalTtc: Number(doc.total_ttc),
    });
  } catch (error) {
    logServerError("sign-quote", error, { quoteId: doc.id });
    return NextResponse.json(
      { error: "Une erreur est survenue. Réessayez." },
      { status: 500 },
    );
  }
}
