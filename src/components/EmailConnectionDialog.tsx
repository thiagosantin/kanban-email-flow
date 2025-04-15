
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Mail, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  // Helper to get default ports based on connection type
  const getDefaultPort = (type: ConnectionType) => {
    switch (type) {
      case 'imap': return '993';
      case 'pop3': return '995';
      default: return '';
    }
  };

  // Helper to get default SMTP port
  const getDefaultSmtpPort = () => '587';

  const handleConnectionTypeChange = (value: ConnectionType) => {
    setConnectionType(value);
    setPort(getDefaultPort(value));
    if (value !== 'oauth2') {
      setSmtpPort(getDefaultSmtpPort());
    }
  };

  const handleProviderChange = (value: Provider) => {
    setProvider(value);
    if (value === 'gmail') {
      setServer('imap.gmail.com');
      setSmtpServer('smtp.gmail.com');
    } else if (value === 'outlook') {
      setServer('outlook.office365.com');
      setSmtpServer('smtp.office365.com');
    } else {
      setServer('');
      setSmtpServer('');
    }
  };

  const handleOAuthConnect = async (provider: 'gmail' | 'outlook') => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to connect an email account');
        return;
      }

      // Here you would implement OAuth flow
      // For now, we'll just show a toast
      toast.info(`OAuth connection with ${provider} will be implemented soon`);
      setOpen(false);
    } catch (error) {
      toast.error('Failed to connect account');
    } finally {
      setLoading(false);
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
      
      // Reset form
      setEmail('');
      setServer('');
      setPort('');
      setUsername('');
      setPassword('');
      setSmtpServer('');
      setSmtpPort('');
      setSmtpUsername('');
      setSmtpPassword('');
    } catch (error: any) {
      toast.error('Failed to connect account: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Connect Email Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Email Account</DialogTitle>
          <DialogDescription>
            Add your email account to start managing your emails.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
            <div className="grid gap-4">
              <Button
                variant="outline"
                onClick={() => handleOAuthConnect('gmail')}
                disabled={loading}
                className="w-full"
              >
                Connect with Gmail
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuthConnect('outlook')}
                disabled={loading}
                className="w-full"
              >
                Connect with Outlook
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Provider</Label>
                <Select 
                  value={provider} 
                  onValueChange={(value: Provider) => handleProviderChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gmail">Gmail</SelectItem>
                    <SelectItem value="outlook">Outlook</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Email Address</Label>
                <Input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="you@example.com" 
                />
              </div>

              <div className="grid gap-2">
                <Label>{connectionType.toUpperCase()} Server</Label>
                <Input 
                  value={server} 
                  onChange={(e) => setServer(e.target.value)} 
                  placeholder={`${connectionType}.example.com`} 
                />
              </div>

              <div className="grid gap-2">
                <Label>{connectionType.toUpperCase()} Port</Label>
                <Input 
                  type="number" 
                  value={port} 
                  onChange={(e) => setPort(e.target.value)} 
                  placeholder={getDefaultPort(connectionType)} 
                />
              </div>

              <div className="grid gap-2">
                <Label>Username</Label>
                <Input 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                />
              </div>

              <div className="grid gap-2">
                <Label>Password</Label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>

              <div className="grid gap-2">
                <Label>SMTP Server</Label>
                <Input 
                  value={smtpServer} 
                  onChange={(e) => setSmtpServer(e.target.value)} 
                  placeholder="smtp.example.com" 
                />
              </div>

              <div className="grid gap-2">
                <Label>SMTP Port</Label>
                <Input 
                  type="number" 
                  value={smtpPort} 
                  onChange={(e) => setSmtpPort(e.target.value)} 
                  placeholder={getDefaultSmtpPort()} 
                />
              </div>

              <div className="grid gap-2">
                <Label>SMTP Username (optional)</Label>
                <Input 
                  value={smtpUsername} 
                  onChange={(e) => setSmtpUsername(e.target.value)} 
                  placeholder="Same as above if left empty"
                />
              </div>

              <div className="grid gap-2">
                <Label>SMTP Password (optional)</Label>
                <Input 
                  type="password" 
                  value={smtpPassword} 
                  onChange={(e) => setSmtpPassword(e.target.value)} 
                  placeholder="Same as above if left empty"
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          {connectionType !== 'oauth2' && (
            <Button onClick={handleManualConnect} disabled={loading}>
              {loading ? (
                "Connecting..."
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" /> Connect Account
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
