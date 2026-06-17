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
  public: {
    Tables: {
      bookmarks: {
        Row: {
          ayah_number: number
          created_at: string
          id: string
          surah_number: number
          user_id: string
        }
        Insert: {
          ayah_number: number
          created_at?: string
          id?: string
          surah_number: number
          user_id: string
        }
        Update: {
          ayah_number?: number
          created_at?: string
          id?: string
          surah_number?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_flags: {
        Row: {
          active: boolean
          added_by: string | null
          created_at: string
          id: string
          keyword: string
        }
        Insert: {
          active?: boolean
          added_by?: string | null
          created_at?: string
          id?: string
          keyword: string
        }
        Update: {
          active?: boolean
          added_by?: string | null
          created_at?: string
          id?: string
          keyword?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_flags_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_log: {
        Row: {
          action: Database["public"]["Enums"]["mod_action"]
          created_at: string
          id: string
          moderator_id: string
          note: string | null
          report_id: string | null
          target_reflection_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["mod_action"]
          created_at?: string
          id?: string
          moderator_id: string
          note?: string | null
          report_id?: string | null
          target_reflection_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["mod_action"]
          created_at?: string
          id?: string
          moderator_id?: string
          note?: string | null
          report_id?: string | null
          target_reflection_id?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_log_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_log_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_log_target_reflection_id_fkey"
            columns: ["target_reflection_id"]
            isOneToOne: false
            referencedRelation: "reflections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_log_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_survey: {
        Row: {
          background: string | null
          completed_at: string
          primary_goal: string | null
          reflection_style: string | null
          user_id: string
        }
        Insert: {
          background?: string | null
          completed_at?: string
          primary_goal?: string | null
          reflection_style?: string | null
          user_id: string
        }
        Update: {
          background?: string | null
          completed_at?: string
          primary_goal?: string | null
          reflection_style?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_survey_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          banned: boolean
          bio: string | null
          country: string
          created_at: string
          display_name: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          role: Database["public"]["Enums"]["user_role"]
          suspended: boolean
        }
        Insert: {
          banned?: boolean
          bio?: string | null
          country: string
          created_at?: string
          display_name: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          suspended?: boolean
        }
        Update: {
          banned?: boolean
          bio?: string | null
          country?: string
          created_at?: string
          display_name?: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          suspended?: boolean
        }
        Relationships: []
      }
      quran_verses: {
        Row: {
          arabic_text: string
          ayah_number: number
          surah_number: number
          translation_en: string | null
        }
        Insert: {
          arabic_text: string
          ayah_number: number
          surah_number: number
          translation_en?: string | null
        }
        Update: {
          arabic_text?: string
          ayah_number?: number
          surah_number?: number
          translation_en?: string | null
        }
        Relationships: []
      }
      quran_words: {
        Row: {
          arabic_text: string | null
          ayah_number: number
          id: string
          lanes_meaning: string | null
          morphology: Json | null
          mufradat_meaning: string | null
          part_of_speech: string | null
          root: string | null
          surah_number: number
          translation_en: string | null
          transliteration: string | null
          word_position: number
        }
        Insert: {
          arabic_text?: string | null
          ayah_number: number
          id?: string
          lanes_meaning?: string | null
          morphology?: Json | null
          mufradat_meaning?: string | null
          part_of_speech?: string | null
          root?: string | null
          surah_number: number
          translation_en?: string | null
          transliteration?: string | null
          word_position: number
        }
        Update: {
          arabic_text?: string | null
          ayah_number?: number
          id?: string
          lanes_meaning?: string | null
          morphology?: Json | null
          mufradat_meaning?: string | null
          part_of_speech?: string | null
          root?: string | null
          surah_number?: number
          translation_en?: string | null
          transliteration?: string | null
          word_position?: number
        }
        Relationships: []
      }
      reflections: {
        Row: {
          ayah_number: number
          body: string
          created_at: string
          id: string
          is_published: boolean
          privacy: Database["public"]["Enums"]["privacy_level"]
          published_body: string | null
          surah_number: number
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ayah_number: number
          body: string
          created_at?: string
          id?: string
          is_published?: boolean
          privacy?: Database["public"]["Enums"]["privacy_level"]
          published_body?: string | null
          surah_number: number
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ayah_number?: number
          body?: string
          created_at?: string
          id?: string
          is_published?: boolean
          privacy?: Database["public"]["Enums"]["privacy_level"]
          published_body?: string | null
          surah_number?: number
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reflections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          other_text: string | null
          reason: Database["public"]["Enums"]["report_reason"]
          reported_reflection_id: string | null
          reported_user_id: string | null
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          other_text?: string | null
          reason: Database["public"]["Enums"]["report_reason"]
          reported_reflection_id?: string | null
          reported_user_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          created_at?: string
          id?: string
          other_text?: string | null
          reason?: Database["public"]["Enums"]["report_reason"]
          reported_reflection_id?: string | null
          reported_user_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_reflection_id_fkey"
            columns: ["reported_reflection_id"]
            isOneToOne: false
            referencedRelation: "reflections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      violation_counts: {
        Row: {
          banned: boolean
          suspended: boolean
          user_id: string
          valid_report_count: number
        }
        Insert: {
          banned?: boolean
          suspended?: boolean
          user_id: string
          valid_report_count?: number
        }
        Update: {
          banned?: boolean
          suspended?: boolean
          user_id?: string
          valid_report_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "violation_counts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_mod_or_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
    }
    Enums: {
      gender: "male" | "female"
      mod_action: "dismiss" | "remove_content" | "warn" | "suspend" | "ban"
      privacy_level: "private" | "public"
      report_reason:
        | "misuse"
        | "false_info"
        | "opinion_as_verdict"
        | "harassment"
        | "other"
      report_status: "pending" | "dismissed" | "actioned"
      user_role: "user" | "moderator" | "admin"
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
      gender: ["male", "female"],
      mod_action: ["dismiss", "remove_content", "warn", "suspend", "ban"],
      privacy_level: ["private", "public"],
      report_reason: [
        "misuse",
        "false_info",
        "opinion_as_verdict",
        "harassment",
        "other",
      ],
      report_status: ["pending", "dismissed", "actioned"],
      user_role: ["user", "moderator", "admin"],
    },
  },
} as const
