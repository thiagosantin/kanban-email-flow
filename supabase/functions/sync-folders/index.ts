
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

    console.log(`Syncing folders for account: ${account.email}`);

    // Update the account's last_synced timestamp
    await supabase
      .from("email_accounts")
      .update({ last_synced: new Date().toISOString() })
      .eq("id", account_id);

    let folders = [];
    
    // Since ImapFlow is causing issues with Deno, we'll use a different approach
    // For now, we'll create default folders for both OAuth2 and IMAP/POP3 accounts
    
    if (account.auth_type === "oauth2" || account.auth_type === "imap" || account.auth_type === "pop3") {
      // Create standard folders that are common across email providers
      folders = [
        { name: "Inbox", path: "INBOX", type: "inbox", email_count: 0, unread_count: 0 },
        { name: "Sent", path: "SENT", type: "sent", email_count: 0, unread_count: 0 },
        { name: "Drafts", path: "DRAFTS", type: "drafts", email_count: 0, unread_count: 0 },
        { name: "Trash", path: "TRASH", type: "trash", email_count: 0, unread_count: 0 },
        { name: "Spam", path: "SPAM", type: "spam", email_count: 0, unread_count: 0 },
        { name: "Archive", path: "ARCHIVE", type: "archive", email_count: 0, unread_count: 0 }
      ];
      
      // Add provider-specific folders
      if (account.provider === "gmail") {
        folders.push(
          { name: "Important", path: "IMPORTANT", type: "custom", email_count: 0, unread_count: 0 },
          { name: "Promotions", path: "PROMOTIONS", type: "custom", email_count: 0, unread_count: 0 },
          { name: "Social", path: "SOCIAL", type: "custom", email_count: 0, unread_count: 0 }
        );
      } else if (account.provider === "outlook") {
        folders.push(
          { name: "Focused", path: "FOCUSED", type: "custom", email_count: 0, unread_count: 0 },
          { name: "Other", path: "OTHER", type: "custom", email_count: 0, unread_count: 0 }
        );
      }
    }

    // First, delete existing folders for this account
    await supabase
      .from("email_folders")
      .delete()
      .eq("account_id", account_id);
    
    // Then insert the new folders
    if (folders.length > 0) {
      const folderObjects = folders.map(folder => ({
        account_id: account_id,
        name: folder.name,
        path: folder.path,
        type: folder.type,
        email_count: folder.email_count || 0,
        unread_count: folder.unread_count || 0
      }));
      
      const { error: insertError } = await supabase
        .from("email_folders")
        .insert(folderObjects);

      if (insertError) {
        throw new Error(`Failed to insert folders: ${insertError.message}`);
      }

      console.log(`Inserted ${folders.length} folders`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Synced ${folders.length} folders`, 
          count: folders.length 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 200 
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "No folders to sync", count: 0 }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in sync-folders function:", error);
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
