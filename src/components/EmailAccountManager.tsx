
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Mail, Plus, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function EmailAccountManager() {
  const [connectionType, setConnectionType] = useState<'oauth2' | 'basic'>('oauth2');
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
          access_token: connectionType === 'basic' ? JSON.stringify({
            auth_type: 'basic',
            host,
            port: port ? parseInt(port) : null,
            username,
            password
          }) : null,
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <p>You need to be logged in to add an email account.</p>
            <Button onClick={handleNavigateToLogin} className="w-full">
              <LogIn className="mr-2 h-4 w-4" /> Go to Login
            </Button>
          </div>
        </DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Email Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Connection Type</Label>
              <Select 
                value={connectionType} 
                onValueChange={(value: 'oauth2' | 'basic') => setConnectionType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select connection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oauth2">OAuth2 (Gmail, Outlook)</SelectItem>
                  <SelectItem value="basic">IMAP/SMTP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Provider</Label>
              <Select 
                value={provider} 
                onValueChange={(value: 'gmail' | 'outlook' | 'custom') => setProvider(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select email provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="outlook">Outlook</SelectItem>
                  <SelectItem value="custom">Custom Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
              />
            </div>

            {connectionType === 'basic' && (
              <>
                <div className="space-y-2">
                  <Label>IMAP Host</Label>
                  <Input 
                    value={host} 
                    onChange={(e) => setHost(e.target.value)} 
                    placeholder="imap.example.com" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>IMAP Port</Label>
                  <Input 
                    type="number" 
                    value={port} 
                    onChange={(e) => setPort(e.target.value)} 
                    placeholder="993" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="your username" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="your password" 
                  />
                </div>
              </>
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
