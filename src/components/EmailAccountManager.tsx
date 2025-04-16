
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AuthRequiredDialog } from './email/AuthRequiredDialog';
import { EmailAccountForm } from './email/EmailAccountForm';
import { EmailAccountActions } from './email/EmailAccountActions';
import { useEmailAccount } from './email/useEmailAccount';

export function EmailAccountManager() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  const {
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
    addAccount
  } = useEmailAccount();

  const handleAddAccount = async () => {
    const success = await addAccount();
    if (success) {
      setOpen(false);
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
            <EmailAccountForm
              connectionType={connectionType}
              setConnectionType={setConnectionType}
              provider={provider}
              setProvider={setProvider}
              email={email}
              setEmail={setEmail}
              host={host}
              setHost={setHost}
              port={port}
              setPort={setPort}
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
            />
            
            <EmailAccountActions
              emailConfig={{
                provider,
                email,
                host,
                port,
                username,
                password,
              }}
              isSubmitting={isSubmitting}
              onSubmit={handleAddAccount}
            />
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
