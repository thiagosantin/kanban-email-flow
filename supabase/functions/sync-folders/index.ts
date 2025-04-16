
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../cors.ts'

interface SyncFoldersRequest {
  account_id: string;
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
    
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: ' + userError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body
    const { account_id } = await req.json() as SyncFoldersRequest;

    if (!account_id) {
      return new Response(
        JSON.stringify({ error: 'Missing account_id in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user owns this account
    const { data: account, error: accountError } = await supabaseClient
      .from('email_accounts')
      .select('*')
      .eq('id', account_id)
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ error: 'Account not found or not owned by user' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        metadata: { trigger: 'manual', account_email: account.email, operation: 'sync_folders' }
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job:', jobError);
    }

    // Default folder structure for all account types
    const defaultFolders = [
      { name: 'Inbox', path: 'INBOX', type: 'inbox' },
      { name: 'Sent', path: 'SENT', type: 'sent' },
      { name: 'Drafts', path: 'DRAFTS', type: 'drafts' },
      { name: 'Trash', path: 'TRASH', type: 'trash' },
      { name: 'Spam', path: 'SPAM', type: 'spam' },
      { name: 'Archive', path: 'ARCHIVE', type: 'archive' }
    ];

    // Provider-specific folders
    if (account.provider === 'gmail') {
      defaultFolders.push(
        { name: 'Important', path: 'IMPORTANT', type: 'custom' },
        { name: 'Starred', path: 'STARRED', type: 'custom' },
        { name: 'Promotions', path: 'PROMOTIONS', type: 'custom' }
      );
    } else if (account.provider === 'outlook') {
      defaultFolders.push(
        { name: 'Focused', path: 'FOCUSED', type: 'custom' },
        { name: 'Other', path: 'OTHER', type: 'custom' },
        { name: 'Clutter', path: 'CLUTTER', type: 'custom' }
      );
    }

    // Prepare folders for insertion
    const foldersToUpsert = defaultFolders.map(folder => ({
      ...folder,
      account_id: account_id,
      email_count: Math.floor(Math.random() * 50), // Random count for simulation
      unread_count: Math.floor(Math.random() * 20) // Random unread count for simulation
    }));

    // Insert folders
    const { data: insertedFolders, error: insertError } = await supabaseClient
      .from('email_folders')
      .upsert(foldersToUpsert, { onConflict: 'account_id,path' })
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
          metadata: { ...job.metadata, folders_synced: foldersToUpsert.length }
        })
        .eq('id', job.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: foldersToUpsert.length,
        message: `Successfully synced ${foldersToUpsert.length} folders` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Sync folders error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
