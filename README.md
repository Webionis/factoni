# FactureFlash

Application SaaS de facturation rapide pour artisans, indépendants et petites entreprises (France).

## Stack

- **Next.js** 16 (App Router) + TypeScript
- **Tailwind CSS** v4 + **shadcn/ui**
- **Supabase** (Auth + PostgreSQL) — SSR via `@supabase/ssr`
- Déploiement cible : **Vercel**

> Note : `create-next-app@latest` installe Next.js 16. Compatible avec le plan App Router ; pour épingler Next 15 : `npm install next@15 eslint-config-next@15`.

## Prérequis

- Node.js 20+
- Compte [Supabase](https://supabase.com) (région EU recommandée)

## Installation

```bash
cd factureflash
npm install
cp .env.local.example .env.local
# Renseigner NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Oui | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui | Clé anon (publique, protégée par RLS) |
| `NEXT_PUBLIC_APP_URL` | Oui | URL de l'app (`http://localhost:3000` en local) |
| `SUPABASE_SERVICE_ROLE_KEY` | Non (Phase 1+) | Clé serveur — **jamais** côté client |

Dans Supabase → **Authentication** → **URL Configuration** :

- Site URL : `http://localhost:3000` (ou URL Vercel)
- Redirect URLs : `http://localhost:3000/auth/callback`

## Structure du projet

```
app/
  (marketing)/     # Landing publique
  (auth)/          # login, signup, forgot-password
  (app)/           # zone authentifiée (dashboard, clients, …)
  auth/callback/   # échange code OAuth / email
components/
  ui/              # shadcn
  layout/          # shell, sidebar, bottom nav
  forms/           # (Phase 2+)
lib/
  supabase/        # client, server, middleware
  constants/       # routes, TVA
  invoices/        # (Phase 4)
  pdf/             # (Phase 5)
  validations/     # (Phase 2+)
types/             # domain + database (généré Supabase)
supabase/          # migrations (Phase 1)
middleware.ts      # session + protection des routes
```

## Routes

| Route | Accès |
|-------|--------|
| `/` | Public |
| `/login`, `/signup`, `/forgot-password` | Public (redir. si connecté) |
| `/auth/callback` | Public (Supabase) |
| `/dashboard`, `/clients`, `/invoices`, `/settings/*`, `/onboarding/*` | Authentifié |

## Scripts

```bash
npm run dev      # développement
npm run build    # build production
npm run start    # serveur production
npm run lint     # ESLint
```

## Phases d'implémentation

- [x] **Phase 0** — scaffolding, Supabase SSR, layouts, middleware
- [ ] **Phase 1** — migrations SQL + RLS
- [ ] **Phase 2** — Auth + onboarding entreprise
- [ ] **Phase 3** — Clients
- [ ] **Phase 4** — Factures
- [ ] **Phase 5** — PDF

## Décisions produit MVP

- Numéro légal attribué au passage au statut **envoyée**
- Brouillon : identifiant interne uniquement
- Remise **globale** uniquement
- TVA : 0 %, 5,5 %, 10 %, 20 % + franchise en base
- Pas de monétisation (architecture prête pour `subscriptions` plus tard)

## Licence

Projet privé — tous droits réservés.
