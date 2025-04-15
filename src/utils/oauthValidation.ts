
import { supabase } from "@/integrations/supabase/client";

interface OAuthValidationResult {
  isValid: boolean;
  tokens?: {
    access_token: string;
    refresh_token?: string;
    token_type?: string;
    expires_at?: string;
    scope?: string;
  };
  error?: string;
}

export const validateOAuthConfig = async (
  provider: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<OAuthValidationResult> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { 
        isValid: false, 
        error: 'User must be authenticated to validate OAuth configuration' 
      };
    }

    // For now, we'll do basic validation and save a test token
    // In a real implementation, this would involve making actual OAuth requests
    const isValidClientId = clientId.length > 10;
    const isValidClientSecret = clientSecret.length > 10;
    const isValidRedirectUri = redirectUri.startsWith('http');

    if (!isValidClientId || !isValidClientSecret || !isValidRedirectUri) {
      return {
        isValid: false,
        error: 'Invalid configuration format'
      };
    }

    // Check if token already exists for this user and provider
    const { data: existingToken } = await supabase
      .from('oauth_tokens')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .maybeSingle();

    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour from now
    
    // Store test token in oauth_tokens table
    let tokenResult;
    
    if (existingToken) {
      // Update existing token
      tokenResult = await supabase
        .from('oauth_tokens')
        .update({
          access_token: 'test_access_token',
          refresh_token: 'test_refresh_token',
          token_type: 'Bearer',
          expires_at: expiresAt,
          scope: 'email profile',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('provider', provider);
    } else {
      // Insert new token
      tokenResult = await supabase
        .from('oauth_tokens')
        .insert({
          user_id: user.id,
          provider,
          access_token: 'test_access_token',
          refresh_token: 'test_refresh_token',
          token_type: 'Bearer',
          expires_at: expiresAt,
          scope: 'email profile',
          updated_at: new Date().toISOString()
        });
    }

    if (tokenResult.error) throw tokenResult.error;

    return {
      isValid: true,
      tokens: {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
        token_type: 'Bearer',
        expires_at: expiresAt,
        scope: 'email profile'
      }
    };
  } catch (error: any) {
    console.error('OAuth validation error:', error);
    return {
      isValid: false,
      error: error.message || 'Failed to validate OAuth configuration'
    };
  }
};
