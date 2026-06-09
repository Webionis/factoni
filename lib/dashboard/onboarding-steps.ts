export type OnboardingStep = {
  id: string;
  label: string;
  done: boolean;
  href: string;
};

export function buildOnboardingSteps(input: {
  companyConfigured: boolean;
  clientCount: number;
  invoiceCount: number;
}): OnboardingStep[] {
  return [
    {
      id: "company",
      label: "Ajouter les infos entreprise",
      done: input.companyConfigured,
      href: "/settings/company",
    },
    {
      id: "client",
      label: "Ajouter un client",
      done: input.clientCount > 0,
      href: "/clients/new",
    },
    {
      id: "invoice",
      label: "Créer une facture",
      done: input.invoiceCount > 0,
      href: "/invoices/new",
    },
    {
      id: "pdf",
      label: "Télécharger un PDF",
      done: input.invoiceCount > 0,
      href: "/invoices",
    },
  ];
}

export function isOnboardingComplete(steps: OnboardingStep[]): boolean {
  return steps.every((s) => s.done);
}
