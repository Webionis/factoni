# Stripe — intégration future

Pendant la **bêta**, les paiements sont désactivés (`STRIPE_ENABLED = false`).

## Parcours prévu

1. **Checkout** — `POST /api/billing/checkout` (à créer) → Stripe Checkout Session
2. **Webhook** — `POST /api/webhooks/stripe` → synchroniser `public.subscriptions`
3. **Portail client** — Stripe Customer Portal pour upgrade / annulation
4. **Mapping plans** — `starter` / `pro` via `STRIPE_PRICE_IDS` dans `config.ts`

## Variables d'environnement (futur)

```env
STRIPE_ENABLED=true
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

## Événements webhook

Voir `events.ts` — `checkout.session.completed`, `customer.subscription.*`, `invoice.*`.

## Sécurité

- Mises à jour `subscriptions` via **service role** uniquement (webhook)
- RLS : les utilisateurs ne peuvent que **lire** leur abonnement
