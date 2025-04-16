
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

  const syncFoldersMutation = useMutation({
    mutationFn: async (accountId: string) => {
      setIsSyncing(prev => ({ ...prev, [accountId]: true }));
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('You must be logged in to sync folders');
        }
        
        const { data, error } = await supabase.functions.invoke('sync-folders', {
          body: { account_id: accountId }
        });
        
        if (error) throw error;
        return data;
      } finally {
        setIsSyncing(prev => ({ ...prev, [accountId]: false }));
      }
    },
    onSuccess: (data, accountId) => {
      queryClient.invalidateQueries({ queryKey: ['email_accounts'] });
      toast.success(`Synced ${data.count} folders`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to sync folders: ${error.message}`);
    }
  });

  const syncAllAccounts = async (accounts: EmailAccount[]) => {
    if (!accounts || accounts.length === 0) {
      toast.error('No email accounts configured');
      return;
    }

    setIsSyncing(prev => ({ ...prev, ["all"]: true }));
    
    try {
      for (const account of accounts) {
        await syncEmailsMutation.mutateAsync(account.id);
      }
    } finally {
      setIsSyncing(prev => ({ ...prev, ["all"]: false }));
    }
  };

  return {
    syncAccount: syncEmailsMutation.mutate,
    syncFolders: syncFoldersMutation.mutate,
    syncAllAccounts,
    isSyncing
  };
}
