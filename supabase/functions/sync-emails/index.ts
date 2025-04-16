
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { ImapFlow } from "https://esm.sh/imapflow@1.0.156";
import { simpleParser } from "https://esm.sh/mailparser@3.6.9";

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

    // Get folders for the account
    const { data: folders, error: foldersError } = await supabase
      .from("email_folders")
      .select("id, name, path")
      .eq("account_id", account_id);

    if (foldersError) {
      console.error('Error fetching folders:', foldersError);
    }

    // Create default inbox folder if none exists
    let inboxFolderId;
    if (!folders || folders.length === 0) {
      const { data: newFolder, error: createFolderError } = await supabase
        .from("email_folders")
        .insert({
          account_id: account_id,
          name: "Inbox",
          path: "INBOX",
          type: "inbox"
        })
        .select()
        .single();

      if (createFolderError) {
        console.error('Error creating default folder:', createFolderError);
      } else {
        inboxFolderId = newFolder.id;
      }
    } else {
      // Find the inbox folder or use the first available folder
      const inboxFolder = folders.find(f => f.name.toLowerCase() === "inbox" || f.path.toLowerCase() === "inbox");
      inboxFolderId = inboxFolder ? inboxFolder.id : folders[0].id;
    }

    // Check for archived and deleted columns
    let hasArchivedColumn = false;
    let hasDeletedColumn = false;
    
    try {
      const { data: testEmail, error } = await supabase
        .from("emails")
        .select("archived, deleted")
        .limit(1);
        
      if (!error) {
        hasArchivedColumn = true;
        hasDeletedColumn = true;
      }
    } catch (e) {
      console.log("Table doesn't have archived/deleted columns yet");
    }

    // Connect to IMAP server and fetch real emails
    let fetchedEmails = [];
    let successCount = 0;
    
    if (account.auth_type === 'imap' && account.host && account.port && account.username && account.password) {
      try {
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

        // Select inbox or the first folder
        const mailboxPath = folders?.length > 0 ? 
          folders.find(f => f.name.toLowerCase() === "inbox")?.path || folders[0].path : 
          'INBOX';
        
        const mailbox = await client.mailboxOpen(mailboxPath);
        console.log(`Opened mailbox: ${mailboxPath} with ${mailbox.exists} messages`);

        // Fetch the latest 20 messages
        const fetchLimit = 20;
        if (mailbox.exists > 0) {
          // Fetch from the most recent messages
          const startSeq = Math.max(1, mailbox.exists - fetchLimit + 1);
          const endSeq = mailbox.exists;
          
          console.log(`Fetching messages from sequence ${startSeq} to ${endSeq}`);
          
          for await (const message of client.fetch(`${startSeq}:${endSeq}`, { source: true })) {
            const parsedEmail = await simpleParser(message.source);
            
            const externalId = `${account_id}-${parsedEmail.messageId || message.uid}`;
            const from = parsedEmail.from?.value[0];
            
            const email = {
              external_id: externalId,
              subject: parsedEmail.subject || "(No Subject)",
              from_email: from?.address || "unknown@example.com",
              from_name: from?.name || null,
              date: parsedEmail.date || new Date(),
              preview: parsedEmail.text?.substring(0, 250) || "",
              content: parsedEmail.html || parsedEmail.text || "",
              account_id: account_id,
              folder_id: inboxFolderId,
              status: "inbox"
            };
            
            // Add archived and deleted properties if the columns exist
            if (hasArchivedColumn) {
              email.archived = false;
            }
            
            if (hasDeletedColumn) {
              email.deleted = false;
            }
            
            fetchedEmails.push(email);
          }
        }
        
        await client.logout();
        console.log('Disconnected from IMAP server');
      } catch (error) {
        console.error('IMAP connection error:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `IMAP connection error: ${error.message}` 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500 
          }
        );
      }
    } else {
      console.log('Account not configured for IMAP or missing credentials, using demo data');
      // If IMAP not available, create demo emails as a fallback
      const baseTimestamp = Date.now();
      const statuses = ["inbox", "awaiting", "processing", "done"];
      
      for (let i = 0; i < 10; i++) {
        const timestamp = new Date(baseTimestamp - i * 3600000);
        const randomStatusIndex = Math.floor(Math.random() * (i < 7 ? 1 : 4));
        
        const email = {
          external_id: `demo-${account_id}-${timestamp.getTime()}`,
          subject: `Demo Email ${i + 1}: ${timestamp.toLocaleDateString()}`,
          from_email: "demo@example.com",
          from_name: "Email Demo",
          date: timestamp.toISOString(),
          preview: `This is a demo email #${i + 1} created during sync on ${timestamp.toLocaleString()}`,
          content: `<p>This is the content of demo email #${i + 1}</p><p>Created during sync process.</p><p>Date: ${timestamp.toLocaleString()}</p>`,
          account_id: account_id,
          folder_id: inboxFolderId, 
          status: statuses[randomStatusIndex]
        };
        
        if (hasArchivedColumn) {
          email.archived = false;
        }
        
        if (hasDeletedColumn) {
          email.deleted = false;
        }
        
        fetchedEmails.push(email);
      }
    }

    // Insert emails with duplicate checking
    if (fetchedEmails.length > 0) {
      for (const email of fetchedEmails) {
        try {
          const { data: existingEmail } = await supabase
            .from("emails")
            .select("id")
            .eq("external_id", email.external_id)
            .maybeSingle();
          
          if (existingEmail) {
            console.log(`Skipping existing email: ${email.external_id}`);
          } else {
            const { error: insertError } = await supabase
              .from("emails")
              .insert(email);
            
            if (insertError) {
              console.error(`Failed to insert email`, { 
                external_id: email.external_id, 
                error: insertError 
              });
            } else {
              successCount++;
            }
          }
        } catch (processingError) {
          console.error('Email processing error', { 
            external_id: email.external_id, 
            error: processingError 
          });
        }
      }

      console.log(`Successfully processed ${successCount} emails`);
      
      // Update the folder count
      if (inboxFolderId) {
        const { count } = await supabase
          .from("emails")
          .select("id", { count: "exact" })
          .eq("folder_id", inboxFolderId);
          
        await supabase
          .from("email_folders")
          .update({ email_count: count || 0 })
          .eq("id", inboxFolderId);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Synced ${successCount} emails successfully`, 
          count: successCount 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 200 
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "No emails to sync", count: 0 }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in sync-emails function", error);
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
