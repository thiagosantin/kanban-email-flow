
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { LogIn } from "lucide-react";

interface AuthRequiredDialogProps {
  onLoginClick: () => void;
}

export function AuthRequiredDialog({ onLoginClick }: AuthRequiredDialogProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Authentication Required</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 text-center">
        <p>You need to be logged in to add an email account.</p>
        <Button onClick={onLoginClick} className="w-full">
          <LogIn className="mr-2 h-4 w-4" /> Go to Login
        </Button>
      </div>
    </DialogContent>
  );
}
