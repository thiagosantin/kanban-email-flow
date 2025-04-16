
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useEmailAccount() {
  const [connectionType, setConnectionType] = useState<'oauth2' | 'imap' | 'pop3'>('oauth2');
  const [provider, setProvider] = useState<'gmail' | 'outlook' | 'custom'>('gmail');
  const [email, setEmail] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const addAccount = async () => {
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
        return false;
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
      resetForm();
      return true;
    } catch (error: any) {
      console.error('Failed to add email account:', error);
      toast.error('Failed to add email account: ' + (error.message || 'Unknown error'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setHost('');
    setPort('');
    setUsername('');
    setPassword('');
  };

  return {
    connectionType,
    setConnectionType,
    provider,
    setProvider,
    email,
    setEmail,
    host,
    setHost,
    port,
    setPort,
    username,
    setUsername,
    password,
    setPassword,
    isLoggedIn,
    isSubmitting,
    addAccount,
    resetForm
  };
}
