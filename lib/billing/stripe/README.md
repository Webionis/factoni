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

`LIMITS_ENFORCED` dans `lib/billing/access.ts` reste à `false` par défaut.
Passer à `true` quand vous voulez bloquer les quotas du plan gratuit.
