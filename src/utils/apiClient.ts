
import { supabase } from "@/integrations/supabase/client";

export const apiClient = {
  triggerScheduledSync: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Unauthorized: User not logged in');
      }
      
      // Check if user is admin
      const { data: isAdmin } = await supabase.rpc('is_admin', { user_id: user.id });
      
      if (!isAdmin) {
        throw new Error('Forbidden: Admin access required');
      }
      
      // Call the scheduled-sync edge function directly
      const { data, error } = await supabase.functions.invoke('scheduled-sync', {
        body: {},
      });
      
      if (error) {
        throw new Error(`Failed to trigger scheduled sync: ${error.message}`);
      }
      
      return { 
        message: `Processed ${data?.results?.length || 0} accounts`, 
        data 
      };
    } catch (error) {
      console.error('Error in triggerScheduledSync:', error);
      throw error;
    }
  }
};
