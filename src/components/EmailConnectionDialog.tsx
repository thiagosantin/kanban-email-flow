
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
  DialogFooter
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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOAuthConnect = async (provider: 'gmail' | 'outlook') => {
    try {
      // Here you would implement OAuth flow
      // For now, we'll just show a toast
      toast.info(`OAuth connection with ${provider} will be implemented`);
      setOpen(false);
    } catch (error) {
      toast.error('Failed to connect account');
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
        provider: provider,
        email: email,
        auth_type: connectionType,
        host: server,
        port: port ? parseInt(port) : null,
        username,
        password: password // In a production app, you'd want to encrypt this
      });

      if (error) throw error;

      toast.success('Email account connected successfully');
      setOpen(false);
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
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Connection Type</Label>
            <Select 
              value={connectionType} 
              onValueChange={(value: ConnectionType) => setConnectionType(value)}
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
                className="w-full"
              >
                Connect with Gmail
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuthConnect('outlook')}
                className="w-full"
              >
                Connect with Outlook
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Email Address</Label>
                <Input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="you@example.com" 
                />
              </div>
              <div className="grid gap-2">
                <Label>Server</Label>
                <Input 
                  value={server} 
                  onChange={(e) => setServer(e.target.value)} 
                  placeholder={`${connectionType}.example.com`} 
                />
              </div>
              <div className="grid gap-2">
                <Label>Port</Label>
                <Input 
                  type="number" 
                  value={port} 
                  onChange={(e) => setPort(e.target.value)} 
                  placeholder={connectionType === 'imap' ? '993' : '995'} 
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
