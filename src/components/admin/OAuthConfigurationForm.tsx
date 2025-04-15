import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Check, Loader2, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { validateOAuthConfig } from "@/utils/oauthValidation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface OAuthConfigFormData {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface OAuthConfigurationFormProps {
  provider: 'gmail' | 'outlook';
  config: {
    client_id: string | null;
    client_secret: string | null;
    redirect_uri: string | null;
  } | null;
  onSuccess: () => void;
}

export function OAuthConfigurationForm({ provider, config, onSuccess }: OAuthConfigurationFormProps) {
  const [isValidating, setIsValidating] = React.useState(false);
  const form = useForm<OAuthConfigFormData>({
    defaultValues: {
      clientId: config?.client_id || '',
      clientSecret: config?.client_secret || '',
      redirectUri: config?.redirect_uri || '',
    },
  });

  const onSubmit = async (data: OAuthConfigFormData) => {
    try {
      const { error } = await supabase
        .from('oauth_configurations')
        .upsert({
          provider,
          client_id: data.clientId,
          client_secret: data.clientSecret,
          redirect_uri: data.redirectUri,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'provider'
        });

      if (error) throw error;
      
      toast.success('OAuth configuration saved successfully');
      onSuccess();
    } catch (error) {
      console.error('Error saving OAuth config:', error);
      toast.error('Failed to save OAuth configuration');
    }
  };

  const validateConfiguration = async () => {
    const formData = form.getValues();
    
    if (!formData.clientId || !formData.clientSecret || !formData.redirectUri) {
      toast.error('Please fill in all fields before testing');
      return;
    }

    setIsValidating(true);
    
    try {
      // Save configuration first
      await onSubmit(formData);

      // Validate the configuration
      const validationResult = await validateOAuthConfig(
        provider,
        formData.clientId,
        formData.clientSecret,
        formData.redirectUri
      );

      if (validationResult.isValid) {
        toast.success('OAuth configuration validated successfully');
      } else {
        toast.error(validationResult.error || 'Failed to validate OAuth configuration');
      }
    } catch (error) {
      console.error('Error validating OAuth config:', error);
      toast.error('Failed to validate OAuth configuration');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client ID</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter client ID" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientSecret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Secret</FormLabel>
              <FormControl>
                <Input {...field} type="password" placeholder="Enter client secret" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="redirectUri"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Redirect URI</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter redirect URI" />
              </FormControl>
              <FormDescription>
                The URI where users will be redirected after authenticating
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Save Configuration
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={validateConfiguration}
            disabled={isValidating}
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Test Configuration
          </Button>
        </div>
      </form>
    </Form>
  );
}
