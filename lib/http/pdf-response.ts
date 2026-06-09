/** Réponse PDF en téléchargement direct (pas d’ouverture inline dans le navigateur). */
export function pdfAttachmentResponse(
  buffer: Buffer,
  filename: string,
  cacheControl = "private, max-age=300",
): Response {
  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": cacheControl,
    },
  });
}
