
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
import { TestConnectionButton } from './email/TestConnectionButton';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAuth();

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

  const validateForm = () => {
    if (!email) {
      toast.error('Email address is required');
      return false;
    }

    if (connectionType !== 'oauth2') {
      if (!username) {
        toast.error('Username is required');
        return false;
      }
      if (!password) {
        toast.error('Password is required');
        return false;
      }
      if (!host) {
        toast.error('Server address is required');
        return false;
      }
      if (!port) {
        toast.error('Port is required');
        return false;
      }
    }
    
    return true;
  };

  const handleAddAccount = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Authentication error:', authError);
        toast.error('Authentication error: ' + authError.message);
        return;
      }
      
      if (!authData?.user) {
        toast.error('You must be logged in to add an email account');
        setOpen(false);
        return;
      }

      // Check if this email already exists for the user
      const { data: existingAccounts, error: fetchError } = await supabase
        .from('email_accounts')
        .select('id')
        .eq('user_id', authData.user.id)
        .eq('email', email);

      if (fetchError) {
        console.error('Error checking existing accounts:', fetchError);
        toast.error('Failed to check if account already exists');
        return;
      }

      if (existingAccounts && existingAccounts.length > 0) {
        toast.error('This email account is already connected');
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
          refresh_token: null,
          sync_interval_minutes: 15,
          last_synced: null
        });

      if (error) {
        console.error('Error adding email account:', error);
        throw error;
      }

      toast.success('Email account added successfully');
      setEmail('');
      setHost('');
      setPort('');
      setUsername('');
      setPassword('');
      setOpen(false);
    } catch (error: any) {
      console.error('Failed to add email account:', error);
      toast.error('Failed to add email account: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
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

            <div className="flex flex-col md:flex-row gap-4 justify-end">
              <TestConnectionButton
                emailConfig={{
                  provider,
                  email,
                  host,
                  port,
                  username,
                  password,
                }}
                disabled={isSubmitting}
              />
              <Button 
                onClick={handleAddAccount} 
                className="w-full md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Connecting..."
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" /> Connect Account
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
