
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EmailAccount } from '@/types/email';
import { cacheService } from '@/utils/cacheService';

export function useEmailAccounts() {
  const cacheKey = 'email_accounts';
  
  const { data: accounts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['email_accounts'],
    queryFn: async () => {
      try {
        // Try to get accounts from cache first
        const cachedData = cacheService.get<EmailAccount[]>(cacheKey);
        if (cachedData) {
          console.log('Using cached email accounts data');
          return cachedData;
        }

        console.log('Cache miss for email accounts, fetching from API');
        
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

        // First, fetch the email accounts
        const { data: accountsData, error: accountsError } = await supabase
          .from('email_accounts')
          .select('*');

        if (accountsError) {
          console.error('Error fetching email accounts:', accountsError);
          toast.error('Failed to load email accounts: ' + accountsError.message);
          throw accountsError;
        }

        if (!accountsData) {
          console.warn('No email accounts data returned');
          return [];
        }

        // Then, for each account, fetch its folders
        const accountsWithFolders = await Promise.all(
          accountsData.map(async (account) => {
            const { data: foldersData, error: foldersError } = await supabase
              .from('email_folders')
              .select('*')
              .eq('account_id', account.id);

            if (foldersError) {
              console.error(`Error fetching folders for account ${account.id}:`, foldersError);
              // Don't fail the whole operation, just return the account without folders
              return {
                ...account,
                folders: []
              };
            }

            return {
              ...account,
              folders: foldersData || []
            };
          })
        );

        // Store data in cache (valid for 5 minutes)
        cacheService.set(cacheKey, accountsWithFolders, 5 * 60 * 1000);
        
        return accountsWithFolders as EmailAccount[];
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
