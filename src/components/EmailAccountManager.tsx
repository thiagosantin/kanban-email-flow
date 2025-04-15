
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Mail, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ConnectionTypeSelector } from './email/ConnectionTypeSelector';
import { ProviderSelector } from './email/ProviderSelector';
import { BasicConnectionForm } from './email/BasicConnectionForm';
import { AuthRequiredDialog } from './email/AuthRequiredDialog';

export function EmailAccountManager() {
  const [connectionType, setConnectionType] = useState<'oauth2' | 'imap' | 'pop3'>('oauth2');
  const [provider, setProvider] = useState<'gmail' | 'outlook' | 'custom'>('gmail');
  const [email, setEmail] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in when component mounts
    checkUserAuth();

    // Set up auth state listener to detect login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUserAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUserAuth = async () => {
    const { data } = await supabase.auth.getUser();
    setIsLoggedIn(!!data.user);
  };

  const handleAddAccount = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData?.user) {
        toast.error('You must be logged in to add an email account');
        setOpen(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('email_accounts')
        .insert({
          user_id: authData.user.id,
          provider: provider,
          email: email,
          auth_type: connectionType,
          host: connectionType !== 'oauth2' ? host : null,
          port: connectionType !== 'oauth2' && port ? parseInt(port) : null,
          username: connectionType !== 'oauth2' ? username : null,
          password: connectionType !== 'oauth2' ? password : null,
          access_token: null,
          refresh_token: null
        });

      if (error) throw error;

      toast.success('Email account added successfully');
      setEmail('');
      setHost('');
      setPort('');
      setUsername('');
      setPassword('');
      setOpen(false);
    } catch (error) {
      toast.error('Failed to add email account');
      console.error(error);
    }
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
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
          <Plus className="mr-2 h-4 w-4" /> Add Email Account
        </Button>
      </DialogTrigger>
      
      {!isLoggedIn ? (
        <AuthRequiredDialog onLoginClick={handleNavigateToLogin} />
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Email Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ConnectionTypeSelector 
              connectionType={connectionType} 
              setConnectionType={setConnectionType} 
            />

            <ProviderSelector 
              provider={provider} 
              setProvider={setProvider} 
            />

            <div className="space-y-2">
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
              />
            </div>

            {connectionType !== 'oauth2' && (
              <BasicConnectionForm
                host={host}
                setHost={setHost}
                port={port}
                setPort={setPort}
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
              />
            )}

            <Button onClick={handleAddAccount} className="w-full">
              <Mail className="mr-2 h-4 w-4" /> Connect Account
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
