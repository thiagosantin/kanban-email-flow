
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../cors.ts'

interface SyncFoldersRequest {
  account_id: string;
}

serve(async (req) => {
  console.log("Received sync-folders request");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
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
    
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: ' + userError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      console.error("No user found");
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body
    let requestData: SyncFoldersRequest;
    try {
      requestData = await req.json() as SyncFoldersRequest;
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { account_id } = requestData;

    if (!account_id) {
      console.error("Missing account_id in request");
      return new Response(
        JSON.stringify({ error: 'Missing account_id in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing folder sync for account: ${account_id}, user: ${user.id}`);

    // Verify the user owns this account
    const { data: account, error: accountError } = await supabaseClient
      .from('email_accounts')
      .select('*')
      .eq('id', account_id)
      .eq('user_id', user.id)
      .single();

    if (accountError) {
      console.error(`Account error: ${accountError.message}, Code: ${accountError.code}`);
      return new Response(
        JSON.stringify({ error: 'Account not found or not owned by user' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!account) {
      console.error("Account not found");
      return new Response(
        JSON.stringify({ error: 'Account not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a background job for this sync operation
    const { data: job, error: jobError } = await supabaseClient
      .from('background_jobs')
      .insert({
        type: 'email_sync',
        status: 'running',
        account_id: account_id,
        user_id: user.id,
        metadata: { trigger: 'manual', account_email: account.email, operation: 'folder_sync' }
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job:', jobError);
      // Non-critical error, continue with sync
    }

    // Default folders that would exist in most email providers
    const defaultFolders = [
      { name: 'Inbox', path: 'INBOX', type: 'inbox' },
      { name: 'Sent', path: 'SENT', type: 'sent' },
      { name: 'Drafts', path: 'DRAFTS', type: 'drafts' },
      { name: 'Trash', path: 'TRASH', type: 'trash' },
      { name: 'Spam', path: 'SPAM', type: 'spam' },
      { name: 'Archive', path: 'ARCHIVE', type: 'archive' }
    ];

    // Build folders to insert with account_id
    const foldersToInsert = defaultFolders.map(folder => ({
      ...folder,
      account_id: account_id
    }));

    // Insert the folders
    const { data: savedFolders, error: insertError } = await supabaseClient
      .from('email_folders')
      .upsert(foldersToInsert, { onConflict: 'account_id,path' })
      .select();

    if (insertError) {
      console.error('Error inserting folders:', insertError);
      
      // Update job status to failed
      if (job) {
        await supabaseClient
          .from('background_jobs')
          .update({ 
            status: 'failed', 
            completed_at: new Date().toISOString(),
            error: insertError.message
          })
          .eq('id', job.id);
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to save folders: ' + insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update job status to completed
    if (job) {
      await supabaseClient
        .from('background_jobs')
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString(),
          metadata: { ...job.metadata, folders_synced: foldersToInsert.length }
        })
        .eq('id', job.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: foldersToInsert.length,
        message: `Successfully synced ${foldersToInsert.length} folders` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Sync folders error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
