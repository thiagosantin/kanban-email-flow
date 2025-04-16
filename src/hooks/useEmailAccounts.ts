
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EmailAccount } from '@/types/email';

export function useEmailAccounts() {
  const { data: accounts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['email_accounts'],
    queryFn: async () => {
      try {
        // Check if user is authenticated first
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Authentication error in useEmailAccounts:', authError);
          throw new Error('Authentication error: ' + authError.message);
        }
        
        if (!authData.user) {
          console.warn('No authenticated user found in useEmailAccounts');
          return [];
        }

        const { data, error } = await supabase
          .from('email_accounts')
          .select('*, folders(*)');

        if (error) {
          console.error('Error fetching email accounts:', error);
          toast.error('Failed to load email accounts: ' + error.message);
          throw error;
        }

        if (!data) {
          console.warn('No data returned from email_accounts query');
          return [];
        }

        // Convert the Supabase result to the correct type
        return (data as any[]).map(account => ({
          ...account,
          folders: Array.isArray(account.folders) ? account.folders : []
        })) as EmailAccount[];
      } catch (err: any) {
        console.error('Unexpected error in useEmailAccounts:', err);
        toast.error('Failed to load email accounts: ' + (err.message || 'Unknown error'));
        throw err;
      }
    },
    retry: 2, // Retry failed requests up to 2 times
    refetchOnWindowFocus: false // Don't refetch when window regains focus
  });

  return { accounts, isLoading, error, refetch };
}
