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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          criteria: Json
          description: string
          icon_name: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          criteria?: Json
          description?: string
          icon_name?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          criteria?: Json
          description?: string
          icon_name?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          icon_name: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon_name?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon_name?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      community_groups: {
        Row: {
          avg_completion: number
          created_at: string
          id: string
          learners: number
          location: string
          name: string
          trainer_id: string | null
        }
        Insert: {
          avg_completion?: number
          created_at?: string
          id?: string
          learners?: number
          location: string
          name: string
          trainer_id?: string | null
        }
        Update: {
          avg_completion?: number
          created_at?: string
          id?: string
          learners?: number
          location?: string
          name?: string
          trainer_id?: string | null
        }
        Relationships: []
      }
      consent_records: {
        Row: {
          details: Json
          granted: boolean
          granted_at: string
          id: string
          ip_hash: string | null
          type: string
          user_id: string | null
          version: string
        }
        Insert: {
          details?: Json
          granted?: boolean
          granted_at?: string
          id?: string
          ip_hash?: string | null
          type: string
          user_id?: string | null
          version?: string
        }
        Update: {
          details?: Json
          granted?: boolean
          granted_at?: string
          id?: string
          ip_hash?: string | null
          type?: string
          user_id?: string | null
          version?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read?: boolean
        }
        Relationships: []
      }
      courses: {
        Row: {
          category_id: string | null
          created_at: string
          description: string
          difficulty: string
          estimated_hours: number
          icon_name: string
          id: string
          image_url: string | null
          is_published: boolean
          outcomes: Json
          slug: string
          sort_order: number
          tagline: string
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string
          difficulty?: string
          estimated_hours?: number
          icon_name?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          outcomes?: Json
          slug: string
          sort_order?: number
          tagline?: string
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string
          difficulty?: string
          estimated_hours?: number
          icon_name?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          outcomes?: Json
          slug?: string
          sort_order?: number
          tagline?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      data_requests: {
        Row: {
          created_at: string
          id: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          id: string
          is_published: boolean
          question: string
          sort_order: number
        }
        Insert: {
          answer: string
          id?: string
          is_published?: boolean
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          id?: string
          is_published?: boolean
          question?: string
          sort_order?: number
        }
        Relationships: []
      }
      i18n_strings: {
        Row: {
          key: string
          lang: string
          value: string
        }
        Insert: {
          key: string
          lang: string
          value: string
        }
        Update: {
          key?: string
          lang?: string
          value?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          body_richtext: string
          course_id: string
          created_at: string
          id: string
          image_url: string | null
          is_published: boolean
          key_points: Json
          slug: string
          sort_order: number
          svg_motif: string | null
          title: string
          try_it_action: string | null
          type: string
        }
        Insert: {
          body_richtext?: string
          course_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          key_points?: Json
          slug: string
          sort_order?: number
          svg_motif?: string | null
          title: string
          try_it_action?: string | null
          type?: string
        }
        Update: {
          body_richtext?: string
          course_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          key_points?: Json
          slug?: string
          sort_order?: number
          svg_motif?: string | null
          title?: string
          try_it_action?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          consented_at: string
          email: string
          id: string
          unsubscribed_at: string | null
        }
        Insert: {
          consented_at?: string
          email: string
          id?: string
          unsubscribed_at?: string | null
        }
        Update: {
          consented_at?: string
          email?: string
          id?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          category: string
          created_at: string
          id: string
          is_published: boolean
          name: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_published?: boolean
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_published?: boolean
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          anonymized: boolean
          created_at: string
          district: string | null
          full_name: string
          id: string
          language_pref: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          anonymized?: boolean
          created_at?: string
          district?: string | null
          full_name?: string
          id: string
          language_pref?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          anonymized?: boolean
          created_at?: string
          district?: string | null
          full_name?: string
          id?: string
          language_pref?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_index: number
          explanation: string
          id: string
          lesson_id: string
          options: Json
          question: string
          sort_order: number
        }
        Insert: {
          correct_index?: number
          explanation?: string
          id?: string
          lesson_id: string
          options?: Json
          question: string
          sort_order?: number
        }
        Update: {
          correct_index?: number
          explanation?: string
          id?: string
          lesson_id?: string
          options?: Json
          question?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          audience: string
          created_at: string
          file_url: string
          id: string
          is_published: boolean
          title: string
          type: string
        }
        Insert: {
          audience?: string
          created_at?: string
          file_url?: string
          id?: string
          is_published?: boolean
          title: string
          type?: string
        }
        Update: {
          audience?: string
          created_at?: string
          file_url?: string
          id?: string
          is_published?: boolean
          title?: string
          type?: string
        }
        Relationships: []
      }
      site_pages: {
        Row: {
          body: Json
          hero_subline: string
          hero_title: string
          is_published: boolean
          slug: string
          updated_at: string
        }
        Insert: {
          body?: Json
          hero_subline?: string
          hero_title?: string
          is_published?: boolean
          slug: string
          updated_at?: string
        }
        Update: {
          body?: Json
          hero_subline?: string
          hero_title?: string
          is_published?: boolean
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      stats: {
        Row: {
          id: string
          label: string
          sort_order: number
          value: string
        }
        Insert: {
          id?: string
          label: string
          sort_order?: number
          value: string
        }
        Update: {
          id?: string
          label?: string
          sort_order?: number
          value?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          name: string
          quote: string
          role_location: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          name: string
          quote: string
          role_location?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          name?: string
          quote?: string
          role_location?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workshop_requests: {
        Row: {
          created_at: string
          date: string
          expected_learners: number
          id: string
          status: string
          topic: string
          trainer_id: string
          venue: string
        }
        Insert: {
          created_at?: string
          date: string
          expected_learners?: number
          id?: string
          status?: string
          topic: string
          trainer_id: string
          venue: string
        }
        Update: {
          created_at?: string
          date?: string
          expected_learners?: number
          id?: string
          status?: string
          topic?: string
          trainer_id?: string
          venue?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      claim_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      request_trainer_role: { Args: never; Returns: undefined }
      set_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "learner" | "trainer" | "editor" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["learner", "trainer", "editor", "admin"],
    },
  },
} as const
