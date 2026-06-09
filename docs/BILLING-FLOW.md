# Flux métier — Facturation

## 1. Onboarding

1. Inscription (`/signup`) → Supabase Auth.
2. `/onboarding` : saisie entreprise → `companies` + `profiles.onboarding_completed = true`.

## 2. Clients

- CRUD `/clients` — un client appartient à `user_id`.
- Types : particulier ou professionnel (raison sociale requise).

## 3. Facture — cycle de vie

```
┌─────────┐   Envoyer    ┌──────┐
│ BROUILLON│─────────────▶│ ENVOYÉE│
└─────────┘              └──┬───┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
    ┌────────┐        ┌─────────┐       ┌───────────┐
    │ PAYÉE  │        │ EN RETARD│      │ ANNULÉE  │
    └────────┘        └─────────┘       └───────────┘
```

### Brouillon (`draft`)

- Pas de `invoice_number` (UUID affiché).
- Lignes et totaux éditables.
- Pas de snapshots client/entreprise.
- Suppression autorisée.

### Envoi (`sent`)

- Transition manuelle « Marquer comme envoyée ».
- Trigger SQL : attribution `invoice_number` (`FF-YYYY-NNNNNN`).
- Snapshots `client_snapshot` + `company_snapshot` (dont `logo_path`).
- Données figées — plus d'édition des lignes.

### En retard

- **Affichage** : si `sent` et `due_date` &lt; aujourd'hui → badge « En retard » (sans cron).
- **Manuel** : transition possible vers statut DB `overdue`.

### Payée / Annulée

- Transitions manuelles depuis `sent` ou `overdue`.

## 4. Calculs

- Lignes : `quantity × unit_price_ht`, TVA par ligne, TTC.
- Remise globale : **% OU montant** (pas les deux).
- Franchise en base : TVA 0 %, mention légale automatique.

## 5. PDF

- `GET /api/invoices/[id]/pdf` — propriétaire uniquement.
- Données : snapshots si envoyée ; sinon fallback live pour en-têtes, totaux stockés.
- Logo : signed URL depuis `company_snapshot.logo_path` ou `companies.logo_path`.

## 6. Duplication

- **Dupliquer** : crée un nouveau brouillon (copie lignes, client, remises ; dates du jour ; pas de numéro ni snapshots).
- **Nouvelle depuis existante** : `/invoices/new?from={id}` pré-remplit le formulaire sans enregistrer.

## 7. Dashboard

- Stats : total factures, CA TTC mois courant, brouillons, en retard (effectif).
- Graphique : CA TTC sur 6 mois.
- Activité : dernières mises à jour.
