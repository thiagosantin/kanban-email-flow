
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EmailAccount } from '@/types/email';

export function useEmailAccounts() {
  const { data: accounts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['email_accounts'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('email_accounts')
          .select('*, folders(*)');

        if (error) {
          console.error('Error fetching email accounts:', error);
          toast.error('Failed to load email accounts');
          throw error;
        }

        if (!data) {
          return [];
        }

        // Convert the Supabase result to the correct type
        return (data as any[]).map(account => ({
          ...account,
          folders: Array.isArray(account.folders) ? account.folders : []
        })) as EmailAccount[];
      } catch (err) {
        console.error('Unexpected error in useEmailAccounts:', err);
        toast.error('Failed to load email accounts');
        throw err;
      }
    }
  });

  return { accounts, isLoading, error, refetch };
}
