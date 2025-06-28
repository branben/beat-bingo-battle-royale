export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      beat_submissions: {
        Row: {
          audio_url: string | null
          genre: string
          id: string
          is_ready: boolean | null
          match_id: string | null
          player_id: string | null
          submitted_at: string | null
        }
        Insert: {
          audio_url?: string | null
          genre: string
          id?: string
          is_ready?: boolean | null
          match_id?: string | null
          player_id?: string | null
          submitted_at?: string | null
        }
        Update: {
          audio_url?: string | null
          genre?: string
          id?: string
          is_ready?: boolean | null
          match_id?: string | null
          player_id?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beat_submissions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beat_submissions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      bingo_cards: {
        Row: {
          created_at: string | null
          id: string
          marked: Json
          match_id: string | null
          player_id: string | null
          squares: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          marked: Json
          match_id?: string | null
          player_id?: string | null
          squares: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          marked?: Json
          match_id?: string | null
          player_id?: string | null
          squares?: Json
        }
        Relationships: [
          {
            foreignKeyName: "bingo_cards_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bingo_cards_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      match_spectators: {
        Row: {
          id: string
          joined_at: string | null
          match_id: string | null
          player_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          match_id?: string | null
          player_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          match_id?: string | null
          player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_spectators_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_spectators_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          called_genres: string[] | null
          created_at: string | null
          handicaps_used: Json | null
          id: string
          player1: string | null
          player2: string | null
          winner_id: string | null
        }
        Insert: {
          called_genres?: string[] | null
          created_at?: string | null
          handicaps_used?: Json | null
          id?: string
          player1?: string | null
          player2?: string | null
          winner_id?: string | null
        }
        Update: {
          called_genres?: string[] | null
          created_at?: string | null
          handicaps_used?: Json | null
          id?: string
          player1?: string | null
          player2?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_player1_fkey"
            columns: ["player1"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_player2_fkey"
            columns: ["player2"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      matchmaking: {
        Row: {
          created_at: string | null
          discord_id: string
          id: string
          role: string
          username: string
        }
        Insert: {
          created_at?: string | null
          discord_id: string
          id?: string
          role: string
          username: string
        }
        Update: {
          created_at?: string | null
          discord_id?: string
          id?: string
          role?: string
          username?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          coins: number | null
          competitor_elo: number | null
          correct_votes: number | null
          created_at: string | null
          discord_id: string | null
          id: string
          losses: number | null
          spectator_elo: number | null
          username: string
          wins: number | null
        }
        Insert: {
          coins?: number | null
          competitor_elo?: number | null
          correct_votes?: number | null
          created_at?: string | null
          discord_id?: string | null
          id?: string
          losses?: number | null
          spectator_elo?: number | null
          username: string
          wins?: number | null
        }
        Update: {
          coins?: number | null
          competitor_elo?: number | null
          correct_votes?: number | null
          created_at?: string | null
          discord_id?: string | null
          id?: string
          losses?: number | null
          spectator_elo?: number | null
          username?: string
          wins?: number | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string | null
          id: string
          match_id: string | null
          spectator_id: string | null
          vote_power: number | null
          voted_player_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id?: string | null
          spectator_id?: string | null
          vote_power?: number | null
          voted_player_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string | null
          spectator_id?: string | null
          vote_power?: number | null
          voted_player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_spectator_id_fkey"
            columns: ["spectator_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_voted_player_id_fkey"
            columns: ["voted_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
