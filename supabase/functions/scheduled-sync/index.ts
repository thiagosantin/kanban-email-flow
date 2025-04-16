
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

    const body = await req.json().catch(() => ({}));
    const isManualTrigger = body?.manual_trigger === true;
    
    // Get pending email sync jobs or accounts that need to be synced
    const { data: jobsToRun, error: jobsError } = await supabase
      .from("background_jobs")
      .select("*, email_accounts(*)")
      .eq("type", "email_sync")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (jobsError) {
      throw new Error(`Failed to get jobs: ${jobsError.message}`);
    }

    console.log(`Found ${jobsToRun?.length || 0} pending sync jobs`);

    // If no pending jobs but it's a manual trigger, get all accounts to sync
    let accountsToSync = [];
    if ((jobsToRun?.length === 0 || !jobsToRun) && isManualTrigger) {
      const { data: accounts, error: accountsError } = await supabase
        .from("email_accounts")
        .select("*");
      
      if (accountsError) {
        throw new Error(`Failed to get accounts: ${accountsError.message}`);
      }
      
      accountsToSync = accounts || [];
      console.log(`Found ${accountsToSync.length} accounts to sync via manual trigger`);
    }

    // Process each job by calling the sync-emails function
    const syncResults = [];
    
    // Process pending jobs
    for (const job of (jobsToRun || [])) {
      try {
        console.log(`Processing job: ${job.id} for account: ${job.email_accounts?.email || job.account_id}`);
        
        // Update job status to running
        await supabase.rpc("update_job_status", {
          p_job_id: job.id,
          p_status: "running"
        });
        
        const syncResponse = await fetch(
          `${supabaseUrl}/functions/v1/sync-emails`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceRole}`
            },
            body: JSON.stringify({ account_id: job.account_id })
          }
        );
        
        const syncResult = await syncResponse.json();
        console.log(`Sync result for job ${job.id}:`, syncResult);
        
        // Update job status to completed
        await supabase.rpc("update_job_status", {
          p_job_id: job.id,
          p_status: "completed"
        });
        
        // Schedule the next run if this is a recurring job
        if (job.schedule) {
          const nextRunAt = new Date();
          nextRunAt.setMinutes(nextRunAt.getMinutes() + 15); // Default to 15 mins if we can't parse schedule
          
          await supabase
            .from("background_jobs")
            .update({
              next_run_at: nextRunAt.toISOString()
            })
            .eq("id", job.id);
        }
        
        syncResults.push({
          job_id: job.id,
          account_id: job.account_id,
          email: job.email_accounts?.email,
          result: syncResult
        });
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        
        // Update job status to failed
        await supabase.rpc("update_job_status", {
          p_job_id: job.id,
          p_status: "failed",
          p_error: error.message
        });
        
        syncResults.push({
          job_id: job.id,
          account_id: job.account_id,
          email: job.email_accounts?.email,
          error: error.message
        });
      }
    }
    
    // Process manual sync for accounts if needed
    if (isManualTrigger && accountsToSync.length > 0) {
      for (const account of accountsToSync) {
        try {
          console.log(`Manual sync for account: ${account.email}`);
          
          // Create a new job for this manual sync
          const { data: newJob, error: jobError } = await supabase
            .from("background_jobs")
            .insert({
              type: "email_sync",
              status: "running",
              account_id: account.id,
              metadata: { 
                manual_trigger: true,
                email: account.email
              }
            })
            .select()
            .single();
            
          if (jobError) throw jobError;
          
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
          console.log(`Manual sync result for ${account.email}:`, syncResult);
          
          // Update job status to completed
          await supabase.rpc("update_job_status", {
            p_job_id: newJob.id,
            p_status: "completed"
          });
          
          syncResults.push({
            job_id: newJob.id,
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
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${syncResults.length} tasks/accounts`, 
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
