
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OAuthButtons } from './OAuthButtons';
import { ManualConnectionForm } from './ManualConnectionForm';
import { Label } from '@/components/ui/label';
import { AuthRequiredDialog } from './AuthRequiredDialog';

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
        smtp_password: smtpPassword || password
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
            <div className="grid gap-2">
              <Label>Connection Type</Label>
              <Select 
                value={connectionType} 
                onValueChange={(value: ConnectionType) => handleConnectionTypeChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select connection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oauth2">OAuth (Gmail, Outlook)</SelectItem>
                  <SelectItem value="imap">IMAP</SelectItem>
                  <SelectItem value="pop3">POP3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {connectionType === 'oauth2' ? (
              <OAuthButtons loading={loading} onSuccess={() => setOpen(false)} />
            ) : (
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
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
