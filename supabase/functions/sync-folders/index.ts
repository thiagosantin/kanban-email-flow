
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { ImapFlow } from "https://esm.sh/imapflow@1.0.156";

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

    let folders = [];
    
    if (account.auth_type === 'imap' && account.host && account.port && account.username && account.password) {
      try {
        // Connect to IMAP server and list folders
        const client = new ImapFlow({
          host: account.host,
          port: account.port,
          secure: account.port === 993, // Use TLS for port 993
          auth: {
            user: account.username,
            pass: account.password
          },
          logger: false
        });

        await client.connect();
        console.log('Connected to IMAP server');
        
        // List all available mailboxes/folders
        const mailboxes = await client.listMailboxes();
        console.log('Found mailboxes:', mailboxes);
        
        // Process all mailboxes
        const processFolders = (list, path = '') => {
          list.forEach(mailbox => {
            // Skip special folders
            if (mailbox.specialUse === '\\Noselect') return;
            
            const folderPath = path ? `${path}/${mailbox.name}` : mailbox.name;
            
            // Determine folder type
            let folderType = 'custom';
            if (mailbox.specialUse === '\\Inbox' || mailbox.name.toLowerCase() === 'inbox') {
              folderType = 'inbox';
            } else if (mailbox.specialUse === '\\Sent' || mailbox.name.toLowerCase().includes('sent')) {
              folderType = 'sent';
            } else if (mailbox.specialUse === '\\Drafts' || mailbox.name.toLowerCase().includes('draft')) {
              folderType = 'drafts';
            } else if (mailbox.specialUse === '\\Trash' || mailbox.name.toLowerCase().includes('trash')) {
              folderType = 'trash';
            } else if (mailbox.specialUse === '\\Junk' || mailbox.name.toLowerCase().includes('spam') || mailbox.name.toLowerCase().includes('junk')) {
              folderType = 'spam';
            } else if (mailbox.specialUse === '\\Archive' || mailbox.name.toLowerCase().includes('archive')) {
              folderType = 'archive';
            }
            
            folders.push({
              name: mailbox.name,
              path: folderPath,
              type: folderType,
              account_id: account_id
            });
            
            // Process children recursively if they exist
            if (mailbox.children) {
              processFolders(mailbox.children, folderPath);
            }
          });
        };
        
        processFolders(mailboxes);
        await client.logout();
        console.log('Disconnected from IMAP server');
      } catch (error) {
        console.error('IMAP connection error:', error);
        throw new Error(`IMAP connection error: ${error.message}`);
      }
    }
    
    // If no folders were found or IMAP connection failed, create default folders
    if (folders.length === 0) {
      console.log('No folders found from IMAP, creating defaults');
      folders = [
        { name: 'Inbox', path: 'INBOX', type: 'inbox', account_id },
        { name: 'Sent', path: 'Sent', type: 'sent', account_id },
        { name: 'Drafts', path: 'Drafts', type: 'drafts', account_id },
        { name: 'Trash', path: 'Trash', type: 'trash', account_id },
        { name: 'Spam', path: 'Spam', type: 'spam', account_id },
        { name: 'Archive', path: 'Archive', type: 'archive', account_id }
      ];
    }

    // Insert folders into the database, skipping existing ones
    let insertedCount = 0;
    for (const folder of folders) {
      const { data: existingFolder } = await supabase
        .from("email_folders")
        .select("id")
        .eq("account_id", account_id)
        .eq("path", folder.path)
        .maybeSingle();
      
      if (!existingFolder) {
        const { error: insertError } = await supabase
          .from("email_folders")
          .insert(folder);
        
        if (insertError) {
          console.error('Error inserting folder:', insertError);
        } else {
          insertedCount++;
        }
      }
    }

    // Update the account's last_synced timestamp
    await supabase
      .from("email_accounts")
      .update({ last_synced: new Date().toISOString() })
      .eq("id", account_id);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${insertedCount} folders successfully`,
        count: insertedCount
      }),
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
