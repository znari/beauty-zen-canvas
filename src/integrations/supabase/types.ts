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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      anamneses: {
        Row: {
          client_id: string
          consent: boolean
          created_at: string | null
          data_nascimento: string | null
          filled_at: string | null
          id: string
          professional_id: string
          responses: Json
          updated_at: string | null
        }
        Insert: {
          client_id: string
          consent?: boolean
          created_at?: string | null
          data_nascimento?: string | null
          filled_at?: string | null
          id?: string
          professional_id: string
          responses?: Json
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          consent?: boolean
          created_at?: string | null
          data_nascimento?: string | null
          filled_at?: string | null
          id?: string
          professional_id?: string
          responses?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anamneses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamneses_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamneses_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_stats"
            referencedColumns: ["professional_id"]
          },
        ]
      }
      billing_transactions: {
        Row: {
          abacate_bill_id: string | null
          abacate_payment_url: string | null
          amount: number
          created_at: string | null
          customer_data: Json
          frequency: string | null
          id: string
          mercadopago_payment_id: string | null
          mercadopago_payment_url: string | null
          mercadopago_preference_id: string | null
          metadata: Json | null
          paid_at: string | null
          payment_gateway: string | null
          plan_id: string
          professional_id: string
          status: string
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          abacate_bill_id?: string | null
          abacate_payment_url?: string | null
          amount: number
          created_at?: string | null
          customer_data: Json
          frequency?: string | null
          id?: string
          mercadopago_payment_id?: string | null
          mercadopago_payment_url?: string | null
          mercadopago_preference_id?: string | null
          metadata?: Json | null
          paid_at?: string | null
          payment_gateway?: string | null
          plan_id: string
          professional_id: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          abacate_bill_id?: string | null
          abacate_payment_url?: string | null
          amount?: number
          created_at?: string | null
          customer_data?: Json
          frequency?: string | null
          id?: string
          mercadopago_payment_id?: string | null
          mercadopago_payment_url?: string | null
          mercadopago_preference_id?: string | null
          metadata?: Json | null
          paid_at?: string | null
          payment_gateway?: string | null
          plan_id?: string
          professional_id?: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_transactions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_transactions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_stats"
            referencedColumns: ["professional_id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          id: string
          name: string
          notes: string | null
          professional_id: string
          updated_at: string | null
          whatsapp_normalized: string | null
          whatsapp_raw: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          name: string
          notes?: string | null
          professional_id: string
          updated_at?: string | null
          whatsapp_normalized?: string | null
          whatsapp_raw?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          name?: string
          notes?: string | null
          professional_id?: string
          updated_at?: string | null
          whatsapp_normalized?: string | null
          whatsapp_raw?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_stats"
            referencedColumns: ["professional_id"]
          },
        ]
      }
      config_ficha_anamnese: {
        Row: {
          created_at: string | null
          id: string
          professional_id: string
          questions: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          professional_id: string
          questions?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          professional_id?: string
          questions?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_ficha_anamnese_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "config_ficha_anamnese_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_stats"
            referencedColumns: ["professional_id"]
          },
        ]
      }
      config_messages_whatsapp: {
        Row: {
          id: string
          message_cancel: string
          message_confirm: string
          message_ficha: string
          message_reminder: string
          professional_id: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          message_cancel?: string
          message_confirm?: string
          message_ficha?: string
          message_reminder?: string
          professional_id: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          message_cancel?: string
          message_confirm?: string
          message_ficha?: string
          message_reminder?: string
          professional_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_messages_whatsapp_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "config_messages_whatsapp_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_stats"
            referencedColumns: ["professional_id"]
          },
        ]
      }
      message_templates: {
        Row: {
          conteudo: string
          created_at: string | null
          id: string
          is_padrao: boolean | null
          nome: string
          professional_id: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          conteudo: string
          created_at?: string | null
          id?: string
          is_padrao?: boolean | null
          nome: string
          professional_id: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          conteudo?: string
          created_at?: string | null
          id?: string
          is_padrao?: boolean | null
          nome?: string
          professional_id?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          anamnesis_id: string | null
          client_id: string | null
          created_at: string
          id: string
          message: string
          professional_id: string
          read: boolean
          title: string
          type: string
          updated_at: string | null
          visit_id: string | null
        }
        Insert: {
          anamnesis_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          message: string
          professional_id: string
          read?: boolean
          title: string
          type?: string
          updated_at?: string | null
          visit_id?: string | null
        }
        Update: {
          anamnesis_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          message?: string
          professional_id?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_anamnesis_id_fkey"
            columns: ["anamnesis_id"]
            isOneToOne: false
            referencedRelation: "anamneses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_payouts: {
        Row: {
          amount: number
          id: string
          notes: string | null
          paid_at: string | null
          paid_by: string | null
          partner_id: string
          pix_key: string
          pix_key_type: string
          referral_ids: string[]
        }
        Insert: {
          amount: number
          id?: string
          notes?: string | null
          paid_at?: string | null
          paid_by?: string | null
          partner_id: string
          pix_key: string
          pix_key_type: string
          referral_ids: string[]
        }
        Update: {
          amount?: number
          id?: string
          notes?: string | null
          paid_at?: string | null
          paid_by?: string | null
          partner_id?: string
          pix_key?: string
          pix_key_type?: string
          referral_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "partner_payouts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          commission_value: number
          created_at: string | null
          email: string
          id: string
          name: string
          notes: string | null
          pending_balance: number | null
          phone: string | null
          pix_key: string | null
          pix_key_type: string | null
          referral_code: string
          rejection_reason: string | null
          status: string
          total_paid: number | null
          total_referrals: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          commission_value?: number
          created_at?: string | null
          email: string
          id?: string
          name: string
          notes?: string | null
          pending_balance?: number | null
          phone?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          referral_code: string
          rejection_reason?: string | null
          status?: string
          total_paid?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          commission_value?: number
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          notes?: string | null
          pending_balance?: number | null
          phone?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          referral_code?: string
          rejection_reason?: string | null
          status?: string
          total_paid?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      plan_definitions: {
        Row: {
          created_at: string | null
          display_order: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_anamneses: number | null
          max_clients: number | null
          max_professionals: number | null
          max_storage_gb: number | null
          name: string
          price_monthly: number
          price_yearly: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          features?: Json | null
          id: string
          is_active?: boolean | null
          max_anamneses?: number | null
          max_clients?: number | null
          max_professionals?: number | null
          max_storage_gb?: number | null
          name: string
          price_monthly: number
          price_yearly?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_anamneses?: number | null
          max_clients?: number | null
          max_professionals?: number | null
          max_storage_gb?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
        }
        Relationships: []
      }
      procedures: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          name: string
          price: number | null
          professional_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          price?: number | null
          professional_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          price?: number | null
          professional_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "procedures_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procedures_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_stats"
            referencedColumns: ["professional_id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_cep: string | null
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          avatar_url: string | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          last_payment_date: string | null
          metadata: Json | null
          phone_normalized: string | null
          phone_raw: string | null
          plan: string | null
          professionals_count: number | null
          referred_by: string | null
          storage_used_mb: number | null
          stripe_customer_id: string | null
          studio_name: string | null
          subscription_ends_at: string | null
          subscription_started_at: string | null
          subscription_status: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          address_cep?: string | null
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          avatar_url?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id: string
          last_payment_date?: string | null
          metadata?: Json | null
          phone_normalized?: string | null
          phone_raw?: string | null
          plan?: string | null
          professionals_count?: number | null
          referred_by?: string | null
          storage_used_mb?: number | null
          stripe_customer_id?: string | null
          studio_name?: string | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          address_cep?: string | null
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          avatar_url?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          last_payment_date?: string | null
          metadata?: Json | null
          phone_normalized?: string | null
          phone_raw?: string | null
          plan?: string | null
          professionals_count?: number | null
          referred_by?: string | null
          storage_used_mb?: number | null
          stripe_customer_id?: string | null
          studio_name?: string | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          commission_amount: number | null
          commission_paid_at: string | null
          created_at: string | null
          first_payment_at: string | null
          id: string
          partner_id: string
          referred_email: string
          referred_user_id: string | null
          status: string
        }
        Insert: {
          commission_amount?: number | null
          commission_paid_at?: string | null
          created_at?: string | null
          first_payment_at?: string | null
          id?: string
          partner_id: string
          referred_email: string
          referred_user_id?: string | null
          status?: string
        }
        Update: {
          commission_amount?: number | null
          commission_paid_at?: string | null
          created_at?: string | null
          first_payment_at?: string | null
          id?: string
          partner_id?: string
          referred_email?: string
          referred_user_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      room_members: {
        Row: {
          id: string
          role: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          role?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          role?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: []
      }
      room_messages: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          room_id: string
          sender_id: string
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: string
          room_id: string
          sender_id: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          room_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_owner: boolean | null
          name: string
          owner_id: string
          phone: string | null
          specialty: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_owner?: boolean | null
          name: string
          owner_id: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_owner?: boolean | null
          name?: string
          owner_id?: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          assigned_professional_id: string | null
          client_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          photos: Json | null
          price_total: number | null
          procedures: Json
          professional_id: string
          status: string
          updated_at: string | null
          visit_date: string
          visit_time: string
        }
        Insert: {
          assigned_professional_id?: string | null
          client_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          photos?: Json | null
          price_total?: number | null
          procedures?: Json
          professional_id: string
          status?: string
          updated_at?: string | null
          visit_date: string
          visit_time: string
        }
        Update: {
          assigned_professional_id?: string | null
          client_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          photos?: Json | null
          price_total?: number | null
          procedures?: Json
          professional_id?: string
          status?: string
          updated_at?: string | null
          visit_date?: string
          visit_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_assigned_professional_id_fkey"
            columns: ["assigned_professional_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_stats"
            referencedColumns: ["professional_id"]
          },
        ]
      }
      webhook_security_logs: {
        Row: {
          created_at: string
          endpoint: string
          error_message: string | null
          id: string
          ip_address: string | null
          origin: string | null
          received_secret_preview: string | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          origin?: string | null
          received_secret_preview?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          origin?: string | null
          received_secret_preview?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_admin_stats: {
        Row: {
          active_subscribers: number | null
          churned_users: number | null
          filled_anamneses: number | null
          mrr: number | null
          new_users_last_month: number | null
          new_users_this_month: number | null
          paid_transactions: number | null
          pending_transactions: number | null
          total_clients: number | null
          total_revenue: number | null
          total_users: number | null
          total_visits: number | null
          trial_users: number | null
        }
        Relationships: []
      }
      v_dashboard_stats: {
        Row: {
          pending_anamneses: number | null
          professional_id: string | null
          total_anamneses: number | null
          total_clients: number | null
          visits_next_7_days: number | null
        }
        Insert: {
          pending_anamneses?: never
          professional_id?: string | null
          total_anamneses?: never
          total_clients?: never
          visits_next_7_days?: never
        }
        Update: {
          pending_anamneses?: never
          professional_id?: string | null
          total_anamneses?: never
          total_clients?: never
          visits_next_7_days?: never
        }
        Relationships: []
      }
    }
    Functions: {
      admin_approve_partner: {
        Args: { p_commission_value?: number; p_partner_id: string }
        Returns: Json
      }
      admin_get_partner_payouts: {
        Args: { p_partner_id: string }
        Returns: {
          amount: number
          id: string
          notes: string
          paid_at: string
          pix_key: string
          pix_key_type: string
          referral_count: number
        }[]
      }
      admin_get_partner_referrals: {
        Args: { p_partner_id: string }
        Returns: {
          commission_amount: number
          commission_paid_at: string
          created_at: string
          first_payment_at: string
          id: string
          referred_email: string
          referred_user_id: string
          status: string
        }[]
      }
      admin_get_partners: {
        Args: never
        Returns: {
          commission_value: number
          created_at: string
          email: string
          id: string
          name: string
          notes: string
          pending_balance: number
          phone: string
          pix_key: string
          pix_key_type: string
          referral_code: string
          rejection_reason: string
          status: string
          total_paid: number
          total_referrals: number
          updated_at: string
          user_id: string
        }[]
      }
      admin_get_pending_commissions: {
        Args: never
        Returns: {
          commission_amount: number
          first_payment_at: string
          partner_email: string
          partner_id: string
          partner_name: string
          partner_pix_key: string
          partner_pix_key_type: string
          referral_id: string
          referred_email: string
        }[]
      }
      admin_pay_commissions: {
        Args: { p_notes?: string; p_referral_ids: string[] }
        Returns: Json
      }
      admin_reject_partner: {
        Args: { p_partner_id: string; p_reason: string }
        Returns: Json
      }
      admin_send_notification: {
        Args: { p_message: string; p_title: string; p_user_id: string }
        Returns: Json
      }
      admin_suspend_partner: {
        Args: { p_partner_id: string; p_reason?: string }
        Returns: Json
      }
      admin_terminate_all_sessions: { Args: never; Returns: number }
      admin_update_user_plan: {
        Args: {
          p_plan: string
          p_subscription_ends_at?: string
          p_subscription_status: string
          p_user_id: string
        }
        Returns: Json
      }
      format_visit_datetime: {
        Args: { p_date: string; p_time: string }
        Returns: string
      }
      generate_referral_code: { Args: never; Returns: string }
      get_admin_growth: {
        Args: never
        Returns: {
          month: string
          new_subscribers: number
          new_users: number
          revenue: number
        }[]
      }
      get_admin_stats: {
        Args: never
        Returns: {
          active_subscribers: number
          churned_users: number
          filled_anamneses: number
          mrr: number
          new_users_last_month: number
          new_users_this_month: number
          paid_transactions: number
          pending_transactions: number
          total_clients: number
          total_revenue: number
          total_users: number
          total_visits: number
          trial_users: number
        }[]
      }
      get_admin_transactions: {
        Args: never
        Returns: {
          amount: number
          created_at: string
          frequency: string
          id: string
          paid_at: string
          payment_gateway: string
          plan_id: string
          professional_id: string
          status: string
          user_email: string
          user_name: string
        }[]
      }
      get_admin_user_details: { Args: { p_user_id: string }; Returns: Json }
      get_admin_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          plan: string
          studio_name: string
          subscription_ends_at: string
          subscription_status: string
          trial_ends_at: string
        }[]
      }
      get_admin_users_detailed: {
        Args: never
        Returns: {
          anamnesis_count: number
          client_count: number
          completed_visit_count: number
          created_at: string
          email: string
          full_name: string
          id: string
          plan: string
          studio_name: string
          subscription_ends_at: string
          subscription_status: string
          team_count: number
          total_revenue: number
          trial_ends_at: string
          visit_count: number
        }[]
      }
      get_partner_dashboard: { Args: { p_user_id?: string }; Returns: Json }
      get_public_visit_info: {
        Args: { client_uuid: string }
        Returns: {
          anamnesis_consent: boolean
          anamnesis_filled_at: string
          anamnesis_id: string
          anamnesis_responses: Json
          client_id: string
          client_name: string
          procedures: Json
          professional_name: string
          studio_name: string
          visit_date: string
          visit_time: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      normalize_phone: { Args: { input_text: string }; Returns: string }
      process_referral_commission: {
        Args: { p_user_id: string }
        Returns: Json
      }
      register_referral: {
        Args: {
          p_referral_code: string
          p_user_email: string
          p_user_id: string
        }
        Returns: Json
      }
      submit_public_anamnesis: {
        Args: { p_client_id: string; p_responses: Json }
        Returns: Json
      }
      validate_referral_code: { Args: { p_code: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "user"
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
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
