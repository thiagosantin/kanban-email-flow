
import React from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface OAuthButtonsProps {
  loading: boolean;
  onSuccess: () => void;
}

export function OAuthButtons({ loading, onSuccess }: OAuthButtonsProps) {
  const handleOAuthConnect = async (provider: 'gmail' | 'outlook') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to connect an email account');
        return;
      }

      // Here you would implement OAuth flow
      // For now, we'll just show a toast
      toast.info(`OAuth connection with ${provider} will be implemented soon`);
      onSuccess();
    } catch (error) {
      toast.error('Failed to connect account');
    }
  };

  return (
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
  );
}
