
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Running scheduled email sync");
    
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    // Get all accounts that need to be synced
    const now = new Date();
    const { data: accountsToSync, error: accountsError } = await supabase
      .from("email_accounts")
      .select("*")
      .or(`last_synced.is.null,last_synced.lt.${new Date(now.getTime() - 5 * 60 * 1000).toISOString()}`); // Accounts not synced in last 5 minutes

    if (accountsError) {
      throw new Error(`Failed to get accounts: ${accountsError.message}`);
    }

    console.log(`Found ${accountsToSync?.length || 0} accounts to sync`);

    // Process each account by calling the sync-emails function
    const syncResults = [];
    
    for (const account of (accountsToSync || [])) {
      try {
        console.log(`Syncing account: ${account.email}`);
        
        const syncResponse = await fetch(
          `${supabaseUrl}/functions/v1/sync-emails`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceRole}`
            },
            body: JSON.stringify({ account_id: account.id })
          }
        );
        
        const syncResult = await syncResponse.json();
        console.log(`Sync result for ${account.email}:`, syncResult);
        
        syncResults.push({
          account_id: account.id,
          email: account.email,
          result: syncResult
        });
      } catch (error) {
        console.error(`Error syncing account ${account.email}:`, error);
        syncResults.push({
          account_id: account.id,
          email: account.email,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${syncResults.length} accounts`, 
        results: syncResults 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in scheduled-sync function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
