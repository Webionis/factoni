# Déploiement Vercel — checklist rapide

Guide détaillé : **[PRODUCTION.md](./PRODUCTION.md)**

---

## Ordre exact des actions

### Avant Vercel

1. `cd factureflash && npm install && npm run build` → **doit réussir**
2. `npx supabase link --project-ref REF && npx supabase db push`
3. Supabase → Auth → URLs **locales** testées

### Sur Vercel

4. **New Project** → importer le dépôt GitHub/GitLab
5. Framework : **Next.js** (auto-détecté)
6. **Environment Variables** → Production :

| Nom | Valeur |
|-----|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé anon |
| `NEXT_PUBLIC_APP_URL` | `https://votre-app.vercel.app` |

7. (Optionnel) Preview : mêmes variables `NEXT_PUBLIC_*`
8. (Optionnel) `NEXT_PUBLIC_SENTRY_DSN`
9. **Deploy**

### Après le premier deploy

10. Supabase → Auth → **Site URL** = `NEXT_PUBLIC_APP_URL`
11. Supabase → Auth → **Redirect URLs** = `{APP_URL}/auth/callback`
12. Tester : signup → onboarding → facture → PDF

### Domaine custom (optionnel)

13. Vercel → Domains
14. Mettre à jour `NEXT_PUBLIC_APP_URL` + Supabase Auth URLs

---

## Ce qu’il ne faut PAS faire

- ❌ Ajouter `SUPABASE_SERVICE_ROLE_KEY` sur Vercel
- ❌ Rendre le bucket `company-logos` public
- ❌ Forcer Edge runtime sur la route PDF

---

## Fichiers de config projet

| Fichier | Rôle |
|---------|------|
| `vercel.json` | Région EU `cdg1` |
| `next.config.ts` | Images Supabase signées |
| `app/api/invoices/[id]/pdf/route.ts` | `runtime = "nodejs"`, `maxDuration = 30` |

---

## Checklist finale bêta

```
[ ] Build local OK
[ ] Migrations Supabase OK
[ ] Variables Vercel Production
[ ] Auth redirect URLs prod
[ ] Test PDF prod
[ ] Test logo upload
[ ] Pages légales complétées
[ ] Liste testeurs bêta prête
```
