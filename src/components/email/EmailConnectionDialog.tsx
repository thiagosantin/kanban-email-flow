import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OAuthButtons } from './OAuthButtons';
import { ManualConnectionForm } from './ManualConnectionForm';
import { AuthRequiredDialog } from './AuthRequiredDialog';
import { ConnectionTypeSelector } from './ConnectionTypeSelector';
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
        toast.error('Você precisa estar logado para adicionar uma conta de email');
        return;
      }

      if (!email) {
        toast.error('Email é obrigatório');
        return;
      }

      if (connectionType !== 'oauth2') {
        if (!server) {
          toast.error('Servidor é obrigatório');
          return;
        }
        if (!port) {
          toast.error('Porta é obrigatória');
          return;
        }
        if (!username) {
          toast.error('Nome de usuário é obrigatório');
          return;
        }
        if (!password) {
          toast.error('Senha é obrigatória');
          return;
        }
      }

      const { data: existingAccounts, error: fetchError } = await supabase
        .from('email_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('email', email);

      if (fetchError) {
        console.error('Error checking existing accounts:', fetchError);
        toast.error('Falha ao verificar se a conta já existe: ' + (fetchError.message || 'Erro desconhecido'));
        return;
      }

      if (existingAccounts && existingAccounts.length > 0) {
        toast.error('Esta conta de email já está conectada');
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

      if (error) {
        console.error('Error adding email account:', error);
        toast.error('Falha ao conectar conta: ' + (error.message || 'Erro desconhecido'));
        return;
      }

      toast.success('Conta de email conectada com sucesso');
      setOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Failed to connect account:', error);
      toast.error('Falha ao conectar conta: ' + (error?.message || 'Erro desconhecido'));
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
              toast.error('Você precisa estar logado para adicionar uma conta de email');
              return;
            }
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Conectar Conta de Email
        </Button>
      </DialogTrigger>
      
      {!isLoggedIn ? (
        <AuthRequiredDialog onLoginClick={() => window.location.href = '/login'} />
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar Conta de Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ConnectionTypeSelector 
              connectionType={connectionType}
              setConnectionType={handleConnectionTypeChange}
            />
            
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
                    {loading ? "Conectando..." : "Conectar Conta"}
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
