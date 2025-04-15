
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import * as ImapFlow from "https://esm.sh/imapflow@1.0.156";
import { simpleParser } from "https://esm.sh/mailparser@3.6.5";

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
      throw new Error("Account ID is required");
    }

    // Get the email account details
    const { data: account, error: accountError } = await supabase
      .from("email_accounts")
      .select("*")
      .eq("id", account_id)
      .single();

    if (accountError || !account) {
      throw new Error(`Email account not found: ${accountError?.message}`);
    }

    console.log(`Syncing emails for account: ${account.email}`);

    // Update the account's last_synced timestamp
    await supabase
      .from("email_accounts")
      .update({ last_synced: new Date().toISOString() })
      .eq("id", account_id);

    // Connect to the email server based on the account type
    let emails = [];
    
    if (account.auth_type === "oauth2") {
      // OAuth2 implementation would go here
      // This is a placeholder as actual OAuth2 integration requires more setup
      console.log("OAuth2 sync not implemented in this example");
    } else if (account.auth_type === "imap" || account.auth_type === "pop3") {
      // Connect to IMAP server
      const client = new ImapFlow.ImapFlow({
        host: account.host,
        port: account.port,
        secure: true,
        auth: {
          user: account.username || account.email,
          pass: account.password,
        },
        logger: false
      });

      await client.connect();

      // Select the inbox folder
      const mailbox = await client.mailboxOpen('INBOX');
      console.log(`Mailbox has ${mailbox.exists} messages`);

      // Get the last 10 messages (for demo purposes)
      const messages = await client.fetch('1:10', { envelope: true, source: true });
      
      for await (const message of messages) {
        const parsed = await simpleParser(message.source);
        
        emails.push({
          external_id: message.envelope.messageId,
          subject: parsed.subject || "No Subject",
          from_email: parsed.from?.value[0]?.address || "",
          from_name: parsed.from?.value[0]?.name || "",
          date: parsed.date?.toISOString() || new Date().toISOString(),
          preview: parsed.text?.substring(0, 200) || "",
          content: parsed.html || parsed.text || "",
          account_id: account_id,
          status: "inbox"
        });
      }

      await client.logout();
    }

    // Insert the emails into the database, ignoring duplicates
    if (emails.length > 0) {
      const { data: insertedEmails, error: insertError } = await supabase
        .from("emails")
        .upsert(emails, { 
          onConflict: "external_id",
          ignoreDuplicates: true 
        });

      if (insertError) {
        throw new Error(`Failed to insert emails: ${insertError.message}`);
      }

      console.log(`Inserted ${emails.length} emails`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Synced ${emails.length} emails`, 
          count: emails.length 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 200 
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "No new emails to sync", count: 0 }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in sync-emails function:", error);
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
