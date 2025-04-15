
import React from 'react';
import { Button } from "@/components/ui/button";
import { TestTube } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TestConnectionButtonProps {
  emailConfig: {
    provider: string;
    email: string;
    host?: string;
    port?: string;
    username?: string;
    password?: string;
    smtp_host?: string;
    smtp_port?: string;
    smtp_username?: string;
    smtp_password?: string;
  };
  disabled?: boolean;
}

export function TestConnectionButton({ emailConfig, disabled }: TestConnectionButtonProps) {
  const [testing, setTesting] = React.useState(false);

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to test email account');
        return;
      }

      const testResult = await supabase.from('email_accounts').insert({
        user_id: user.id,
        provider: emailConfig.provider,
        email: emailConfig.email,
        auth_type: emailConfig.host ? 'basic' : 'oauth2',
        host: emailConfig.host,
        port: emailConfig.port ? parseInt(emailConfig.port) : null,
        username: emailConfig.username,
        password: emailConfig.password,
        smtp_host: emailConfig.smtp_host,
        smtp_port: emailConfig.smtp_port ? parseInt(emailConfig.smtp_port) : null,
        smtp_username: emailConfig.smtp_username || emailConfig.username,
        smtp_password: emailConfig.smtp_password || emailConfig.password,
        sync_interval_minutes: 15,
        last_synced: null
      });

      if (testResult.error) throw testResult.error;
      toast.success('Connection test successful');
    } catch (error: any) {
      toast.error('Connection test failed: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleTestConnection} 
      disabled={disabled || testing}
      className="w-full md:w-auto"
    >
      <TestTube className="mr-2 h-4 w-4" />
      {testing ? "Testing..." : "Test Connection"}
    </Button>
  );
}
