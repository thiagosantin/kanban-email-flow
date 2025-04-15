
import { supabase } from "@/integrations/supabase/client";

/**
 * Assigns admin role to a specific user
 * @param targetUserId The UUID of the user to be assigned admin role
 * @returns Promise resolving to whether the role assignment was successful
 */
export const assignAdminRole = async (targetUserId: string) => {
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    const { data, error } = await supabase.rpc('assign_admin_role', { 
      target_user_id: targetUserId 
    });

    if (error) throw error;

    return data === true;
  } catch (error) {
    console.error("Error assigning admin role:", error);
    return false;
  }
};

/**
 * Revokes admin role from a specific user
 * @param targetUserId The UUID of the user to have admin role removed
 * @returns Promise resolving to whether the role revocation was successful
 */
export const revokeAdminRole = async (targetUserId: string) => {
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    const { data, error } = await supabase.rpc('revoke_admin_role', { 
      target_user_id: targetUserId 
    });

    if (error) throw error;

    return data === true;
  } catch (error) {
    console.error("Error revoking admin role:", error);
    return false;
  }
};
