
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import * as ImapFlow from "https://esm.sh/imapflow@1.0.156";

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
    
    if (account.auth_type === "oauth2") {
      // OAuth2 implementation would go here
      // This is a placeholder as actual OAuth2 integration requires more setup
      console.log("OAuth2 folder sync not implemented in this example");
      
      // For demo purposes, create some example folders
      folders = [
        { name: "Inbox", path: "INBOX", type: "inbox" },
        { name: "Sent", path: "SENT", type: "sent" },
        { name: "Drafts", path: "DRAFTS", type: "drafts" },
        { name: "Trash", path: "TRASH", type: "trash" },
        { name: "Spam", path: "SPAM", type: "spam" }
      ];
      
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

      // List all available folders
      const mailboxes = await client.listMailboxes();
      
      const processFolders = (mailboxes, parentPath = '') => {
        const result = [];
        for (const mailbox of mailboxes) {
          const path = parentPath ? `${parentPath}/${mailbox.name}` : mailbox.name;
          let type = 'custom';
          
          // Determine folder type based on common patterns
          const lowerName = mailbox.name.toLowerCase();
          if (lowerName === 'inbox') type = 'inbox';
          else if (lowerName.includes('sent')) type = 'sent';
          else if (lowerName.includes('draft')) type = 'drafts';
          else if (lowerName.includes('trash') || lowerName.includes('deleted')) type = 'trash';
          else if (lowerName.includes('spam') || lowerName.includes('junk')) type = 'spam';
          else if (lowerName.includes('archive')) type = 'archive';
          
          result.push({
            name: mailbox.name,
            path,
            type,
            email_count: mailbox.status?.messages || 0,
            unread_count: mailbox.status?.unseen || 0
          });
          
          if (mailbox.children && mailbox.children.length > 0) {
            result.push(...processFolders(mailbox.children, path));
          }
        }
        return result;
      };
      
      folders = processFolders(mailboxes);
      
      await client.logout();
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
