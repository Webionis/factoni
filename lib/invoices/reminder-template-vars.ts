import { formatFrenchCalendarDate } from "@/lib/format/datetime";
import { formatCurrency } from "@/lib/invoices/calculate";

export type ReminderTemplateVariables = {
  client_name: string;
  invoice_number: string;
  amount: string;
  due_date: string;
  invoice_link: string;
  portal_link: string;
  company_name: string;
};

export const DEFAULT_REMINDER_EMAIL_SUBJECT =
  "Relance — facture {{invoice_number}}";

export const DEFAULT_REMINDER_EMAIL_MESSAGE = `Bonjour {{client_name}},

Je me permets de vous relancer concernant la facture {{invoice_number}} d'un montant de {{amount}}, arrivée à échéance le {{due_date}}.

Sauf erreur de ma part, cette facture reste à régler. Vous pouvez la consulter et la régler en ligne via le lien ci-dessous :

{{invoice_link}}

Merci de ne pas tenir compte de ce message si le paiement a déjà été effectué.

Cordialement,

{{company_name}}`;

export function formatReminderDueDate(dateStr: string): string {
  return formatFrenchCalendarDate(dateStr, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildReminderTemplateVariables(params: {
  clientName: string;
  invoiceNumber: string;
  totalTtc: number;
  dueDate: string;
  invoiceLink: string;
  portalLink?: string;
  companyName: string;
}): ReminderTemplateVariables {
  return {
    client_name: params.clientName,
    invoice_number: params.invoiceNumber,
    amount: `${formatCurrency(params.totalTtc)} TTC`,
    due_date: formatReminderDueDate(params.dueDate),
    invoice_link: params.invoiceLink,
    portal_link: params.portalLink ?? "",
    company_name: params.companyName,
  };
}

export function applyReminderTemplate(
  template: string,
  variables: ReminderTemplateVariables,
): string {
  return template
    .replaceAll("{{client_name}}", variables.client_name)
    .replaceAll("{{invoice_number}}", variables.invoice_number)
    .replaceAll("{{amount}}", variables.amount)
    .replaceAll("{{due_date}}", variables.due_date)
    .replaceAll("{{invoice_link}}", variables.invoice_link)
    .replaceAll("{{portal_link}}", variables.portal_link)
    .replaceAll("{{company_name}}", variables.company_name);
}

export function resolveReminderEmailContent(params: {
  customSubject: string | null;
  customMessage: string | null;
  variables: ReminderTemplateVariables;
}): { subject: string; message: string } {
  const subjectTemplate =
    params.customSubject?.trim() || DEFAULT_REMINDER_EMAIL_SUBJECT;
  const messageTemplate =
    params.customMessage?.trim() || DEFAULT_REMINDER_EMAIL_MESSAGE;

  return {
    subject: applyReminderTemplate(subjectTemplate, params.variables),
    message: applyReminderTemplate(messageTemplate, params.variables),
  };
}
