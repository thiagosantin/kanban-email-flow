import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OAuthButtons } from './OAuthButtons';
import { ManualConnectionForm } from './ManualConnectionForm';
import { AuthRequiredDialog } from './AuthRequiredDialog';
import { SyncIntervalSelector } from './SyncIntervalSelector';
import { TestConnectionButton } from './TestConnectionButton';

type ConnectionType = 'oauth2' | 'imap' | 'pop3';
type Provider = 'gmail' | 'outlook' | 'custom';

export function EmailConnectionDialog() {
  const [connectionType, setConnectionType] = useState<ConnectionType>('oauth2');
  const [provider, setProvider] = useState<Provider>('gmail');
  const [email, setEmail] = useState('');
  const [server, setServer] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [smtpServer, setSmtpServer] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [syncInterval, setSyncInterval] = useState(15);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  React.useEffect(() => {
    checkUserAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUserAuth();
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkUserAuth = async () => {
    const { data } = await supabase.auth.getUser();
    setIsLoggedIn(!!data.user);
  };

  const handleConnectionTypeChange = (value: ConnectionType) => {
    setConnectionType(value);
    setPort(getDefaultPort(value));
    if (value !== 'oauth2') {
      setSmtpPort('587');
    }
  };

  const getDefaultPort = (type: ConnectionType) => {
    switch (type) {
      case 'imap': return '993';
      case 'pop3': return '995';
      default: return '';
    }
  };

  const handleManualConnect = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to add an email account');
        return;
      }

      const { error } = await supabase.from('email_accounts').insert({
        user_id: user.id,
        provider,
        email,
        auth_type: connectionType,
        host: server,
        port: port ? parseInt(port) : null,
        username,
        password,
        smtp_host: smtpServer,
        smtp_port: smtpPort ? parseInt(smtpPort) : null,
        smtp_username: smtpUsername || username,
        smtp_password: smtpPassword || password,
        sync_interval_minutes: syncInterval,
        last_synced: null
      });

      if (error) throw error;

      toast.success('Email account connected successfully');
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error('Failed to connect account: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setServer('');
    setPort('');
    setUsername('');
    setPassword('');
    setSmtpServer('');
    setSmtpPort('');
    setSmtpUsername('');
    setSmtpPassword('');
    setSyncInterval(15);
  };

  const emailConfig = {
    provider,
    email,
    host: server,
    port,
    username,
    password,
    smtp_host: smtpServer,
    smtp_port: smtpPort,
    smtp_username: smtpUsername,
    smtp_password: smtpPassword
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={(e) => {
            if (!isLoggedIn) {
              e.preventDefault();
              toast.error('You must be logged in to add an email account');
              return;
            }
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Connect Email Account
        </Button>
      </DialogTrigger>
      
      {!isLoggedIn ? (
        <AuthRequiredDialog onLoginClick={() => window.location.href = '/login'} />
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Email Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {connectionType === 'oauth2' ? (
              <OAuthButtons loading={loading} onSuccess={() => setOpen(false)} />
            ) : (
              <>
                <ManualConnectionForm
                  provider={provider}
                  setProvider={setProvider}
                  email={email}
                  setEmail={setEmail}
                  server={server}
                  setServer={setServer}
                  port={port}
                  setPort={setPort}
                  username={username}
                  setUsername={setUsername}
                  password={password}
                  setPassword={setPassword}
                  smtpServer={smtpServer}
                  setSmtpServer={setSmtpServer}
                  smtpPort={smtpPort}
                  setSmtpPort={setSmtpPort}
                  smtpUsername={smtpUsername}
                  setSmtpUsername={setSmtpUsername}
                  smtpPassword={smtpPassword}
                  setSmtpPassword={setSmtpPassword}
                  onSubmit={handleManualConnect}
                  loading={loading}
                />
                <div className="pt-4 border-t">
                  <SyncIntervalSelector
                    value={syncInterval}
                    onChange={setSyncInterval}
                  />
                </div>
                <div className="flex flex-col md:flex-row gap-4 justify-end">
                  <TestConnectionButton
                    emailConfig={emailConfig}
                    disabled={loading}
                  />
                  <Button onClick={handleManualConnect} disabled={loading}>
                    <Mail className="mr-2 h-4 w-4" />
                    {loading ? "Connecting..." : "Connect Account"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
