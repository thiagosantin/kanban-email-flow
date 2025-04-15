
export type EmailStatus = 'inbox' | 'awaiting' | 'processing' | 'done';

export interface EmailAccount {
  id: string;
  provider: 'gmail' | 'outlook';
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Email {
  id: string;
  account_id: string;
  external_id: string;
  from_email: string;
  from_name: string | null;
  subject: string;
  preview: string | null;
  content: string | null;
  status: EmailStatus;
  date: string;
  read: boolean;
  flagged: boolean;
  created_at: string;
  updated_at: string;
}
