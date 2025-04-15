export interface EmailAccount {
  id: string;
  provider: string;
  email: string;
  created_at: string;
  updated_at: string;
  auth_type: 'oauth2' | 'imap' | 'pop3';
  host?: string | null;
  port?: number | null;
  username?: string | null;
  password?: string | null;
  smtp_host?: string | null;
  smtp_port?: number | null;
  smtp_username?: string | null;
  smtp_password?: string | null;
  last_synced?: string | null;
  sync_interval_minutes?: number;
  access_token?: string | null;
  refresh_token?: string | null;
  folders?: EmailFolder[] | null;
}

export interface EmailFolder {
  id: string;
  name: string;
  path: string;
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'archive' | 'custom';
  email_count?: number;
  unread_count?: number;
  account_id: string;
}

export type EmailStatus = 'inbox' | 'awaiting' | 'processing' | 'done';

export interface Email {
  id: string;
  account_id: string | null;
  status: EmailStatus;
  date: string;
  read: boolean | null;
  flagged: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  from_name: string | null;
  subject: string;
  preview: string | null;
  content: string | null;
  external_id: string;
  from_email: string;
  folder_id?: string | null;
}
