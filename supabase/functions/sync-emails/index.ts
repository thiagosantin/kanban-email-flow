
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../cors.ts'

interface SyncEmailsRequest {
  account_id: string;
}

serve(async (req) => {
  console.log("Received sync-emails request");
  
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
    let requestData: SyncEmailsRequest;
    try {
      requestData = await req.json() as SyncEmailsRequest;
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

    console.log(`Processing sync for account: ${account_id}, user: ${user.id}`);

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

    // Update the last_synced timestamp
    const { error: updateError } = await supabaseClient
      .from('email_accounts')
      .update({ last_synced: new Date().toISOString() })
      .eq('id', account_id);

    if (updateError) {
      console.error("Error updating last_synced:", updateError);
      // Non-critical error, continue with sync
    }

    // Create a background job for this sync operation
    const { data: job, error: jobError } = await supabaseClient
      .from('background_jobs')
      .insert({
        type: 'email_sync',
        status: 'running',
        account_id: account_id,
        user_id: user.id,
        metadata: { trigger: 'manual', account_email: account.email }
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job:', jobError);
      // Non-critical error, continue with sync
    }

    // Get the folder ID for inbox
    const { data: inboxFolder, error: folderError } = await supabaseClient
      .from('email_folders')
      .select('id')
      .eq('account_id', account_id)
      .eq('type', 'inbox')
      .single();

    if (folderError) {
      console.error("Error fetching inbox folder:", folderError);
      
      // Create the inbox folder if it doesn't exist
      const { data: newFolder, error: createFolderError } = await supabaseClient
        .from('email_folders')
        .insert({
          account_id: account_id,
          name: 'Inbox',
          path: 'INBOX',
          type: 'inbox'
        })
        .select()
        .single();
        
      if (createFolderError) {
        console.error("Error creating inbox folder:", createFolderError);
        return new Response(
          JSON.stringify({ error: 'Failed to create inbox folder: ' + createFolderError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.log("Created new inbox folder:", newFolder);
      }
    }

    // Get the folder ID again if we just created it
    const { data: updatedInboxFolder } = await supabaseClient
      .from('email_folders')
      .select('id')
      .eq('account_id', account_id)
      .eq('type', 'inbox')
      .single();

    // Use the inbox folder ID if available, otherwise use null
    let folderId = updatedInboxFolder?.id || inboxFolder?.id || null;

    // Simulate fetching emails from the email provider
    // In a real implementation, this would connect to the email provider's API
    const simulatedEmails = [
      {
        subject: 'Welcome to Email Kanban',
        from_email: 'support@emailkanban.com',
        from_name: 'Email Kanban Support',
        date: new Date().toISOString(),
        external_id: `${account_id}-welcome-${Math.random().toString(36).substring(2, 9)}`,
        status: 'inbox',
        preview: 'Thank you for trying Email Kanban...',
        content: '<p>Thank you for trying Email Kanban! We hope you enjoy organizing your emails.</p>'
      },
      {
        subject: 'Your Weekly Newsletter',
        from_email: 'newsletter@example.com',
        from_name: 'Example Newsletter',
        date: new Date().toISOString(),
        external_id: `${account_id}-newsletter-${Math.random().toString(36).substring(2, 9)}`,
        status: 'inbox',
        preview: 'This week in tech news...',
        content: '<p>Here are the latest tech updates for this week.</p>'
      },
      {
        subject: 'Action Required: Update Your Password',
        from_email: 'security@example.com',
        from_name: 'Security Team',
        date: new Date().toISOString(),
        external_id: `${account_id}-security-${Math.random().toString(36).substring(2, 9)}`,
        status: 'inbox',
        preview: 'Please update your password by...',
        content: '<p>For security reasons, we recommend updating your password regularly.</p>'
      }
    ];

    // Insert the simulated emails
    const emailsToInsert = simulatedEmails.map(email => ({
      ...email,
      account_id: account_id,
      folder_id: folderId
    }));

    const { data: savedEmails, error: insertError } = await supabaseClient
      .from('emails')
      .upsert(emailsToInsert, { onConflict: 'account_id,external_id' })
      .select();

    if (insertError) {
      console.error('Error inserting emails:', insertError);
      
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
        JSON.stringify({ error: 'Failed to save emails: ' + insertError.message }),
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
          metadata: { ...job.metadata, emails_synced: emailsToInsert.length }
        })
        .eq('id', job.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: emailsToInsert.length,
        message: `Successfully synced ${emailsToInsert.length} emails` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Sync emails error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
