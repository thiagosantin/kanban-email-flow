
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TaskAction {
  action: "start" | "pause" | "retry" | "delete";
  taskId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    const { action, taskId }: TaskAction = await req.json();

    // Log the action being performed
    console.log(`Processing task action: ${action} for task: ${taskId}`);

    let newStatus;
    switch (action) {
      case "start":
        newStatus = "running";
        break;
      case "pause":
        newStatus = "pending";
        break;
      case "retry":
        newStatus = "running";
        break;
      case "delete":
        // Delete the task
        const { error: deleteError } = await supabase
          .from("background_jobs")
          .delete()
          .eq("id", taskId);

        if (deleteError) throw deleteError;

        return new Response(
          JSON.stringify({ success: true, message: "Task deleted successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      default:
        throw new Error("Invalid action");
    }

    // Update task status
    const { data: result, error: updateError } = await supabase.rpc(
      "update_job_status",
      {
        p_job_id: taskId,
        p_status: newStatus,
      }
    );

    if (updateError) throw updateError;

    // If the action was "start" and it's an email sync task, trigger the sync
    if ((action === "start" || action === "retry") && newStatus === "running") {
      const { data: task } = await supabase
        .from("background_jobs")
        .select("type, account_id")
        .eq("id", taskId)
        .single();

      if (task?.type === "email_sync" && task.account_id) {
        // Trigger email sync
        const syncResponse = await fetch(
          `${supabaseUrl}/functions/v1/sync-emails`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceRole}`
            },
            body: JSON.stringify({ account_id: task.account_id })
          }
        );
        
        if (!syncResponse.ok) {
          const errorResponse = await syncResponse.json();
          throw new Error(`Failed to trigger email sync: ${errorResponse.error || "Unknown error"}`);
        }
        
        // Mark the job as completed after successful sync
        await supabase.rpc(
          "update_job_status",
          {
            p_job_id: taskId,
            p_status: "completed",
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in admin-manage-tasks function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
