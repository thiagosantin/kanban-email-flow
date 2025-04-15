
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Use type assertion to work around the TypeScript error
          // This is necessary because our Supabase client types don't yet know about the user_roles table
          const { data, error } = await (supabase
            .from('user_roles') as any)
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();
            
          setIsAdmin(!!data);
        }
        
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  return { isAdmin, loading };
}
