/** Libellés agenda — formulation neutre (tous métiers). */

export const agendaCopy = {
  plan: "Planifier un rendez-vous",
  edit: "Modifier le rendez-vous",
  upcomingSection: "Rendez-vous à venir",
  nonePlanned: "Aucun rendez-vous planifié",
  noneThisDay: "Aucun rendez-vous ce jour-là.",
  noneThisPeriod: "Aucun rendez-vous sur cette période",
  noneOrganizeHint: "Organisez votre agenda pour garder une vue claire.",
  noneDashboardHint: "Organisez vos prochains créneaux dans l'agenda.",
  pageDescription:
    "Planifiez vos rendez-vous et gardez une vue sur les semaines à venir.",
  deleteConfirm: "Supprimer ce rendez-vous de l'agenda ?",
  notFound: "Rendez-vous introuvable.",
  titlePlaceholder: "Ex. Consultation, visite, intervention…",
  thisWeek: (count: number) =>
    `${count} rendez-vous cette semaine`,
} as const;
