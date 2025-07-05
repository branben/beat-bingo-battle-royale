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
      audio_submissions: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number
          file_name: string
          file_path: string
          file_size: number
          genre: string
          id: string
          match_id: string
          mime_type: string
          processing_status: string | null
          round_number: number
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds: number
          file_name: string
          file_path: string
          file_size: number
          genre: string
          id?: string
          match_id: string
          mime_type: string
          processing_status?: string | null
          round_number: number
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number
          file_name?: string
          file_path?: string
          file_size?: number
          genre?: string
          id?: string
          match_id?: string
          mime_type?: string
          processing_status?: string | null
          round_number?: number
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_submissions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_spectators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
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
            foreignKeyName: "bingo_cards_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      handicaps: {
        Row: {
          cost_coins: number
          created_at: string
          duration_rounds: number | null
          effects: Json
          handicap_type: string
          id: string
          match_id: string
          round_applied: number | null
          status: string | null
          target_user_id: string | null
          user_id: string
        }
        Insert: {
          cost_coins: number
          created_at?: string
          duration_rounds?: number | null
          effects: Json
          handicap_type: string
          id?: string
          match_id: string
          round_applied?: number | null
          status?: string | null
          target_user_id?: string | null
          user_id: string
        }
        Update: {
          cost_coins?: number
          created_at?: string
          duration_rounds?: number | null
          effects?: Json
          handicap_type?: string
          id?: string
          match_id?: string
          round_applied?: number | null
          status?: string | null
          target_user_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "handicaps_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handicaps_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handicaps_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_spectators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handicaps_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handicaps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handicaps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_spectators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handicaps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
          called_genres: Json | null
          created_at: string
          current_genre: string | null
          current_round: number | null
          discord_channel_id: string | null
          discord_guild_id: string | null
          id: string
          match_duration_seconds: number | null
          match_number: number
          player1_card: Json | null
          player1_id: string | null
          player2_card: Json | null
          player2_id: string | null
          round_start_time: string | null
          spectator_count: number | null
          status: string | null
          total_rounds: number | null
          updated_at: string
          voting_deadline: string | null
          winner_id: string | null
        }
        Insert: {
          called_genres?: Json | null
          created_at?: string
          current_genre?: string | null
          current_round?: number | null
          discord_channel_id?: string | null
          discord_guild_id?: string | null
          id?: string
          match_duration_seconds?: number | null
          match_number?: never
          player1_card?: Json | null
          player1_id?: string | null
          player2_card?: Json | null
          player2_id?: string | null
          round_start_time?: string | null
          spectator_count?: number | null
          status?: string | null
          total_rounds?: number | null
          updated_at?: string
          voting_deadline?: string | null
          winner_id?: string | null
        }
        Update: {
          called_genres?: Json | null
          created_at?: string
          current_genre?: string | null
          current_round?: number | null
          discord_channel_id?: string | null
          discord_guild_id?: string | null
          id?: string
          match_duration_seconds?: number | null
          match_number?: never
          player1_card?: Json | null
          player1_id?: string | null
          player2_card?: Json | null
          player2_id?: string | null
          round_start_time?: string | null
          spectator_count?: number | null
          status?: string | null
          total_rounds?: number | null
          updated_at?: string
          voting_deadline?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_spectators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_spectators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_spectators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      rls_test: {
        Row: {
          data: string | null
          id: number
          user_id: string | null
        }
        Insert: {
          data?: string | null
          id?: number
          user_id?: string | null
        }
        Update: {
          data?: string | null
          id?: number
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          coins: number | null
          competitor_elo: number | null
          created_at: string
          discord_avatar: string | null
          discord_id: string | null
          discord_username: string | null
          display_name: string | null
          games_played: number | null
          games_won: number | null
          id: string
          is_active: boolean | null
          last_seen: string | null
          rounds_won: number | null
          spectator_elo: number | null
          total_votes_cast: number | null
          total_votes_received: number | null
          updated_at: string
          username: string
        }
        Insert: {
          coins?: number | null
          competitor_elo?: number | null
          created_at?: string
          discord_avatar?: string | null
          discord_id?: string | null
          discord_username?: string | null
          display_name?: string | null
          games_played?: number | null
          games_won?: number | null
          id?: string
          is_active?: boolean | null
          last_seen?: string | null
          rounds_won?: number | null
          spectator_elo?: number | null
          total_votes_cast?: number | null
          total_votes_received?: number | null
          updated_at?: string
          username: string
        }
        Update: {
          coins?: number | null
          competitor_elo?: number | null
          created_at?: string
          discord_avatar?: string | null
          discord_id?: string | null
          discord_username?: string | null
          display_name?: string | null
          games_played?: number | null
          games_won?: number | null
          id?: string
          is_active?: boolean | null
          last_seen?: string | null
          rounds_won?: number | null
          spectator_elo?: number | null
          total_votes_cast?: number | null
          total_votes_received?: number | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          id: string
          match_id: string
          round_number: number
          vote_power: number
          voted_for_id: string
          voter_id: string
          voter_spectator_elo: number
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          round_number: number
          vote_power?: number
          voted_for_id: string
          voter_id: string
          voter_spectator_elo: number
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          round_number?: number
          vote_power?: number
          voted_for_id?: string
          voter_id?: string
          voter_spectator_elo?: number
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
            foreignKeyName: "votes_voted_for_id_fkey"
            columns: ["voted_for_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_voted_for_id_fkey"
            columns: ["voted_for_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_spectators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_voted_for_id_fkey"
            columns: ["voted_for_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_spectators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard_competitors: {
        Row: {
          coins: number | null
          competitor_elo: number | null
          discord_username: string | null
          display_name: string | null
          games_played: number | null
          games_won: number | null
          id: string | null
          rank: string | null
          rank_position: number | null
          rounds_won: number | null
          username: string | null
          win_percentage: number | null
        }
        Relationships: []
      }
      leaderboard_spectators: {
        Row: {
          accuracy_percentage: number | null
          coins: number | null
          discord_username: string | null
          display_name: string | null
          id: string | null
          rank_position: number | null
          spectator_elo: number | null
          total_votes_cast: number | null
          username: string | null
          vote_power: number | null
        }
        Relationships: []
      }
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
