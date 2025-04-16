
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
      console.error('Failed to sync emails:', error);
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
        
        console.log('Syncing folders for account:', accountId);
        const { data, error } = await supabase.functions.invoke('sync-folders', {
          body: { account_id: accountId }
        });
        
        if (error) {
          console.error('Error from Edge Function:', error);
          throw new Error(`Failed to sync folders: ${error.message}`);
        }
        
        if (!data || data.error) {
          console.error('Edge Function returned error:', data?.error);
          throw new Error(`Failed to sync folders: ${data?.error || 'Unknown error'}`);
        }
        
        return data;
      } catch (error: any) {
        console.error('Error in syncFolders:', error);
        throw error;
      } finally {
        setIsSyncing(prev => ({ ...prev, [accountId]: false }));
      }
    },
    onSuccess: (data, accountId) => {
      queryClient.invalidateQueries({ queryKey: ['email_accounts'] });
      toast.success(`Synced ${data.count} folders successfully`);
    },
    onError: (error: Error) => {
      console.error('Folder sync error:', error);
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
      // First sync folders for all accounts
      for (const account of accounts) {
        try {
          await syncFoldersMutation.mutateAsync(account.id);
        } catch (error) {
          console.error(`Failed to sync folders for account ${account.email}:`, error);
          // Continue with next account
        }
      }
      
      // Then sync emails for all accounts
      for (const account of accounts) {
        try {
          await syncEmailsMutation.mutateAsync(account.id);
        } catch (error) {
          console.error(`Failed to sync emails for account ${account.email}:`, error);
          // Continue with next account
        }
      }
      
      toast.success('Sync completed for all accounts');
    } catch (error: any) {
      toast.error(`Error syncing accounts: ${error.message}`);
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
