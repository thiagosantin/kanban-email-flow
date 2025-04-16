
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduleRequest {
  account_id: string;
  schedule?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Create a Supabase client with the auth context of the logged in user
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  );

  try {
    // Get the request body
    const { account_id, schedule } = await req.json() as ScheduleRequest;

    if (!account_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing account_id parameter' 
        }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Verify user is authorized to access this account
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: authError?.message || 'Not authenticated' 
        }),
        { 
          status: 401, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Verify the account belongs to this user
    const { data: account, error: accountError } = await supabaseClient
      .from('email_accounts')
      .select('id')
      .eq('id', account_id)
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Account not found or not authorized' 
        }),
        { 
          status: 403, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Create a new background job entry
    const { data, error } = await supabaseClient
      .from('background_jobs')
      .insert({
        type: 'email_sync',
        status: 'pending',
        account_id: account_id,
        user_id: user.id,
        schedule: schedule,
        next_run_at: new Date().toISOString(),
        metadata: { scheduled: true }
      })
      .select('id')
      .single();

    if (error) {
      console.error("Error creating job:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message || 'Failed to create sync job' 
        }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        job_id: data.id,
        message: 'Sync job scheduled successfully' 
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error("Error processing schedule request:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
