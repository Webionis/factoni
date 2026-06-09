export const INVOICE_REMINDER_TYPES = [
  "manual",
  "auto_3",
  "auto_7",
  "auto_14",
] as const;

export type InvoiceReminderType = (typeof INVOICE_REMINDER_TYPES)[number];

export type AutoInvoiceReminderType = Extract<
  InvoiceReminderType,
  "auto_3" | "auto_7" | "auto_14"
>;

export const AUTO_REMINDER_TIERS: {
  type: AutoInvoiceReminderType;
  daysAfterDue: number;
  label: string;
}[] = [
  { type: "auto_3", daysAfterDue: 3, label: "J+3" },
  { type: "auto_7", daysAfterDue: 7, label: "J+7" },
  { type: "auto_14", daysAfterDue: 14, label: "J+14" },
];

export function isAutoReminderType(
  value: string,
): value is AutoInvoiceReminderType {
  return value === "auto_3" || value === "auto_7" || value === "auto_14";
}

export function reminderTypeLabel(type: InvoiceReminderType): string {
  switch (type) {
    case "manual":
      return "Relance manuelle";
    case "auto_3":
      return "Relance automatique (J+3)";
    case "auto_7":
      return "Relance automatique (J+7)";
    case "auto_14":
      return "Relance automatique finale (J+14)";
    default:
      return "Relance";
  }
}
