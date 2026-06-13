export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          client_type: Database["public"]["Enums"]["client_type"]
          company_name: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          portal_access_enabled: boolean
          portal_token: string | null
          portal_token_created_at: string | null
          postal_code: string | null
          siren: string | null
          siret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          portal_access_enabled?: boolean
          portal_token?: string | null
          portal_token_created_at?: string | null
          postal_code?: string | null
          siren?: string | null
          siret?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          portal_access_enabled?: boolean
          portal_token?: string | null
          portal_token_created_at?: string | null
          postal_code?: string | null
          siren?: string | null
          siret?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_locations: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          archived_at: string | null
          city: string | null
          client_id: string
          country: string
          created_at: string
          id: string
          is_default: boolean
          label: string
          notes: string | null
          postal_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          archived_at?: string | null
          city?: string | null
          client_id: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label: string
          notes?: string | null
          postal_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          archived_at?: string | null
          city?: string | null
          client_id?: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          notes?: string | null
          postal_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_locations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_jobs: {
        Row: {
          archived_at: string | null
          client_id: string | null
          client_location_id: string | null
          created_at: string
          id: string
          notes: string | null
          scheduled_date: string
          scheduled_time: string | null
          status: Database["public"]["Enums"]["scheduled_job_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          client_id?: string | null
          client_location_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["scheduled_job_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          client_id?: string | null
          client_location_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["scheduled_job_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_jobs_client_location_id_fkey"
            columns: ["client_location_id"]
            isOneToOne: false
            referencedRelation: "client_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address_line1: string
          address_line2: string | null
          auto_reminder_day_14: boolean
          auto_reminder_day_3: boolean
          auto_reminder_day_7: boolean
          auto_reminders_enabled: boolean
          city: string
          country: string
          created_at: string
          default_vat_rate: number
          email: string
          id: string
          legal_mentions: string | null
          legal_name: string
          logo_path: string | null
          payment_terms: string | null
          phone: string | null
          postal_code: string
          reminder_email_message: string | null
          reminder_email_subject: string | null
          siren: string | null
          siret: string | null
          trade_name: string
          updated_at: string
          user_id: string
          vat_number: string | null
          vat_regime: Database["public"]["Enums"]["vat_regime"]
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          auto_reminder_day_14?: boolean
          auto_reminder_day_3?: boolean
          auto_reminder_day_7?: boolean
          auto_reminders_enabled?: boolean
          city: string
          country?: string
          created_at?: string
          default_vat_rate?: number
          email: string
          id?: string
          legal_mentions?: string | null
          legal_name: string
          logo_path?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code: string
          reminder_email_message?: string | null
          reminder_email_subject?: string | null
          siren?: string | null
          siret?: string | null
          trade_name: string
          updated_at?: string
          user_id: string
          vat_number?: string | null
          vat_regime?: Database["public"]["Enums"]["vat_regime"]
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          auto_reminder_day_14?: boolean
          auto_reminder_day_3?: boolean
          auto_reminder_day_7?: boolean
          auto_reminders_enabled?: boolean
          city?: string
          country?: string
          created_at?: string
          default_vat_rate?: number
          email?: string
          id?: string
          legal_mentions?: string | null
          legal_name?: string
          logo_path?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string
          reminder_email_message?: string | null
          reminder_email_subject?: string | null
          siren?: string | null
          siret?: string | null
          trade_name?: string
          updated_at?: string
          user_id?: string
          vat_number?: string | null
          vat_regime?: Database["public"]["Enums"]["vat_regime"]
        }
        Relationships: []
      }
      export_history: {
        Row: {
          created_at: string
          export_type: string
          file_size_bytes: number
          filters: Json
          format: string
          id: string
          label: string
          row_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          export_type: string
          file_size_bytes?: number
          filters?: Json
          format: string
          id?: string
          label: string
          row_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          export_type?: string
          file_size_bytes?: number
          filters?: Json
          format?: string
          id?: string
          label?: string
          row_count?: number
          user_id?: string
        }
        Relationships: []
      }
      export_schedules: {
        Row: {
          created_at: string
          enabled: boolean
          export_type: string
          format: string
          frequency: string
          id: string
          last_sent_at: string | null
          recipient_email: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          export_type?: string
          format?: string
          frequency?: string
          id?: string
          last_sent_at?: string | null
          recipient_email: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          export_type?: string
          format?: string
          frequency?: string
          id?: string
          last_sent_at?: string | null
          recipient_email?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_lines: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          line_total_ht: number
          line_total_ttc: number
          line_vat: number
          quantity: number
          sort_order: number
          unit_price_ht: number
          updated_at: string
          vat_rate: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          line_total_ht?: number
          line_total_ttc?: number
          line_vat?: number
          quantity: number
          sort_order?: number
          unit_price_ht: number
          updated_at?: string
          vat_rate?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          line_total_ht?: number
          line_total_ttc?: number
          line_vat?: number
          quantity?: number
          sort_order?: number
          unit_price_ht?: number
          updated_at?: string
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_reminders: {
        Row: {
          created_at: string
          id: string
          invoice_id: string
          message: string
          provider_message_id: string | null
          recipient_email: string
          reminder_type: string
          sent_at: string
          sent_by_name: string | null
          status: string
          subject: string
          template_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id: string
          message: string
          provider_message_id?: string | null
          recipient_email: string
          reminder_type: string
          sent_at?: string
          sent_by_name?: string | null
          status?: string
          subject: string
          template_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string
          message?: string
          provider_message_id?: string | null
          recipient_email?: string
          reminder_type?: string
          sent_at?: string
          sent_by_name?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_reminders_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_sequences: {
        Row: {
          company_id: string
          last_number: number
          year: number
        }
        Insert: {
          company_id: string
          last_number?: number
          year: number
        }
        Update: {
          company_id?: string
          last_number?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_sequences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          accepted_at: string | null
          accepted_by_name: string | null
          accepted_ip: string | null
          accepted_signature_url: string | null
          accepted_user_agent: string | null
          acceptance_snapshot: Json | null
          archived_at: string | null
          auto_reminders_disabled: boolean
          cancelled_at: string | null
          client_id: string
          client_location_id: string | null
          client_location_snapshot: Json | null
          client_snapshot: Json | null
          company_id: string
          company_snapshot: Json | null
          converted_to_invoice_id: string | null
          created_at: string
          deposit_applied_amount: number | null
          deposit_checkout_session_id: string | null
          deposit_payment_intent_id: string | null
          discount_amount: number | null
          discount_percent: number | null
          document_type: Database["public"]["Enums"]["document_type"]
          due_date: string
          id: string
          invoice_number: string | null
          issue_date: string
          notes: string | null
          paid_at: string | null
          payment_terms: string | null
          public_access_enabled: boolean
          public_document_token: string | null
          public_document_token_created_at: string | null
          quote_balance_invoice_id: string | null
          quote_deposit_amount: number | null
          quote_deposit_invoice_id: string | null
          quote_deposit_paid_at: string | null
          quote_deposit_status: Database["public"]["Enums"]["quote_deposit_status"]
          quote_deposit_type: Database["public"]["Enums"]["quote_deposit_type"] | null
          quote_deposit_value: number | null
          remaining_balance_amount: number | null
          sent_at: string | null
          signature_hash: string | null
          source_quote_id: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          total_ht: number
          total_ttc: number
          total_vat: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_name?: string | null
          accepted_ip?: string | null
          accepted_signature_url?: string | null
          accepted_user_agent?: string | null
          acceptance_snapshot?: Json | null
          archived_at?: string | null
          auto_reminders_disabled?: boolean
          cancelled_at?: string | null
          client_id: string
          client_location_id?: string | null
          client_location_snapshot?: Json | null
          client_snapshot?: Json | null
          company_id: string
          company_snapshot?: Json | null
          converted_to_invoice_id?: string | null
          created_at?: string
          deposit_applied_amount?: number | null
          deposit_checkout_session_id?: string | null
          deposit_payment_intent_id?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          document_type?: Database["public"]["Enums"]["document_type"]
          due_date: string
          id?: string
          invoice_number?: string | null
          issue_date?: string
          notes?: string | null
          paid_at?: string | null
          payment_terms?: string | null
          public_access_enabled?: boolean
          public_document_token?: string | null
          public_document_token_created_at?: string | null
          quote_balance_invoice_id?: string | null
          quote_deposit_amount?: number | null
          quote_deposit_invoice_id?: string | null
          quote_deposit_paid_at?: string | null
          quote_deposit_status?: Database["public"]["Enums"]["quote_deposit_status"]
          quote_deposit_type?: Database["public"]["Enums"]["quote_deposit_type"] | null
          quote_deposit_value?: number | null
          remaining_balance_amount?: number | null
          sent_at?: string | null
          signature_hash?: string | null
          source_quote_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          total_ht?: number
          total_ttc?: number
          total_vat?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_name?: string | null
          accepted_ip?: string | null
          accepted_signature_url?: string | null
          accepted_user_agent?: string | null
          acceptance_snapshot?: Json | null
          archived_at?: string | null
          auto_reminders_disabled?: boolean
          cancelled_at?: string | null
          client_id?: string
          client_location_id?: string | null
          client_location_snapshot?: Json | null
          client_snapshot?: Json | null
          company_id?: string
          company_snapshot?: Json | null
          converted_to_invoice_id?: string | null
          created_at?: string
          deposit_applied_amount?: number | null
          deposit_checkout_session_id?: string | null
          deposit_payment_intent_id?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          document_type?: Database["public"]["Enums"]["document_type"]
          due_date?: string
          id?: string
          invoice_number?: string | null
          issue_date?: string
          notes?: string | null
          paid_at?: string | null
          payment_terms?: string | null
          public_access_enabled?: boolean
          public_document_token?: string | null
          public_document_token_created_at?: string | null
          quote_balance_invoice_id?: string | null
          quote_deposit_amount?: number | null
          quote_deposit_invoice_id?: string | null
          quote_deposit_paid_at?: string | null
          quote_deposit_status?: Database["public"]["Enums"]["quote_deposit_status"]
          quote_deposit_type?: Database["public"]["Enums"]["quote_deposit_type"] | null
          quote_deposit_value?: number | null
          remaining_balance_amount?: number | null
          sent_at?: string | null
          signature_hash?: string | null
          source_quote_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          total_ht?: number
          total_ttc?: number
          total_vat?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          onboarding_completed: boolean
          stripe_account_id: string | null
          stripe_charges_enabled: boolean
          stripe_onboarding_completed: boolean
          stripe_payouts_enabled: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean
          stripe_onboarding_completed?: boolean
          stripe_payouts_enabled?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean
          stripe_onboarding_completed?: boolean
          stripe_payouts_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      stripe_webhook_events: {
        Row: {
          event_type: string
          id: string
          processed_at: string
          stripe_event_id: string
        }
        Insert: {
          event_type: string
          id?: string
          processed_at?: string
          stripe_event_id: string
        }
        Update: {
          event_type?: string
          id?: string
          processed_at?: string
          stripe_event_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_quote_by_public_token: {
        Args: { p_token: string }
        Returns: boolean
      }
      ensure_public_document_token: {
        Args: { p_document_id: string }
        Returns: string
      }
      get_public_document_by_token: {
        Args: { p_token: string }
        Returns: Json
      }
      mark_quote_viewed_by_public_token: {
        Args: { p_token: string }
        Returns: boolean
      }
      next_invoice_number: { Args: { p_company_id: string }; Returns: string }
      next_quote_number: { Args: { p_company_id: string }; Returns: string }
      sign_quote_by_public_token: {
        Args: {
          p_acceptance_snapshot: Json
          p_ip: string
          p_signature_hash: string
          p_signature_path: string
          p_signer_name: string
          p_token: string
          p_user_agent: string
        }
        Returns: boolean
      }
    }
    Enums: {
      client_type: "individual" | "company"
      document_type: "invoice" | "quote"
      invoice_status:
        | "draft"
        | "ready"
        | "sent"
        | "paid"
        | "overdue"
        | "cancelled"
        | "accepted"
        | "rejected"
        | "expired"
        | "viewed"
        | "deposit_requested"
        | "deposit_paid"
        | "invoiced"
      quote_deposit_status: "none" | "requested" | "paid"
      quote_deposit_type: "percent" | "fixed"
      scheduled_job_status: "planned" | "in_progress" | "done" | "cancelled"
      subscription_plan: "beta" | "free" | "starter" | "pro"
      subscription_status: "active" | "cancelled" | "past_due" | "trialing"
      vat_regime: "standard" | "franchise"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      client_type: ["individual", "company"],
      document_type: ["invoice", "quote"],
      invoice_status: [
        "draft",
        "ready",
        "sent",
        "paid",
        "overdue",
        "cancelled",
        "accepted",
        "rejected",
        "expired",
        "viewed",
        "deposit_requested",
        "deposit_paid",
        "invoiced",
      ],
      quote_deposit_status: ["none", "requested", "paid"],
      quote_deposit_type: ["percent", "fixed"],
      subscription_plan: ["beta", "free", "starter", "pro"],
      subscription_status: ["active", "cancelled", "past_due", "trialing"],
      vat_regime: ["standard", "franchise"],
    },
  },
} as const
