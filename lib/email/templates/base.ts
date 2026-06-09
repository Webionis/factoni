import { escapeHtml } from "@/lib/email/helpers";
import { siteConfig } from "@/lib/site";

export interface EmailButton {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

export interface FactoniEmailLayoutParams {
  preheader?: string;
  title: string;
  bodyHtml: string;
  buttons?: EmailButton[];
}

const BRAND_BLUE = "#2563eb";
const BRAND_BLUE_DARK = "#1d4ed8";

function renderButton(button: EmailButton): string {
  const isPrimary = button.variant !== "secondary";
  const bg = isPrimary ? BRAND_BLUE : "#ffffff";
  const color = isPrimary ? "#ffffff" : BRAND_BLUE;
  const border = isPrimary ? BRAND_BLUE : "#cbd5e1";

  return `
    <a href="${escapeHtml(button.href)}"
       style="display:inline-block;min-width:200px;max-width:100%;margin:6px 8px 6px 0;padding:14px 24px;border-radius:12px;background:${bg};color:${color};border:1px solid ${border};font-size:15px;font-weight:600;text-decoration:none;text-align:center;box-sizing:border-box;">
      ${escapeHtml(button.label)}
    </a>`;
}

/** Layout HTML transactionnel Factoni — responsive, fond clair. */
export function buildFactoniEmailHtml({
  preheader,
  title,
  bodyHtml,
  buttons = [],
}: FactoniEmailLayoutParams): string {
  const year = new Date().getFullYear();
  const buttonsHtml =
    buttons.length > 0
      ? `<div style="margin-top:28px;line-height:1;">${buttons.map(renderButton).join("")}</div>`
      : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(title)}</title>
  <!--[if mso]><style>body,table,td{font-family:Arial,sans-serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 24px rgba(15,23,42,0.06);">
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${BRAND_BLUE},${BRAND_BLUE_DARK});"></td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px;">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND_BLUE};">${escapeHtml(siteConfig.name)}</p>
              <h1 style="margin:12px 0 0;font-size:24px;line-height:1.3;font-weight:700;color:#0f172a;">${escapeHtml(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 32px;color:#334155;font-size:15px;line-height:1.6;">
              ${bodyHtml}
              ${buttonsHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;text-align:center;">
                ${escapeHtml(siteConfig.name)} — ${escapeHtml(siteConfig.tagline)}<br />
                © ${year} ${escapeHtml(siteConfig.name)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
