
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { TestConnectionButton } from './TestConnectionButton';

interface EmailAccountActionsProps {
  emailConfig: {
    provider: string;
    email: string;
    host?: string;
    port?: string;
    username?: string;
    password?: string;
  };
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function EmailAccountActions({ 
  emailConfig, 
  isSubmitting, 
  onSubmit 
}: EmailAccountActionsProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-end">
      <TestConnectionButton
        emailConfig={emailConfig}
        disabled={isSubmitting}
      />
      <Button 
        onClick={onSubmit} 
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
  );
}
