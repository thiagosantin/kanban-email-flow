import { Database as GeneratedDatabase } from '@/integrations/supabase/types';

// Extend the generated database types with our custom tables
export interface Database extends Omit<GeneratedDatabase, 'public'> {
  public: {
    Tables: {
      email_accounts: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          email: string;
          auth_type: 'oauth2' | 'imap' | 'pop3';
          host: string | null;
          port: number | null;
          username: string | null;
          password: string | null;
          smtp_host: string | null;
          smtp_port: number | null;
          smtp_username: string | null;
          smtp_password: string | null;
          access_token: string | null;
          refresh_token: string | null;
          sync_interval_minutes: number | null;
          last_synced: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          email: string;
          auth_type: 'oauth2' | 'imap' | 'pop3';
          host?: string | null;
          port?: number | null;
          username?: string | null;
          password?: string | null;
          smtp_host?: string | null;
          smtp_port?: number | null;
          smtp_username?: string | null;
          smtp_password?: string | null;
          access_token?: string | null;
          refresh_token?: string | null;
          sync_interval_minutes?: number | null;
          last_synced?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          email?: string;
          auth_type?: 'oauth2' | 'imap' | 'pop3';
          host?: string | null;
          port?: number | null;
          username?: string | null;
          password?: string | null;
          smtp_host?: string | null;
          smtp_port?: number | null;
          smtp_username?: string | null;
          smtp_password?: string | null;
          access_token?: string | null;
          refresh_token?: string | null;
          sync_interval_minutes?: number | null;
          last_synced?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      email_folders: {
        Row: {
          id: string;
          account_id: string;
          name: string;
          path: string;
          type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'archive' | 'custom';
          email_count: number | null;
          unread_count: number | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          account_id: string;
          name: string;
          path: string;
          type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'archive' | 'custom';
          email_count?: number | null;
          unread_count?: number | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          account_id?: string;
          name?: string;
          path?: string;
          type?: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'archive' | 'custom';
          email_count?: number | null;
          unread_count?: number | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      emails: {
        Row: {
          id: string;
          account_id: string | null;
          folder_id: string | null;
          status: 'inbox' | 'awaiting' | 'processing' | 'done';
          subject: string;
          from_email: string;
          from_name: string | null;
          date: string;
          preview: string | null;
          content: string | null;
          read: boolean | null;
          flagged: boolean | null;
          archived: boolean | null;
          deleted: boolean | null;
          external_id: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          account_id?: string | null;
          folder_id?: string | null;
          status: 'inbox' | 'awaiting' | 'processing' | 'done';
          subject: string;
          from_email: string;
          from_name?: string | null;
          date: string;
          preview?: string | null;
          content?: string | null;
          read?: boolean | null;
          flagged?: boolean | null;
          archived?: boolean | null;
          deleted?: boolean | null;
          external_id: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          account_id?: string | null;
          folder_id?: string | null;
          status?: 'inbox' | 'awaiting' | 'processing' | 'done';
          subject?: string;
          from_email?: string;
          from_name?: string | null;
          date?: string;
          preview?: string | null;
          content?: string | null;
          read?: boolean | null;
          flagged?: boolean | null;
          archived?: boolean | null;
          deleted?: boolean | null;
          external_id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      background_jobs: {
        Row: {
          id: string;
          type: 'email_sync' | 'report_generation' | 'cleanup' | 'background_task';
          status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
          created_at: string;
          started_at: string | null;
          completed_at: string | null;
          error: string | null;
          metadata: Record<string, any>;
          account_id: string | null;
          user_id: string | null;
          next_run_at: string | null;
          schedule: string | null;
        };
        Insert: {
          id?: string;
          type: 'email_sync' | 'report_generation' | 'cleanup' | 'background_task';
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          error?: string | null;
          metadata?: Record<string, any>;
          account_id?: string | null;
          user_id?: string | null;
          next_run_at?: string | null;
          schedule?: string | null;
        };
        Update: {
          id?: string;
          type?: 'email_sync' | 'report_generation' | 'cleanup' | 'background_task';
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          error?: string | null;
          metadata?: Record<string, any>;
          account_id?: string | null;
          user_id?: string | null;
          next_run_at?: string | null;
          schedule?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "background_jobs_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "email_accounts";
            referencedColumns: ["id"];
          }
        ];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
        };
        Relationships: [];
      };
      user_admin_relationships: {
        Row: {
          id: string;
          admin_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      oauth_configurations: {
        Row: {
          id: string;
          provider: string;
          client_id: string | null;
          client_secret: string | null;
          redirect_uri: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider: string;
          client_id?: string | null;
          client_secret?: string | null;
          redirect_uri?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider?: string;
          client_id?: string | null;
          client_secret?: string | null;
          redirect_uri?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      system_logs: {
        Row: {
          id: string;
          level: 'info' | 'warning' | 'error' | 'debug';
          message: string;
          metadata: Record<string, any> | null;
          source: string | null;
          created_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          level: 'info' | 'warning' | 'error' | 'debug';
          message: string;
          metadata?: Record<string, any> | null;
          source?: string | null;
          created_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          level?: 'info' | 'warning' | 'error' | 'debug';
          message?: string;
          metadata?: Record<string, any> | null;
          source?: string | null;
          created_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      oauth_tokens: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          access_token: string;
          refresh_token: string | null;
          token_type: string | null;
          expires_at: string | null;
          scope: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          access_token: string;
          refresh_token?: string | null;
          token_type?: string | null;
          expires_at?: string | null;
          scope?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          access_token?: string;
          refresh_token?: string | null;
          token_type?: string | null;
          expires_at?: string | null;
          scope?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      assign_admin_and_link_users: {
        Args: { target_user_id: string; users_to_link: string[] };
        Returns: {
          success: boolean;
          error?: string;
        };
      };
      schedule_email_sync: {
        Args: {
          p_account_id: string;
          p_schedule?: string;
        };
        Returns: {
          success: boolean;
          job_id?: string;
          error?: string;
        };
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
}

// Export the typed supabase client
import { createClient } from '@supabase/supabase-js';

export type ExtendedClient = ReturnType<typeof createClient<Database>>;
