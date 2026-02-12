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
      analysis_results: {
        Row: {
          analyzed_at: string
          field_category: string
          id: string
          improvement_tips: Json
          job_matches: Json
          overall_score: number
          resume_id: string
          skills: Json
          strengths: Json | null
          suggested_changes: Json | null
          user_id: string
          weaknesses: Json | null
        }
        Insert: {
          analyzed_at?: string
          field_category: string
          id?: string
          improvement_tips: Json
          job_matches: Json
          overall_score: number
          resume_id: string
          skills: Json
          strengths?: Json | null
          suggested_changes?: Json | null
          user_id: string
          weaknesses?: Json | null
        }
        Update: {
          analyzed_at?: string
          field_category?: string
          id?: string
          improvement_tips?: Json
          job_matches?: Json
          overall_score?: number
          resume_id?: string
          skills?: Json
          strengths?: Json | null
          suggested_changes?: Json | null
          user_id?: string
          weaknesses?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_results_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          ai_reasoning: string | null
          ai_score: number | null
          analyzed_at: string | null
          candidate_email: string | null
          candidate_name: string | null
          created_at: string
          education: string | null
          experience_match_percentage: number | null
          file_name: string
          fit_category: string | null
          id: string
          job_id: string
          parsed_skills: Json | null
          resume_content: string
          skill_match_percentage: number | null
          user_id: string
          years_experience: number | null
        }
        Insert: {
          ai_reasoning?: string | null
          ai_score?: number | null
          analyzed_at?: string | null
          candidate_email?: string | null
          candidate_name?: string | null
          created_at?: string
          education?: string | null
          experience_match_percentage?: number | null
          file_name: string
          fit_category?: string | null
          id?: string
          job_id: string
          parsed_skills?: Json | null
          resume_content: string
          skill_match_percentage?: number | null
          user_id: string
          years_experience?: number | null
        }
        Update: {
          ai_reasoning?: string | null
          ai_score?: number | null
          analyzed_at?: string | null
          candidate_email?: string | null
          candidate_name?: string | null
          created_at?: string
          education?: string | null
          experience_match_percentage?: number | null
          file_name?: string
          fit_category?: string | null
          id?: string
          job_id?: string
          parsed_skills?: Json | null
          resume_content?: string
          skill_match_percentage?: number | null
          user_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "hiring_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      hiring_jobs: {
        Row: {
          company_name: string
          created_at: string
          cultural_priorities: Json | null
          deal_breakers: Json | null
          education_requirements: string | null
          id: string
          industry: string | null
          job_title: string
          location: string | null
          nice_to_have_skills: Json | null
          remote_allowed: boolean | null
          required_skills: Json | null
          salary_max: number | null
          salary_min: number | null
          seniority_level: string | null
          updated_at: string
          user_id: string
          years_experience_max: number | null
          years_experience_min: number | null
        }
        Insert: {
          company_name: string
          created_at?: string
          cultural_priorities?: Json | null
          deal_breakers?: Json | null
          education_requirements?: string | null
          id?: string
          industry?: string | null
          job_title: string
          location?: string | null
          nice_to_have_skills?: Json | null
          remote_allowed?: boolean | null
          required_skills?: Json | null
          salary_max?: number | null
          salary_min?: number | null
          seniority_level?: string | null
          updated_at?: string
          user_id: string
          years_experience_max?: number | null
          years_experience_min?: number | null
        }
        Update: {
          company_name?: string
          created_at?: string
          cultural_priorities?: Json | null
          deal_breakers?: Json | null
          education_requirements?: string | null
          id?: string
          industry?: string | null
          job_title?: string
          location?: string | null
          nice_to_have_skills?: Json | null
          remote_allowed?: boolean | null
          required_skills?: Json | null
          salary_max?: number | null
          salary_min?: number | null
          seniority_level?: string | null
          updated_at?: string
          user_id?: string
          years_experience_max?: number | null
          years_experience_min?: number | null
        }
        Relationships: []
      }
      interviews: {
        Row: {
          candidate_id: string
          created_at: string
          duration_minutes: number
          id: string
          interview_type: string
          job_id: string
          location: string | null
          notes: string | null
          scheduled_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          interview_type?: string
          job_id: string
          location?: string | null
          notes?: string | null
          scheduled_at: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          interview_type?: string
          job_id?: string
          location?: string | null
          notes?: string | null
          scheduled_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "hiring_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          subscription_expires_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          user_mode: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          subscription_expires_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          user_mode?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          subscription_expires_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          user_mode?: string | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          file_content: string
          file_name: string
          file_type: string
          id: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          file_content: string
          file_name: string
          file_type: string
          id?: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          file_content?: string
          file_name?: string
          file_type?: string
          id?: string
          uploaded_at?: string
          user_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_upload_limit: { Args: { user_id_param: string }; Returns: number }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
