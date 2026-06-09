# Guide production — Factoni

Document de référence pour installer, configurer et déployer Factoni en bêta privée ou production.

---

## Table des matières

1. [Installation locale](#1-installation-locale)
2. [Configuration Supabase](#2-configuration-supabase)
3. [Migrations base de données](#3-migrations-base-de-données)
4. [Storage (logos)](#4-storage-logos)
5. [Variables d'environnement](#5-variables-denvironnement)
6. [Déploiement Vercel](#6-déploiement-vercel)
7. [Compatibilité Vercel](#7-compatibilité-vercel)
8. [Structure du projet](#8-structure-du-projet)
9. [Architecture](#9-architecture)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Installation locale

### Prérequis

- **Node.js** 20 ou supérieur
- **npm** 10+
- Compte [Supabase](https://supabase.com)
- (Optionnel) [Supabase CLI](https://supabase.com/docs/guides/cli) via `npx supabase`

### Étapes

```bash
git clone <votre-repo> factureflash
cd factureflash
npm install
cp .env.local.example .env.local
```

Renseigner `.env.local` (voir section 5), puis :

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Scripts

| Commande | Usage |
|----------|--------|
| `npm run dev` | Développement |
| `npm run build` | Build production (à lancer avant chaque deploy) |
| `npm run start` | Serveur production local |
| `npm run lint` | ESLint |

---

## 2. Configuration Supabase

1. Créer un projet Supabase — **région EU** (Frankfurt recommandé).
2. Récupérer dans **Project Settings → API** :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Authentication → Providers** : activer Email (et désactiver les providers non utilisés).
4. **Authentication → URL Configuration** :

| Environnement | Site URL | Redirect URLs |
|---------------|----------|---------------|
| Local | `http://localhost:3000` | `http://localhost:3000/auth/callback` |
| Production | `https://votre-domaine.vercel.app` | `https://votre-domaine.vercel.app/auth/callback` |

Pour les **Preview Deployments** Vercel, ajouter aussi :

`https://*.vercel.app/auth/callback` (wildcard si supporté) ou chaque URL preview utilisée.

---

## 3. Migrations base de données

```bash
npx supabase login
npx supabase link --project-ref VOTRE_PROJECT_REF
npx supabase db push
```

Migrations dans `supabase/migrations/` (ordre chronologique `20250602100000` → `000004`).

Régénérer les types TypeScript :

```bash
npx supabase gen types typescript --linked > types/database.ts
```

Vérifier que **RLS est activé** sur toutes les tables (migration `000003`).

---

## 4. Storage (logos)

La migration `20250602100004_storage_company_logos.sql` crée :

- Bucket **`company-logos`** (privé, 2 Mo max)
- Policies : un utilisateur ne voit/écrit que dans `{user_id}/logo.{png|jpg|webp}`

Vérifier dans Supabase → **Storage** que le bucket existe après `db push`.

---

## 5. Variables d'environnement

### Obligatoires (local + Vercel)

| Variable | Côté | Description |
|----------|------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Serveur | URL API Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Serveur | Clé publique anon (sécurisée par RLS) |
| `NEXT_PUBLIC_APP_URL` | Client + Serveur | URL canonique (SEO, metadata, liens) |

### Optionnelles

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Monitoring erreurs (stub prêt, installer `@sentry/nextjs` pour activer) |

### Interdites sur Vercel (sauf scripts admin locaux)

| Variable | Raison |
|----------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | Bypass RLS — **jamais** en variable publique ni côté navigateur |

### Exemple `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel — environnements

| Variable | Production | Preview | Development |
|----------|------------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_APP_URL` | URL prod | URL preview auto* | — |

\* Pour Preview, utiliser l’URL fixe de preview ou la variable fournie par Vercel (`VERCEL_URL`) — en pratique définir `NEXT_PUBLIC_APP_URL` manuellement par branche si besoin de emails/auth cohérents.

---

## 6. Déploiement Vercel

### Ordre des actions (checklist)

```
Étape 1  — npm run build en local (doit passer)
Étape 2  — Supabase : db push + Storage OK
Étape 3  — Supabase Auth : URLs production
Étape 4  — Vercel : importer le repo Git
Étape 5  — Vercel : variables d'environnement (section 5)
Étape 6  — Premier deploy Production
Étape 7  — Tests manuels (section ci-dessous)
Étape 8  — Domaine custom (optionnel)
Étape 9  — Compléter pages légales (mentions, confidentialité)
```

### Configuration projet Vercel

- **Framework** : Next.js (auto)
- **Région** : `cdg1` (Paris) — défini dans `vercel.json`
- **Build** : `npm run build`
- **Install** : `npm install`
- **Node** : 20.x (voir `package.json` → `engines`)

Aucune variable serveur secrète requise pour le MVP.

### Tests post-déploiement

- [ ] Landing `/` charge
- [ ] Inscription + connexion
- [ ] Onboarding entreprise
- [ ] Création client
- [ ] Création facture brouillon
- [ ] Envoi → numéro `FF-YYYY-NNNNNN`
- [ ] PDF téléchargeable
- [ ] Upload logo
- [ ] Dashboard (stats + graphique)
- [ ] Duplication facture

---

## 7. Compatibilité Vercel

| Élément | Statut | Détail |
|---------|--------|--------|
| Next.js App Router | ✅ | Next 16 |
| Middleware auth | ✅ | `middleware.ts` + `@supabase/ssr` |
| Server Actions | ✅ | Mutations protégées |
| Route API PDF | ✅ | `runtime = "nodejs"`, `maxDuration = 30` |
| Images Supabase | ✅ | `next.config.ts` → `remotePatterns` sign URLs |
| Edge PDF | ❌ | Ne pas forcer Edge sur `/api/invoices/*/pdf` |
| `vercel.json` | ✅ | Région `cdg1` |

---

## 8. Structure du projet

```
factureflash/
├── app/
│   ├── (marketing)/      # Landing, légal
│   ├── (auth)/           # Login, signup
│   ├── (app)/            # Zone authentifiée
│   ├── (onboarding)/
│   ├── api/invoices/[id]/pdf/  # PDF Node.js
│   └── auth/callback/
├── components/           # UI, forms, layout
├── lib/
│   ├── actions/          # Server Actions
│   ├── data/             # Requêtes Supabase
│   ├── invoices/         # Métier factures
│   ├── pdf/              # Génération PDF
│   ├── supabase/         # Clients SSR
│   └── validations/      # Zod
├── supabase/migrations/
├── docs/                 # Documentation
├── middleware.ts
├── vercel.json
└── types/database.ts     # Types générés
```

---

## 9. Architecture

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) et [BILLING-FLOW.md](./BILLING-FLOW.md).

Résumé sécurité :

- **RLS** sur toutes les tables
- **Auth** cookie-based via Supabase SSR
- **PDF** : vérif propriétaire `user_id`
- **Storage** : bucket privé + signed URLs
- **Sanitization** : `lib/sanitize.ts` sur textes

---

## 10. Troubleshooting

### Build échoue en local

```bash
rm -rf .next node_modules
npm install
npm run build
```

### « Configuration serveur incomplète » (503)

Variables `NEXT_PUBLIC_SUPABASE_*` manquantes sur Vercel ou dans `.env.local`.

### Redirect infini login / onboarding

- Vérifier **Redirect URLs** Supabase = URL exacte de l’app
- Vérifier `profiles.onboarding_completed` en base

### PDF 500 en production

- Vérifier logs Vercel (fonction Node.js)
- Facture doit avoir des lignes
- Logo : signed URL expirée → régénérer PDF

### Logo ne s’affiche pas

- Bucket `company-logos` créé ?
- Migration `000004` appliquée ?
- `logo_path` renseigné dans `companies` ?

### Session expirée

Comportement attendu : redirect `/login?error=session_expired`. Reconnexion.

### Middleware lent

Chaque requête protégée vérifie l’onboarding en base — acceptable en bêta ; optimiser plus tard (cache cookie).

---

## Liens

- [DEPLOYMENT.md](./DEPLOYMENT.md) — checklist courte deploy
- [SUPABASE.md](./SUPABASE.md) — schéma SQL
- [README.md](../README.md) — vue d’ensemble
