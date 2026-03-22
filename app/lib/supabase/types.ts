export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RankTier =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          total_xp: number | null;
          current_streak: number | null;
          longest_streak: number | null;
          lastactivedate: string | null;
          pi_score: number | null;
          ranktier: RankTier | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          total_xp?: number | null;
          current_streak?: number | null;
          longest_streak?: number | null;
          lastactivedate?: string | null;
          pi_score?: number | null;
          ranktier?: RankTier | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string | null;
          sessionmode: "quick" | "deep" | null;
          score: number;
          max_score: number;
          normalized_score: number;
          score_band: string | null;
          dimension_scores: Json | null;
          strengths: Json | null;
          weakest_area: string | null;
          answers: Json | null;
          question_order: Json | null;
          timetakenseconds: number | null;
          xp_earned: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          sessionmode?: "quick" | "deep" | null;
          score: number;
          max_score: number;
          normalized_score: number;
          score_band?: string | null;
          dimension_scores?: Json | null;
          strengths?: Json | null;
          weakest_area?: string | null;
          answers?: Json | null;
          question_order?: Json | null;
          timetakenseconds?: number | null;
          xp_earned?: number | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["quiz_attempts"]["Insert"]>;
        Relationships: [];
      };
      arena_attempts: {
        Row: {
          id: string;
          user_id: string | null;
          sessionmode: "daily" | "avid" | null;
          thinking_profile: string | null;
          agree_count: number | null;
          disagree_count: number | null;
          depends_count: number | null;
          stance_mix: Json | null;
          responses: Json | null;
          xp_earned: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          sessionmode?: "daily" | "avid" | null;
          thinking_profile?: string | null;
          agree_count?: number | null;
          disagree_count?: number | null;
          depends_count?: number | null;
          stance_mix?: Json | null;
          responses?: Json | null;
          xp_earned?: number | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["arena_attempts"]["Insert"]>;
        Relationships: [];
      };
      email_captures: {
        Row: {
          id: string;
          email: string;
          source_page: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          source_page?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["email_captures"]["Insert"]>;
        Relationships: [];
      };
      shared_results: {
        Row: {
          id: string;
          user_id: string | null;
          resulttype: "quiz" | "arena" | null;
          score: number | null;
          score_band: string | null;
          display_name: string | null;
          dimension_scores: Json | null;
          thinking_profile: string | null;
          stance_data: Json | null;
          shareimageurl: string | null;
          views: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          resulttype?: "quiz" | "arena" | null;
          score?: number | null;
          score_band?: string | null;
          display_name?: string | null;
          dimension_scores?: Json | null;
          thinking_profile?: string | null;
          stance_data?: Json | null;
          shareimageurl?: string | null;
          views?: number | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["shared_results"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type QuizAttemptInsert =
  Database["public"]["Tables"]["quiz_attempts"]["Insert"];
export type ArenaAttemptInsert =
  Database["public"]["Tables"]["arena_attempts"]["Insert"];
export type SharedResultRow =
  Database["public"]["Tables"]["shared_results"]["Row"];
export type SharedResultInsert =
  Database["public"]["Tables"]["shared_results"]["Insert"];
