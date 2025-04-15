
export interface EmailAccount {
  id: string;
  provider: 'gmail' | 'outlook' | 'custom';
  email: string;
  created_at: string;
  updated_at: string;
  auth_type: 'oauth2' | 'basic';
  host?: string | null;
  port?: number | null;
  username?: string | null;
  password?: string | null;
  smtp_host?: string | null;
  smtp_port?: number | null;
  smtp_username?: string | null;
  smtp_password?: string | null;
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
}
