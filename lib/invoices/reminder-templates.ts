import { formatFrenchCalendarDate } from "@/lib/format/datetime";
import { formatCurrency } from "@/lib/invoices/calculate";

export const REMINDER_TEMPLATE_IDS = [
  "unpaid_invoice",
  "quote_expiring",
  "quote_expired",
  "quote_validation_reminder",
] as const;

export type ReminderTemplateId = (typeof REMINDER_TEMPLATE_IDS)[number];

export const DEFAULT_REMINDER_TEMPLATE_ID: ReminderTemplateId =
  "unpaid_invoice";

export interface ReminderTemplateContext {
  clientName: string;
  companyName: string;
  invoiceNumber: string;
  totalTtc: number;
  issueDate: string;
  dueDate: string;
}

interface ResolvedReminderContext extends ReminderTemplateContext {
  issueDateLabel: string;
  dueDateLabel: string;
  totalTtcFormatted: string;
}

export interface ReminderTemplateDefinition {
  id: ReminderTemplateId;
  label: string;
  description: string;
}

function formatTemplateDate(dateStr: string): string {
  return formatFrenchCalendarDate(dateStr, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function resolveContext(
  ctx: ReminderTemplateContext,
): ResolvedReminderContext {
  return {
    ...ctx,
    issueDateLabel: formatTemplateDate(ctx.issueDate),
    dueDateLabel: formatTemplateDate(ctx.dueDate),
    totalTtcFormatted: formatCurrency(ctx.totalTtc),
  };
}

const TEMPLATE_DEFINITIONS: Record<
  ReminderTemplateId,
  ReminderTemplateDefinition & {
    buildSubject: (ctx: ResolvedReminderContext) => string;
    buildMessage: (ctx: ResolvedReminderContext) => string;
  }
> = {
  unpaid_invoice: {
    id: "unpaid_invoice",
    label: "Relance facture impayée",
    description: "Pour rappeler poliment une facture non réglée.",
    buildSubject: (ctx) =>
      `Relance facture ${ctx.invoiceNumber} — ${ctx.companyName}`,
    buildMessage: (ctx) => `Bonjour ${ctx.clientName},

Je me permets de vous relancer concernant la facture ${ctx.invoiceNumber} d'un montant de ${ctx.totalTtcFormatted}, émise le ${ctx.issueDateLabel} et arrivée à échéance le ${ctx.dueDateLabel}.

Sauf erreur de ma part, cette facture reste à régler.

Je vous joins la facture en pièce jointe si besoin.

Je vous remercie par avance pour votre retour.

Cordialement,

${ctx.companyName}`,
  },
  quote_expiring: {
    id: "quote_expiring",
    label: "Devis bientôt expiré",
    description: "Pour prévenir que le devis arrive bientôt à échéance.",
    buildSubject: (ctx) =>
      `Votre devis ${ctx.invoiceNumber} arrive bientôt à expiration — ${ctx.companyName}`,
    buildMessage: (ctx) => `Bonjour ${ctx.clientName},

Je me permets de vous rappeler que le devis ${ctx.invoiceNumber}, émis le ${ctx.issueDateLabel}, arrive bientôt à expiration le ${ctx.dueDateLabel}.

Si vous souhaitez valider cette proposition, vous pouvez me confirmer votre accord avant cette date.

Je reste bien entendu disponible si vous avez la moindre question.

Cordialement,

${ctx.companyName}`,
  },
  quote_expired: {
    id: "quote_expired",
    label: "Devis expiré",
    description: "Pour informer que le devis n'est plus valable.",
    buildSubject: (ctx) =>
      `Votre devis ${ctx.invoiceNumber} est arrivé à expiration — ${ctx.companyName}`,
    buildMessage: (ctx) => `Bonjour ${ctx.clientName},

Je vous informe que le devis ${ctx.invoiceNumber}, émis le ${ctx.issueDateLabel}, est arrivé à expiration le ${ctx.dueDateLabel}.

Si vous souhaitez toujours donner suite à ce projet, je peux vous préparer un devis actualisé.

N'hésitez pas à me faire un retour afin que nous puissions voir cela ensemble.

Cordialement,

${ctx.companyName}`,
  },
  quote_validation_reminder: {
    id: "quote_validation_reminder",
    label: "Rappel de validation du devis",
    description:
      "Pour relancer un client qui n'a pas encore validé son devis.",
    buildSubject: (ctx) =>
      `Rappel concernant votre devis ${ctx.invoiceNumber} — ${ctx.companyName}`,
    buildMessage: (ctx) => `Bonjour ${ctx.clientName},

Je me permets de revenir vers vous concernant le devis ${ctx.invoiceNumber}, transmis le ${ctx.issueDateLabel}.

Je souhaitais savoir si vous aviez pu en prendre connaissance et si vous souhaitez donner suite à cette proposition.

Je reste disponible pour échanger ou ajuster certains éléments si nécessaire.

Cordialement,

${ctx.companyName}`,
  },
};

export const REMINDER_TEMPLATES: ReminderTemplateDefinition[] =
  REMINDER_TEMPLATE_IDS.map((id) => ({
    id: TEMPLATE_DEFINITIONS[id].id,
    label: TEMPLATE_DEFINITIONS[id].label,
    description: TEMPLATE_DEFINITIONS[id].description,
  }));

export function isReminderTemplateId(
  value: string,
): value is ReminderTemplateId {
  return (REMINDER_TEMPLATE_IDS as readonly string[]).includes(value);
}

export function getReminderTemplateDefinition(
  id: ReminderTemplateId,
): ReminderTemplateDefinition {
  const t = TEMPLATE_DEFINITIONS[id];
  return { id: t.id, label: t.label, description: t.description };
}

export function buildReminderFromTemplate(
  templateId: ReminderTemplateId,
  ctx: ReminderTemplateContext,
): { subject: string; message: string } {
  const resolved = resolveContext(ctx);
  const template = TEMPLATE_DEFINITIONS[templateId];
  return {
    subject: template.buildSubject(resolved),
    message: template.buildMessage(resolved),
  };
}

/** @deprecated Utiliser `buildReminderFromTemplate` */
export function formatReminderDateLabels(issueDate: string, dueDate: string) {
  return {
    issueDateLabel: formatTemplateDate(issueDate),
    dueDateLabel: formatTemplateDate(dueDate),
  };
}
