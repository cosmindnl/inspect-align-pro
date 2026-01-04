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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          client_type: Database["public"]["Enums"]["client_type"] | null
          company_id: string
          contact_person: string | null
          county: string | null
          created_at: string | null
          cui: string | null
          deleted_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          client_type?: Database["public"]["Enums"]["client_type"] | null
          company_id: string
          contact_person?: string | null
          county?: string | null
          created_at?: string | null
          cui?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          client_type?: Database["public"]["Enums"]["client_type"] | null
          company_id?: string
          contact_person?: string | null
          county?: string | null
          created_at?: string | null
          cui?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          anre_certificate_number: string | null
          city: string | null
          county: string | null
          created_at: string | null
          cui: string | null
          deleted_at: string | null
          email: string | null
          id: string
          is_anre_certified: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          registration_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          anre_certificate_number?: string | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          cui?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_anre_certified?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          registration_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          anre_certificate_number?: string | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          cui?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_anre_certified?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          registration_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      engineers: {
        Row: {
          anre_certificate_number: string | null
          anre_certificate_type: string | null
          certificate_expiry_date: string | null
          company_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          profile_id: string | null
          signature_url: string | null
          specializations: Json | null
          updated_at: string | null
        }
        Insert: {
          anre_certificate_number?: string | null
          anre_certificate_type?: string | null
          certificate_expiry_date?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          profile_id?: string | null
          signature_url?: string | null
          specializations?: Json | null
          updated_at?: string | null
        }
        Update: {
          anre_certificate_number?: string | null
          anre_certificate_type?: string | null
          certificate_expiry_date?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          profile_id?: string | null
          signature_url?: string | null
          specializations?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engineers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          category: string | null
          certificate_url: string | null
          company_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          manufacturer: string | null
          model: string | null
          name: string
          notes: string | null
          serial_number: string | null
          updated_at: string | null
          verification_certificate_number: string | null
          verification_valid_until: string | null
        }
        Insert: {
          category?: string | null
          certificate_url?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          model?: string | null
          name: string
          notes?: string | null
          serial_number?: string | null
          updated_at?: string | null
          verification_certificate_number?: string | null
          verification_valid_until?: string | null
        }
        Update: {
          category?: string | null
          certificate_url?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          serial_number?: string | null
          updated_at?: string | null
          verification_certificate_number?: string | null
          verification_valid_until?: string | null
        }
        Relationships: []
      }
      measurements: {
        Row: {
          created_at: string | null
          equipment_used: string | null
          id: string
          is_conformant: boolean | null
          limit_value: number | null
          location_description: string | null
          measured_at: string | null
          measurement_method: string | null
          measurement_type: string
          report_id: string
          unit: string | null
          value: number | null
        }
        Insert: {
          created_at?: string | null
          equipment_used?: string | null
          id?: string
          is_conformant?: boolean | null
          limit_value?: number | null
          location_description?: string | null
          measured_at?: string | null
          measurement_method?: string | null
          measurement_type: string
          report_id: string
          unit?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string | null
          equipment_used?: string | null
          id?: string
          is_conformant?: boolean | null
          limit_value?: number | null
          location_description?: string | null
          measured_at?: string | null
          measurement_method?: string | null
          measurement_type?: string
          report_id?: string
          unit?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "measurements_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      report_files: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          report_id: string
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          report_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_files_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          ambient_temperature: number | null
          conformity: Database["public"]["Enums"]["conformity_status"] | null
          created_at: string | null
          deleted_at: string | null
          engineer_id: string | null
          id: string
          inspection_date: string | null
          metadata: Json | null
          observations: string | null
          recommendations: string | null
          report_number: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          signed_at: string | null
          site_id: string
          status: Database["public"]["Enums"]["report_status"] | null
          updated_at: string | null
          validated_at: string | null
          weather_conditions: string | null
        }
        Insert: {
          ambient_temperature?: number | null
          conformity?: Database["public"]["Enums"]["conformity_status"] | null
          created_at?: string | null
          deleted_at?: string | null
          engineer_id?: string | null
          id?: string
          inspection_date?: string | null
          metadata?: Json | null
          observations?: string | null
          recommendations?: string | null
          report_number?: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          signed_at?: string | null
          site_id: string
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
          validated_at?: string | null
          weather_conditions?: string | null
        }
        Update: {
          ambient_temperature?: number | null
          conformity?: Database["public"]["Enums"]["conformity_status"] | null
          created_at?: string | null
          deleted_at?: string | null
          engineer_id?: string | null
          id?: string
          inspection_date?: string | null
          metadata?: Json | null
          observations?: string | null
          recommendations?: string | null
          report_number?: string | null
          report_type?: Database["public"]["Enums"]["report_type"]
          signed_at?: string | null
          site_id?: string
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
          validated_at?: string | null
          weather_conditions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "engineers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          address: string | null
          city: string | null
          client_id: string
          coordinates: unknown
          county: string | null
          created_at: string | null
          id: string
          installation_type:
            | Database["public"]["Enums"]["installation_type"]
            | null
          name: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          client_id: string
          coordinates?: unknown
          county?: string | null
          created_at?: string | null
          id?: string
          installation_type?:
            | Database["public"]["Enums"]["installation_type"]
            | null
          name: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          client_id?: string
          coordinates?: unknown
          county?: string | null
          created_at?: string | null
          id?: string
          installation_type?:
            | Database["public"]["Enums"]["installation_type"]
            | null
          name?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "engineer" | "viewer"
      client_type: "company" | "individual"
      conformity_status: "conformant" | "nonconformant"
      installation_type:
        | "industrial"
        | "residential"
        | "commercial"
        | "photovoltaic"
      report_status: "draft" | "validated" | "signed" | "archived"
      report_type: "ground" | "electrical" | "solar"
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
      app_role: ["admin", "engineer", "viewer"],
      client_type: ["company", "individual"],
      conformity_status: ["conformant", "nonconformant"],
      installation_type: [
        "industrial",
        "residential",
        "commercial",
        "photovoltaic",
      ],
      report_status: ["draft", "validated", "signed", "archived"],
      report_type: ["ground", "electrical", "solar"],
    },
  },
} as const
