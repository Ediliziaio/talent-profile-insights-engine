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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      abbonamenti: {
        Row: {
          azienda_id: string
          created_at: string
          data_inizio: string | null
          data_scadenza: string | null
          id: string
          importo_mensile: number
          note: string | null
          stato: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          azienda_id: string
          created_at?: string
          data_inizio?: string | null
          data_scadenza?: string | null
          id?: string
          importo_mensile?: number
          note?: string | null
          stato?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          azienda_id?: string
          created_at?: string
          data_inizio?: string | null
          data_scadenza?: string | null
          id?: string
          importo_mensile?: number
          note?: string | null
          stato?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "abbonamenti_azienda_id_fkey"
            columns: ["azienda_id"]
            isOneToOne: true
            referencedRelation: "aziende"
            referencedColumns: ["id"]
          },
        ]
      }
      accessi_azienda: {
        Row: {
          attivo: boolean | null
          azienda_id: string
          created_at: string | null
          id: string
          password_hash: string
          updated_at: string | null
          username: string
        }
        Insert: {
          attivo?: boolean | null
          azienda_id: string
          created_at?: string | null
          id?: string
          password_hash: string
          updated_at?: string | null
          username: string
        }
        Update: {
          attivo?: boolean | null
          azienda_id?: string
          created_at?: string | null
          id?: string
          password_hash?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "accessi_azienda_azienda_id_fkey"
            columns: ["azienda_id"]
            isOneToOne: true
            referencedRelation: "aziende"
            referencedColumns: ["id"]
          },
        ]
      }
      analisi_candidato: {
        Row: {
          candidato_id: string
          created_at: string | null
          fit_motivo: string | null
          fit_score: number | null
          fit_verdict: string | null
          generated_at: string | null
          id: string
          profilo_sintetico: string | null
          punti_debolezza: Json | null
          punti_forza: Json | null
          raccomandazione: Json | null
          rischi_operativi: string | null
          updated_at: string | null
        }
        Insert: {
          candidato_id: string
          created_at?: string | null
          fit_motivo?: string | null
          fit_score?: number | null
          fit_verdict?: string | null
          generated_at?: string | null
          id?: string
          profilo_sintetico?: string | null
          punti_debolezza?: Json | null
          punti_forza?: Json | null
          raccomandazione?: Json | null
          rischi_operativi?: string | null
          updated_at?: string | null
        }
        Update: {
          candidato_id?: string
          created_at?: string | null
          fit_motivo?: string | null
          fit_score?: number | null
          fit_verdict?: string | null
          generated_at?: string | null
          id?: string
          profilo_sintetico?: string | null
          punti_debolezza?: Json | null
          punti_forza?: Json | null
          raccomandazione?: Json | null
          rischi_operativi?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analisi_candidato_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: true
            referencedRelation: "candidati"
            referencedColumns: ["id"]
          },
        ]
      }
      aziende: {
        Row: {
          attiva: boolean | null
          created_at: string | null
          email_contatto: string | null
          id: string
          indirizzo: string | null
          logo_url: string | null
          nome: string
          settore: string | null
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          attiva?: boolean | null
          created_at?: string | null
          email_contatto?: string | null
          id?: string
          indirizzo?: string | null
          logo_url?: string | null
          nome: string
          settore?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          attiva?: boolean | null
          created_at?: string | null
          email_contatto?: string | null
          id?: string
          indirizzo?: string | null
          logo_url?: string | null
          nome?: string
          settore?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      candidate_sessions: {
        Row: {
          azienda_id: string
          created_at: string
          expires_at: string
          id: string
          session_token: string
          used: boolean
        }
        Insert: {
          azienda_id: string
          created_at?: string
          expires_at: string
          id?: string
          session_token: string
          used?: boolean
        }
        Update: {
          azienda_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          session_token?: string
          used?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "candidate_sessions_azienda_id_fkey"
            columns: ["azienda_id"]
            isOneToOne: false
            referencedRelation: "aziende"
            referencedColumns: ["id"]
          },
        ]
      }
      candidati: {
        Row: {
          azienda_id: string
          cognome: string
          created_at: string | null
          data_test: string | null
          email: string | null
          eta: number | null
          funzione: string | null
          id: string
          nome: string
          ruolo_attuale: string | null
          sesso: string | null
          telefono: string | null
          test_completato: boolean | null
          test_link_token: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          azienda_id: string
          cognome: string
          created_at?: string | null
          data_test?: string | null
          email?: string | null
          eta?: number | null
          funzione?: string | null
          id?: string
          nome: string
          ruolo_attuale?: string | null
          sesso?: string | null
          telefono?: string | null
          test_completato?: boolean | null
          test_link_token?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          azienda_id?: string
          cognome?: string
          created_at?: string | null
          data_test?: string | null
          email?: string | null
          eta?: number | null
          funzione?: string | null
          id?: string
          nome?: string
          ruolo_attuale?: string | null
          sesso?: string | null
          telefono?: string | null
          test_completato?: boolean | null
          test_link_token?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidati_azienda_id_fkey"
            columns: ["azienda_id"]
            isOneToOne: false
            referencedRelation: "aziende"
            referencedColumns: ["id"]
          },
        ]
      }
      domande: {
        Row: {
          blocco_tematico: number | null
          id: number
          ordine: number | null
          polarita: string
          scala_primaria: string
          scala_secondaria: string | null
          testo: string
        }
        Insert: {
          blocco_tematico?: number | null
          id: number
          ordine?: number | null
          polarita: string
          scala_primaria: string
          scala_secondaria?: string | null
          testo: string
        }
        Update: {
          blocco_tematico?: number | null
          id?: number
          ordine?: number | null
          polarita?: string
          scala_primaria?: string
          scala_secondaria?: string | null
          testo?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          azienda: string | null
          created_at: string
          email: string
          id: string
          nome: string
          num_dipendenti: string | null
        }
        Insert: {
          azienda?: string | null
          created_at?: string
          email: string
          id?: string
          nome: string
          num_dipendenti?: string | null
        }
        Update: {
          azienda?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          num_dipendenti?: string | null
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempted_at: string
          id: string
          identifier: string
        }
        Insert: {
          attempted_at?: string
          id?: string
          identifier: string
        }
        Update: {
          attempted_at?: string
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      pagamenti: {
        Row: {
          abbonamento_id: string
          azienda_id: string
          created_at: string
          data_pagamento: string
          id: string
          importo: number
          metodo: string
          note: string | null
          stato: string
          stripe_payment_id: string | null
        }
        Insert: {
          abbonamento_id: string
          azienda_id: string
          created_at?: string
          data_pagamento?: string
          id?: string
          importo: number
          metodo?: string
          note?: string | null
          stato?: string
          stripe_payment_id?: string | null
        }
        Update: {
          abbonamento_id?: string
          azienda_id?: string
          created_at?: string
          data_pagamento?: string
          id?: string
          importo?: number
          metodo?: string
          note?: string | null
          stato?: string
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagamenti_abbonamento_id_fkey"
            columns: ["abbonamento_id"]
            isOneToOne: false
            referencedRelation: "abbonamenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamenti_azienda_id_fkey"
            columns: ["azienda_id"]
            isOneToOne: false
            referencedRelation: "aziende"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          azienda_id: string | null
          cognome: string | null
          created_at: string | null
          email: string | null
          id: string
          nome: string | null
          ruolo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          azienda_id?: string | null
          cognome?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          ruolo?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          azienda_id?: string | null
          cognome?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          ruolo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_azienda"
            columns: ["azienda_id"]
            isOneToOne: false
            referencedRelation: "aziende"
            referencedColumns: ["id"]
          },
        ]
      }
      profili_candidato: {
        Row: {
          assessment_version: string | null
          avere_pct: number | null
          candidato_id: string
          created_at: string | null
          essere_pct: number | null
          fare_pct: number | null
          id: string
          leadership_pct: number | null
          maturita_pct: number | null
          out_points: Json | null
          potenziale_pct: number | null
          profilo_tipo: string | null
          profilo_tipo_v5: string | null
          reliability_index: string | null
          scale_punteggi: Json | null
          schematicita: number | null
          strength_points: Json | null
          stress_zone: boolean | null
          syndromes_detected: Json | null
          traits_v5: Json | null
          updated_at: string | null
        }
        Insert: {
          assessment_version?: string | null
          avere_pct?: number | null
          candidato_id: string
          created_at?: string | null
          essere_pct?: number | null
          fare_pct?: number | null
          id?: string
          leadership_pct?: number | null
          maturita_pct?: number | null
          out_points?: Json | null
          potenziale_pct?: number | null
          profilo_tipo?: string | null
          profilo_tipo_v5?: string | null
          reliability_index?: string | null
          scale_punteggi?: Json | null
          schematicita?: number | null
          strength_points?: Json | null
          stress_zone?: boolean | null
          syndromes_detected?: Json | null
          traits_v5?: Json | null
          updated_at?: string | null
        }
        Update: {
          assessment_version?: string | null
          avere_pct?: number | null
          candidato_id?: string
          created_at?: string | null
          essere_pct?: number | null
          fare_pct?: number | null
          id?: string
          leadership_pct?: number | null
          maturita_pct?: number | null
          out_points?: Json | null
          potenziale_pct?: number | null
          profilo_tipo?: string | null
          profilo_tipo_v5?: string | null
          reliability_index?: string | null
          scale_punteggi?: Json | null
          schematicita?: number | null
          strength_points?: Json | null
          stress_zone?: boolean | null
          syndromes_detected?: Json | null
          traits_v5?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profili_candidato_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: true
            referencedRelation: "candidati"
            referencedColumns: ["id"]
          },
        ]
      }
      risposte: {
        Row: {
          candidato_id: string
          created_at: string | null
          domanda_id: number
          id: string
          valore: string
        }
        Insert: {
          candidato_id: string
          created_at?: string | null
          domanda_id: number
          id?: string
          valore: string
        }
        Update: {
          candidato_id?: string
          created_at?: string | null
          domanda_id?: number
          id?: string
          valore?: string
        }
        Relationships: [
          {
            foreignKeyName: "risposte_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risposte_domanda_id_fkey"
            columns: ["domanda_id"]
            isOneToOne: false
            referencedRelation: "domande"
            referencedColumns: ["id"]
          },
        ]
      }
      risultati: {
        Row: {
          calculated_at: string | null
          candidato_id: string
          id: string
          punteggio_grezzo: number | null
          punteggio_normalizzato: number | null
          scala: string
        }
        Insert: {
          calculated_at?: string | null
          candidato_id: string
          id?: string
          punteggio_grezzo?: number | null
          punteggio_normalizzato?: number | null
          scala: string
        }
        Update: {
          calculated_at?: string | null
          candidato_id?: string
          id?: string
          punteggio_grezzo?: number | null
          punteggio_normalizzato?: number | null
          scala?: string
        }
        Relationships: [
          {
            foreignKeyName: "risultati_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidati"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_candidate_sessions: { Args: never; Returns: undefined }
      get_user_azienda_id: { Args: { user_uuid: string }; Returns: string }
      get_user_role: { Args: { user_uuid: string }; Returns: string }
      is_superadmin: { Args: { user_uuid: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
