# Architecture — Factoni

## Vue d'ensemble

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Vercel    │────▶│  Next.js 16  │────▶│    Supabase     │
│  (Hosting)  │     │  App Router  │     │ Auth + Postgres │
└─────────────┘     │  + RSC/SSR   │     │ + Storage RLS   │
                    └──────────────┘     └─────────────────┘
```

- **Frontend** : React 19, Tailwind v4, shadcn/ui
- **Auth** : Supabase Auth via `@supabase/ssr` (cookies, middleware)
- **Données** : PostgreSQL avec RLS strict (`user_id = auth.uid()`)
- **PDF** : `@react-pdf/renderer` en route API Node.js

## Structure des dossiers

| Dossier | Rôle |
|---------|------|
| `app/(marketing)/` | Landing, pages légales publiques |
| `app/(auth)/` | Login, signup, mot de passe oublié |
| `app/(app)/` | Zone authentifiée (dashboard, factures, clients) |
| `app/(onboarding)/` | Première configuration entreprise |
| `app/api/` | Routes API (PDF) |
| `components/` | UI, formulaires, layouts |
| `lib/actions/` | Server Actions (mutations) |
| `lib/data/` | Requêtes lecture (Supabase) |
| `lib/invoices/` | Calculs, statuts, overdue, duplication |
| `lib/pdf/` | Génération PDF |
| `lib/validations/` | Schémas Zod |
| `supabase/migrations/` | Schéma SQL versionné |

## Flux d'authentification

1. `middleware.ts` rafraîchit la session Supabase.
2. Non connecté → `/login` (sauf routes publiques).
3. Connecté sans onboarding → `/onboarding`.
4. Connecté + onboarding → `/dashboard`.

## Sécurité

- Clé **anon** uniquement côté client ; RLS protège les données.
- Server Actions : `requireAuthenticatedUser()` + vérif `user_id` sur chaque ressource.
- PDF : `invoice.user_id === user.id` avant génération.
- Logos : bucket privé `company-logos`, URLs signées.
- Texte : `lib/sanitize.ts` sur payloads entreprise/client/facture.

## Flux métier facturation

Voir [BILLING-FLOW.md](./BILLING-FLOW.md).

## Conventions

- **Server Actions** pour toutes les mutations.
- **Pas de fetch client** vers Supabase pour les écritures sensibles.
- **Snapshots JSON** (`client_snapshot`, `company_snapshot`) figés à l'envoi (`draft → sent`).
- **Numéro légal** : trigger SQL à l'envoi uniquement (`FF-YYYY-NNNNNN`).
- **Statut overdue affiché** : calcul dynamique si `sent` + `due_date` passée (`lib/invoices/overdue.ts`).

## Dette connue

- Pas de pagination serveur sur listes.
- Pas de cron pour statut `overdue` en base.
- Sentry en stub (DSN optionnel).
