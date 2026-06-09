# Structure Supabase — Factoni

## Migrations (ordre)

| Fichier | Contenu |
|---------|---------|
| `20250602100000` | Extensions, enums (`invoice_status`, `vat_regime`, …) |
| `20250602100001` | Tables : `profiles`, `companies`, `clients`, `invoices`, `invoice_lines`, `invoice_sequences` |
| `20250602100002` | Fonctions : `next_invoice_number`, triggers numéro à `sent`, protection lignes brouillon |
| `20250602100003` | RLS sur toutes les tables |
| `20250602100004` | Storage bucket `company-logos` (privé) + policies |

## Tables principales

### `profiles`

- `id` = `auth.users.id`
- `onboarding_completed`

### `companies`

- 1 entreprise par utilisateur (`user_id` unique)
- `logo_path` : chemin Storage `{user_id}/logo.{ext}`

### `clients`

- Clients de l'utilisateur, soft métier (pas de suppression cascade factures)

### `invoices`

- `status` : draft | sent | paid | overdue | cancelled
- `invoice_number` : null en brouillon, attribué à l'envoi
- `client_snapshot` / `company_snapshot` : JSON figé à l'envoi
- Totaux stockés : `total_ht`, `total_vat`, `total_ttc`

### `invoice_lines`

- Liées à `invoice_id`, ordre `sort_order`
- Modifiables uniquement si facture en `draft` (trigger)

## RLS (principe)

Toutes les policies suivent :

```sql
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid())
```

## Storage

- Bucket : `company-logos` (privé, 2 Mo, png/jpeg/webp)
- Chemin : `{user_id}/logo.{png|jpg|webp}`
- Policies : lecture/écriture uniquement dans son dossier

## Commandes utiles

```bash
npx supabase db push
npx supabase gen types typescript --linked > types/database.ts
```
