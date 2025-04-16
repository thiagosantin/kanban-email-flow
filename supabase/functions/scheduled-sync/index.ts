
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../cors.ts'

interface ScheduledSyncRequest {
  manual_trigger?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );
    
    let isAuthorized = false;
    let user = null;
    
    try {
      // Get the current user if authenticated
      const {
        data: { user: authUser },
      } = await supabaseClient.auth.getUser();
      
      user = authUser;
      
      if (user) {
        // Check if user is admin
        const { data: adminRole } = await supabaseClient
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
          
        isAuthorized = !!adminRole;
      }
    } catch (authError) {
      console.log('Not authenticated request to scheduled-sync');
    }
    
    // For scheduled invocations, we don't have auth
    const isScheduledInvocation = req.headers.get('Authorization') === null;
    
    // Allow the function to run if it's a scheduled invocation or authorized admin
    if (!isScheduledInvocation && !isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const requestBody = await req.json().catch(() => ({})) as ScheduledSyncRequest;
    const isManualTrigger = !!requestBody.manual_trigger;
    
    // Get all email accounts that are due for sync
    const now = new Date();
    const { data: accounts, error: accountsError } = await supabaseClient
      .from('email_accounts')
      .select('*')
      .or(
        `last_synced.is.null,last_synced.lt.${new Date(now.getTime() - 15 * 60 * 1000).toISOString()}`
      );
    
    if (accountsError) {
      console.error('Error fetching accounts:', accountsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch accounts: ' + accountsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!accounts || accounts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No accounts due for sync' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process each account
    const results = [];
    
    for (const account of accounts) {
      try {
        // Update last_synced time
        await supabaseClient
          .from('email_accounts')
          .update({ last_synced: now.toISOString() })
          .eq('id', account.id);
        
        // Create a simulated sync result
        const syncResult = {
          account_id: account.id,
          email: account.email,
          success: true,
          message: `Synced at ${now.toISOString()}`,
          new_emails: Math.floor(Math.random() * 5) // Random number for simulation
        };
        
        results.push(syncResult);
      } catch (syncError) {
        console.error(`Error syncing account ${account.id}:`, syncError);
        results.push({
          account_id: account.id,
          email: account.email,
          success: false,
          error: syncError.message
        });
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        trigger: isManualTrigger ? 'manual' : 'scheduled',
        timestamp: now.toISOString(),
        results 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scheduled sync error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
