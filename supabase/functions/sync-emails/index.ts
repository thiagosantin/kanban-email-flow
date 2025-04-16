
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    // Get the account ID from the request
    const { account_id } = await req.json();

    if (!account_id) {
      console.error('Production Test: No account ID provided');
      throw new Error("Account ID is required");
    }

    // Get the email account details with more detailed logging
    const { data: account, error: accountError } = await supabase
      .from("email_accounts")
      .select("*")
      .eq("id", account_id)
      .single();

    if (accountError || !account) {
      console.error('Production Test: Account not found', { 
        account_id, 
        error: accountError 
      });
      throw new Error(`Email account not found: ${accountError?.message}`);
    }

    console.log(`Production Test: Syncing emails for account: ${account.email}`);

    // Update the account's last_synced timestamp
    await supabase
      .from("email_accounts")
      .update({ last_synced: new Date().toISOString() })
      .eq("id", account_id);

    // Create sample emails with more unique identifiers
    const emails = [];
    const baseTimestamp = Date.now();
    
    for (let i = 0; i < 5; i++) {
      const timestamp = baseTimestamp + i;
      emails.push({
        external_id: `prod-sync-${account_id}-${timestamp}`,
        subject: `Production Sync Test Email ${i + 1}`,
        from_email: "test@example.com",
        from_name: "Sync Tester",
        date: new Date().toISOString(),
        preview: `Production sync test email preview ${i + 1}`,
        content: `<p>This is a production sync test email content ${i + 1}</p>`,
        account_id: account_id,
        status: "inbox"
      });
    }

    // Detailed email processing with comprehensive logging
    if (emails.length > 0) {
      for (const email of emails) {
        try {
          const { data: existingEmail } = await supabase
            .from("emails")
            .select("id")
            .eq("external_id", email.external_id)
            .maybeSingle();
          
          if (existingEmail) {
            console.log(`Production Test: Updating existing email: ${email.external_id}`);
            const { error: updateError } = await supabase
              .from("emails")
              .update(email)
              .eq("external_id", email.external_id);
            
            if (updateError) {
              console.error(`Production Test: Failed to update email`, { 
                external_id: email.external_id, 
                error: updateError 
              });
            }
          } else {
            console.log(`Production Test: Inserting new email: ${email.external_id}`);
            const { error: insertError } = await supabase
              .from("emails")
              .insert(email);
            
            if (insertError) {
              console.error(`Production Test: Failed to insert email`, { 
                external_id: email.external_id, 
                error: insertError 
              });
            }
          }
        } catch (processingError) {
          console.error('Production Test: Email processing error', { 
            external_id: email.external_id, 
            error: processingError 
          });
        }
      }

      console.log(`Production Test: Processed ${emails.length} emails`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Synced ${emails.length} emails in production test`, 
          count: emails.length 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 200 
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "No emails to sync in production test", count: 0 }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Production Test: Error in sync-emails function", error);
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
