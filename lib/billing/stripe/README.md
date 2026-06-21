# Stripe — abonnement SaaS Factoni

Deux intégrations Stripe coexistent :

| Usage | Webhook | Secret |
|-------|---------|--------|
| Paiements factures clients (Connect) | `/api/stripe/webhook` | `STRIPE_WEBHOOK_SECRET` |
| Abonnement Factoni (Starter/Pro) | `/api/webhooks/stripe` | `STRIPE_BILLING_WEBHOOK_SECRET` |

## Activation

1. Créer les produits **Starter** (19 €/mois) et **Pro** (39 €/mois) dans Stripe Dashboard
2. Copier les `price_...` dans `.env.local` :
   ```env
   STRIPE_BILLING_ENABLED=true
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PRICE_STARTER_MONTHLY=price_...
   STRIPE_PRICE_PRO_MONTHLY=price_...
   STRIPE_BILLING_WEBHOOK_SECRET=whsec_...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
3. Configurer le webhook Stripe → `https://factoni.fr/api/webhooks/stripe`
4. Activer le **Customer Portal** dans Stripe (upgrade, annulation, factures)
5. Redémarrer `npm run dev`

## Test local

Terminal 1 — app :
```bash
npm run dev
```

Terminal 2 — webhook billing :
```bash
npm run stripe:listen:billing
```

Copier le `whsec_...` affiché dans `STRIPE_BILLING_WEBHOOK_SECRET`.

## Changement d'offre (Starter ↔ Pro)

Le bouton **Passer à Pro** ouvre une **page de paiement Stripe** pour régler le
complément au prorata (calculé avant affichage). Sans ce paiement, le passage à
Pro est refusé.

Les rétrogradations (Pro → Starter) ne génèrent pas de crédit exploitable.

Le portail **Gérer l'abonnement** sert surtout à mettre à jour la carte bancaire ou annuler.

1. `/settings/billing` → bouton **Choisir Starter/Pro**
2. Stripe Checkout → paiement
3. Webhook → sync `public.subscriptions` (plan, statut, IDs Stripe)
4. **Gérer l'abonnement** → Stripe Customer Portal

## Sécurité

- Mises à jour `subscriptions` via **service role** uniquement (webhook)
- RLS : l'utilisateur ne peut que **lire** son abonnement
- Idempotence via `stripe_webhook_events`

## Quotas features

En production, le gating Starter/Pro et les quotas plan gratuit s'activent
automatiquement lorsque le billing Stripe est configuré (`isBillingStripeConfigured()`).

Variables optionnelles :
- `FACTONI_PRODUCTION_LAUNCH=true|false` — force ou désactive le mode lancement
- `BILLING_LIMITS_ENFORCED=true|false` — quotas plan gratuit (10 factures / 5 clients)

Les comptes **beta** existants conservent l'accès fondateur. Les **nouveaux** comptes
sont créés en plan **free** (migration `20250630100000_launch_default_free_plan.sql`).
