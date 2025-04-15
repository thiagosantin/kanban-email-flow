
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EmailAccount } from '@/types/email';

export function useEmailSync() {
  const [isSyncing, setIsSyncing] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  const syncEmailsMutation = useMutation({
    mutationFn: async (accountId: string) => {
      setIsSyncing(prev => ({ ...prev, [accountId]: true }));
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('You must be logged in to sync emails');
        }
        
        const { data, error } = await supabase.functions.invoke('sync-emails', {
          body: { account_id: accountId }
        });
        
        if (error) throw error;
        return data;
      } finally {
        setIsSyncing(prev => ({ ...prev, [accountId]: false }));
      }
    },
    onSuccess: (data, accountId) => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast.success(`Synced ${data.count} emails`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to sync emails: ${error.message}`);
    }
  });

  const syncAllAccounts = async (accounts: EmailAccount[]) => {
    if (!accounts || accounts.length === 0) {
      toast.error('No email accounts configured');
      return;
    }

    for (const account of accounts) {
      await syncEmailsMutation.mutateAsync(account.id);
    }
  };

  return {
    syncAccount: syncEmailsMutation.mutate,
    syncAllAccounts,
    isSyncing
  };
}
