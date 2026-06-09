# Supabase — Factoni

## Migrations (Phase 1)

| Fichier | Contenu |
|---------|---------|
| `20250602100000_extensions_and_enums.sql` | Extensions, enums |
| `20250602100001_core_tables.sql` | Tables + indexes |
| `20250602100002_functions_and_triggers.sql` | Profil auto, numérotation, RLS helpers |
| `20250602100003_row_level_security.sql` | RLS + grants |
| `20250602100004_storage_company_logos.sql` | Bucket `company-logos` + policies Storage |

## CLI — premier setup

```bash
cd /Users/alex/Desktop/factureflash

# Option A : CLI globale (macOS)
brew install supabase/tap/supabase

# Option B : via npm (déjà dans devDependencies)
npm install

# Connexion + lien projet FACTURE
npx supabase login
npx supabase link --project-ref fduqyjadzkslykszpxgj

# Pousser les migrations vers le cloud
npx supabase db push

# Types TypeScript
npx supabase gen types typescript --linked 2>/dev/null > types/database.ts
```

**Projet lié :** `fduqyjadzkslykszpxgj` (FACTURE — Central EU Frankfurt).  
**Postgres :** version 17 (`supabase/config.toml` → `major_version = 17`).

## CLI — développement local

```bash
supabase start          # Docker : Postgres + Auth + Studio local
supabase db reset       # Rejoue migrations + seed.sql
supabase status         # URLs et clés locales
```

Studio local : http://localhost:54323

## Storage — logos entreprise (`company-logos`)

Après migration `20250602100004` :

```bash
npx supabase db push
```

**Bucket :** `company-logos` (privé, max 2 Mo, PNG/JPEG/WebP)  
**Chemin fichier :** `{user_id}/logo.png` (ou `.jpg` / `.webp`)

Vérification manuelle (Dashboard → Storage) : le bucket existe et n’est pas public.

## Seed développement

1. Créer un utilisateur (app `/signup` ou Studio → Authentication).
2. Récupérer l'UUID :
   ```sql
   SELECT id, email FROM auth.users;
   ```
3. Exécuter :
   ```sql
   SELECT public.seed_dev_data('VOTRE-UUID');
   ```

Pour un seed automatique au `db reset`, décommenter la dernière ligne de `seed.sql`.

## Types TypeScript (Phase 1 suite app)

```bash
supabase gen types typescript --linked > types/database.ts
```
