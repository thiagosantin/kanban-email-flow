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

export const assignAdminToEmail = async (email: string) => {
  try {
    // First get the user's ID
    const { data: userData, error: userError } = await supabase
      .from('email_accounts')
      .select('user_id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      console.error("Error finding user:", userError);
      throw new Error("User not found");
    }

    // Now assign admin role
    const { data, error } = await supabase.rpc('assign_admin_role', { 
      target_user_id: userData.user_id 
    });

    if (error) throw error;

    return data === true;
  } catch (error) {
    console.error("Error assigning admin role:", error);
    throw error;
  }
};
