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
      background_jobs: {
        Row: {
          account_id: string | null
          completed_at: string | null
          created_at: string
          error: string | null
          id: string
          metadata: Json | null
          next_run_at: string | null
          schedule: string | null
          started_at: string | null
          status: string
          type: string
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          metadata?: Json | null
          next_run_at?: string | null
          schedule?: string | null
          started_at?: string | null
          status?: string
          type: string
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          metadata?: Json | null
          next_run_at?: string | null
          schedule?: string | null
          started_at?: string | null
          status?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "background_jobs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "email_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      email_accounts: {
        Row: {
          access_token: string | null
          auth_type: string
          created_at: string
          email: string
          host: string | null
          id: string
          last_synced: string | null
          password: string | null
          port: number | null
          provider: string
          refresh_token: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_username: string | null
          sync_interval_minutes: number | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          access_token?: string | null
          auth_type: string
          created_at?: string
          email: string
          host?: string | null
          id?: string
          last_synced?: string | null
          password?: string | null
          port?: number | null
          provider: string
          refresh_token?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          sync_interval_minutes?: number | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          access_token?: string | null
          auth_type?: string
          created_at?: string
          email?: string
          host?: string | null
          id?: string
          last_synced?: string | null
          password?: string | null
          port?: number | null
          provider?: string
          refresh_token?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          sync_interval_minutes?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      email_folders: {
        Row: {
          account_id: string
          created_at: string
          email_count: number | null
          id: string
          name: string
          path: string
          type: string
          unread_count: number | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          created_at?: string
          email_count?: number | null
          id?: string
          name: string
          path: string
          type: string
          unread_count?: number | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string
          email_count?: number | null
          id?: string
          name?: string
          path?: string
          type?: string
          unread_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_folders_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "email_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          account_id: string | null
          archived: boolean | null
          content: string | null
          created_at: string | null
          date: string
          deleted: boolean | null
          external_id: string
          flagged: boolean | null
          folder_id: string | null
          from_email: string
          from_name: string | null
          id: string
          preview: string | null
          read: boolean | null
          status: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          archived?: boolean | null
          content?: string | null
          created_at?: string | null
          date: string
          deleted?: boolean | null
          external_id: string
          flagged?: boolean | null
          folder_id?: string | null
          from_email: string
          from_name?: string | null
          id?: string
          preview?: string | null
          read?: boolean | null
          status?: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          archived?: boolean | null
          content?: string | null
          created_at?: string | null
          date?: string
          deleted?: boolean | null
          external_id?: string
          flagged?: boolean | null
          folder_id?: string | null
          from_email?: string
          from_name?: string | null
          id?: string
          preview?: string | null
          read?: boolean | null
          status?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emails_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "email_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emails_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "email_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_configurations: {
        Row: {
          client_id: string | null
          client_secret: string | null
          created_at: string
          id: string
          provider: string
          redirect_uri: string | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          id?: string
          provider: string
          redirect_uri?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          id?: string
          provider?: string
          redirect_uri?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      oauth_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          id: string
          provider: string
          refresh_token: string | null
          scope: string | null
          token_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          id?: string
          provider: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          created_at: string
          id: string
          level: string
          message: string
          metadata: Json | null
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          level: string
          message: string
          metadata?: Json | null
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          level?: string
          message?: string
          metadata?: Json | null
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_admin_relationships: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          role: string
          user_id: string
        }
        Update: {
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_admin_and_link_users: {
        Args: { target_user_id: string; users_to_link: string[] }
        Returns: Json
      }
      schedule_email_sync: {
        Args: { p_account_id: string; p_schedule?: string }
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
