
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EmailAccount } from '@/types/email';

export function useEmailAccounts() {
  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: ['email_accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_accounts')
        .select('*, folders(*)');

      if (error) {
        toast.error('Failed to load email accounts');
        throw error;
      }

      return data as EmailAccount[];
    }
  });

  return { accounts, isLoading, error };
}
