
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
  smtp_host?: string | null;
  smtp_port?: number | null;
}
