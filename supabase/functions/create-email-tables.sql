
-- Create email_accounts table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  provider TEXT NOT NULL,
  email TEXT NOT NULL,
  auth_type TEXT NOT NULL,
  host TEXT,
  port INTEGER,
  username TEXT,
  password TEXT,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_username TEXT,
  smtp_password TEXT,
  access_token TEXT,
  refresh_token TEXT,
  sync_interval_minutes INTEGER DEFAULT 15,
  last_synced TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, email)
);

-- Create email_folders table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES email_accounts ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  type TEXT NOT NULL,
  email_count INTEGER DEFAULT 0,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (account_id, path)
);

-- Create emails table if it doesn't exist
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES email_accounts ON DELETE CASCADE,
  folder_id UUID REFERENCES email_folders ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'inbox',
  subject TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  preview TEXT,
  content TEXT,
  read BOOLEAN DEFAULT FALSE,
  flagged BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  external_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (account_id, external_id)
);

-- Create background_jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS background_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  account_id UUID REFERENCES email_accounts ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  schedule TEXT
);

-- Create RLS policies for email_accounts
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email accounts"
ON email_accounts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email accounts"
ON email_accounts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email accounts"
ON email_accounts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email accounts"
ON email_accounts FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for email_folders
ALTER TABLE email_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view folders of their email accounts"
ON email_folders FOR SELECT
USING (EXISTS (
  SELECT 1 FROM email_accounts
  WHERE email_accounts.id = email_folders.account_id
  AND email_accounts.user_id = auth.uid()
));

CREATE POLICY "Users can insert folders for their email accounts"
ON email_folders FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM email_accounts
  WHERE email_accounts.id = email_folders.account_id
  AND email_accounts.user_id = auth.uid()
));

CREATE POLICY "Users can update folders of their email accounts"
ON email_folders FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM email_accounts
  WHERE email_accounts.id = email_folders.account_id
  AND email_accounts.user_id = auth.uid()
));

CREATE POLICY "Users can delete folders of their email accounts"
ON email_folders FOR DELETE
USING (EXISTS (
  SELECT 1 FROM email_accounts
  WHERE email_accounts.id = email_folders.account_id
  AND email_accounts.user_id = auth.uid()
));

-- Create RLS policies for emails
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view emails in their accounts"
ON emails FOR SELECT
USING (EXISTS (
  SELECT 1 FROM email_accounts
  WHERE email_accounts.id = emails.account_id
  AND email_accounts.user_id = auth.uid()
));

CREATE POLICY "Users can insert emails in their accounts"
ON emails FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM email_accounts
  WHERE email_accounts.id = emails.account_id
  AND email_accounts.user_id = auth.uid()
));

CREATE POLICY "Users can update emails in their accounts"
ON emails FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM email_accounts
  WHERE email_accounts.id = emails.account_id
  AND email_accounts.user_id = auth.uid()
));

CREATE POLICY "Users can delete emails in their accounts"
ON emails FOR DELETE
USING (EXISTS (
  SELECT 1 FROM email_accounts
  WHERE email_accounts.id = emails.account_id
  AND email_accounts.user_id = auth.uid()
));

-- Create RLS policies for background_jobs
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their background jobs"
ON background_jobs FOR SELECT
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM email_accounts
  WHERE email_accounts.id = background_jobs.account_id
  AND email_accounts.user_id = auth.uid()
));

CREATE POLICY "Users can insert their background jobs"
ON background_jobs FOR INSERT
WITH CHECK (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM email_accounts
  WHERE email_accounts.id = background_jobs.account_id
  AND email_accounts.user_id = auth.uid()
));

CREATE POLICY "Users can update their background jobs"
ON background_jobs FOR UPDATE
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM email_accounts
  WHERE email_accounts.id = background_jobs.account_id
  AND email_accounts.user_id = auth.uid()
));

CREATE POLICY "Users can delete their background jobs"
ON background_jobs FOR DELETE
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM email_accounts
  WHERE email_accounts.id = background_jobs.account_id
  AND email_accounts.user_id = auth.uid()
));
