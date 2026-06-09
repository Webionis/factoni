-- Acomptes sur devis (workflow deposit_requested → deposit_paid → invoiced)
-- =============================================================================

-- Nouveaux statuts devis dans l'enum partagé invoice_status
ALTER TYPE public.invoice_status ADD VALUE IF NOT EXISTS 'deposit_requested';
ALTER TYPE public.invoice_status ADD VALUE IF NOT EXISTS 'deposit_paid';
ALTER TYPE public.invoice_status ADD VALUE IF NOT EXISTS 'invoiced';

CREATE TYPE public.quote_deposit_type AS ENUM ('percent', 'fixed');
CREATE TYPE public.quote_deposit_status AS ENUM ('none', 'requested', 'paid');

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS quote_deposit_type public.quote_deposit_type,
  ADD COLUMN IF NOT EXISTS quote_deposit_value NUMERIC(12, 4),
  ADD COLUMN IF NOT EXISTS quote_deposit_amount NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS quote_deposit_status public.quote_deposit_status NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS quote_deposit_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS quote_deposit_invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS quote_balance_invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS remaining_balance_amount NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS deposit_checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS deposit_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS deposit_applied_amount NUMERIC(12, 2);

CREATE INDEX IF NOT EXISTS invoices_quote_deposit_status_idx
  ON public.invoices (quote_deposit_status)
  WHERE document_type = 'quote';

CREATE INDEX IF NOT EXISTS invoices_deposit_checkout_session_id_idx
  ON public.invoices (deposit_checkout_session_id)
  WHERE deposit_checkout_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS invoices_quote_balance_invoice_id_idx
  ON public.invoices (quote_balance_invoice_id)
  WHERE quote_balance_invoice_id IS NOT NULL;

-- Notifications uniques pour acomptes
CREATE UNIQUE INDEX IF NOT EXISTS notifications_quote_deposit_requested_unique_idx
  ON public.notifications (user_id, type, ((data->>'quote_id')))
  WHERE type = 'quote_deposit_requested';

CREATE UNIQUE INDEX IF NOT EXISTS notifications_quote_deposit_paid_unique_idx
  ON public.notifications (user_id, type, ((data->>'quote_id')))
  WHERE type = 'quote_deposit_paid';

-- Verrouillage contenu après acceptation — autoriser workflow acompte
CREATE OR REPLACE FUNCTION public.prevent_accepted_quote_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.document_type = 'quote'
     AND OLD.status IN ('accepted', 'deposit_requested', 'deposit_paid', 'invoiced')
  THEN
    -- Conversion manuelle ou facture de solde auto
    IF NEW.converted_to_invoice_id IS DISTINCT FROM OLD.converted_to_invoice_id
       AND NEW.converted_to_invoice_id IS NOT NULL
       AND NEW.total_ht = OLD.total_ht
       AND NEW.total_ttc = OLD.total_ttc
       AND NEW.total_vat = OLD.total_vat
       AND NEW.client_snapshot IS NOT DISTINCT FROM OLD.client_snapshot
       AND NEW.company_snapshot IS NOT DISTINCT FROM OLD.company_snapshot
    THEN
      RETURN NEW;
    END IF;

    IF NEW.quote_balance_invoice_id IS DISTINCT FROM OLD.quote_balance_invoice_id
       AND NEW.quote_balance_invoice_id IS NOT NULL
       AND NEW.total_ht = OLD.total_ht
       AND NEW.total_ttc = OLD.total_ttc
       AND NEW.total_vat = OLD.total_vat
       AND NEW.client_snapshot IS NOT DISTINCT FROM OLD.client_snapshot
       AND NEW.company_snapshot IS NOT DISTINCT FROM OLD.company_snapshot
    THEN
      RETURN NEW;
    END IF;

    -- Workflow acompte : champs dédiés + transitions de statut autorisées
    IF NEW.total_ht = OLD.total_ht
       AND NEW.total_ttc = OLD.total_ttc
       AND NEW.total_vat = OLD.total_vat
       AND NEW.client_snapshot IS NOT DISTINCT FROM OLD.client_snapshot
       AND NEW.company_snapshot IS NOT DISTINCT FROM OLD.company_snapshot
       AND NEW.client_id = OLD.client_id
       AND NEW.company_id = OLD.company_id
       AND NEW.issue_date = OLD.issue_date
       AND NEW.due_date = OLD.due_date
       AND NEW.invoice_number IS NOT DISTINCT FROM OLD.invoice_number
       AND NEW.notes IS NOT DISTINCT FROM OLD.notes
       AND NEW.payment_terms IS NOT DISTINCT FROM OLD.payment_terms
       AND NEW.discount_percent IS NOT DISTINCT FROM OLD.discount_percent
       AND NEW.discount_amount IS NOT DISTINCT FROM OLD.discount_amount
    THEN
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'accepted_quote_locked';
  END IF;

  RETURN NEW;
END;
$$;
