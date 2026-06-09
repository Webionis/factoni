# Factoni

Factoni simplifie les devis, factures et relances pour artisans, indépendants et petites entreprises (France).

**Stack :** Next.js 16 · TypeScript · Tailwind · Supabase · Vercel

---

## Démarrage rapide (local)

```bash
npm install
cp .env.local.example .env.local
# Renseigner les 3 variables NEXT_PUBLIC_*
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

---

## Variables d'environnement

| Variable | Obligatoire | Exposée client | Description |
|----------|-------------|----------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Oui | Oui | URL projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui | Oui | Clé anon (protégée par RLS) |
| `NEXT_PUBLIC_APP_URL` | Oui | Oui | URL publique de l'app |
| `NEXT_PUBLIC_SENTRY_DSN` | Non | Oui | Monitoring (optionnel) |

**Ne jamais déployer** `SUPABASE_SERVICE_ROLE_KEY` sur Vercel ni l'utiliser côté navigateur.

---

## Déploiement production (Vercel)

1. Valider : `npm run build`
2. Supabase : `npx supabase db push`
3. Configurer Auth URLs (voir ci-dessous)
4. Importer le repo sur Vercel + variables d'environnement
5. Tester le parcours complet

**Documentation complète :**

| Guide | Contenu |
|-------|---------|
| [**docs/PRODUCTION.md**](docs/PRODUCTION.md) | Installation, Supabase, Storage, Vercel, troubleshooting |
| [**docs/DEPLOYMENT.md**](docs/DEPLOYMENT.md) | Checklist ordonnée deploy |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture technique |
| [docs/SUPABASE.md](docs/SUPABASE.md) | Schéma SQL et migrations |
| [docs/BILLING-FLOW.md](docs/BILLING-FLOW.md) | Flux métier facturation |

### Supabase Auth (production)

- **Site URL** : `https://votre-domaine.vercel.app`
- **Redirect URLs** : `https://votre-domaine.vercel.app/auth/callback`

---

## Scripts

```bash
npm run dev      # développement
npm run build    # build production (obligatoire avant deploy)
npm run start    # serveur production local
npm run lint     # ESLint
```

---

## Structure

```
app/(marketing)   → Landing, pages légales
app/(auth)        → Connexion / inscription
app/(app)         → Dashboard, factures, clients, réglages
app/api/.../pdf   → Génération PDF (Node.js)
lib/actions       → Server Actions
lib/data          → Requêtes Supabase
supabase/         → Migrations SQL
```

---

## Fonctionnalités MVP

- Auth + onboarding entreprise
- Clients et factures (brouillon → envoyée → payée / retard / annulée)
- Numéro légal `FF-YYYY-NNNNNN` à l'envoi
- PDF professionnel (Node runtime)
- Logo entreprise (Storage privé)
- Dashboard (stats, CA 6 mois, activité)
- Duplication de factures
- Mobile-first

---

## Compatibilité Vercel

- App Router ✅
- Middleware session Supabase ✅
- PDF `runtime = "nodejs"` ✅ (`vercel.json` région `cdg1`)
- Images signed URLs Supabase ✅

---

## Licence

Projet privé — tous droits réservés.
