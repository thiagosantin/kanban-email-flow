
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EmailAccount } from '@/types/email';
import { cacheService } from '@/utils/cacheService';

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
        
        console.log('Syncing emails for account:', accountId);
        
        // Use direct Supabase Functions invoke method
        const { data, error } = await supabase.functions.invoke('sync-emails', {
          body: { account_id: accountId }
        });
        
        if (error) {
          console.error('Error response from Edge Function:', error);
          throw new Error(`Failed to sync emails: ${error.message}`);
        }
        
        if (!data) {
          console.error('Edge Function returned no data');
          throw new Error('Failed to sync emails: No data returned');
        }
        
        if (data.error) {
          console.error('Edge Function returned error:', data.error);
          throw new Error(`Failed to sync emails: ${data.error}`);
        }
        
        return data;
      } finally {
        setIsSyncing(prev => ({ ...prev, [accountId]: false }));
      }
    },
    onSuccess: (data, accountId) => {
      // Clear relevant cache keys
      const keysToDelete = cacheService.keys().filter(key => 
        key.startsWith('emails_') || key === 'email_accounts'
      );
      
      keysToDelete.forEach(key => cacheService.delete(key));
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email_folders'] });
      queryClient.invalidateQueries({ queryKey: ['email_accounts'] });
      
      // Show success message
      if (data.count > 0) {
        toast.success(`Sincronizados ${data.count} emails com sucesso`);
      } else {
        toast.info('Nenhum novo email encontrado para sincronizar');
      }
    },
    onError: (error: Error) => {
      console.error('Failed to sync emails:', error);
      toast.error(`Falha ao sincronizar emails: ${error.message}`);
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
        
        // Use direct Supabase Functions invoke method
        const { data, error } = await supabase.functions.invoke('sync-folders', {
          body: { account_id: accountId }
        });
        
        if (error) {
          console.error('Error response from Edge Function:', error);
          throw new Error(`Failed to sync folders: ${error.message}`);
        }
        
        if (!data) {
          console.error('Edge Function returned no data');
          throw new Error('Failed to sync folders: No data returned');
        }
        
        if (data.error) {
          console.error('Edge Function returned error:', data.error);
          throw new Error(`Failed to sync folders: ${data.error}`);
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
      // Clear cache and invalidate queries
      cacheService.delete('email_accounts');
      queryClient.invalidateQueries({ queryKey: ['email_folders'] });
      queryClient.invalidateQueries({ queryKey: ['email_accounts'] });
      
      // Show success message
      if (data.count > 0) {
        toast.success(`Sincronizadas ${data.count} pastas com sucesso`);
      } else {
        toast.info('Nenhuma nova pasta encontrada para sincronizar');
      }
    },
    onError: (error: Error) => {
      console.error('Folder sync error:', error);
      toast.error(`Falha ao sincronizar pastas: ${error.message}`);
    }
  });

  const syncAllAccounts = async (accounts: EmailAccount[]) => {
    if (!accounts || accounts.length === 0) {
      toast.error('Nenhuma conta de email configurada');
      return;
    }

    setIsSyncing(prev => ({ ...prev, ["all"]: true }));
    
    try {
      toast.info(`Iniciando sincronização de ${accounts.length} contas de email...`);
      
      // First sync folders for all accounts
      for (const account of accounts) {
        try {
          await syncFoldersMutation.mutateAsync(account.id);
        } catch (error) {
          console.error(`Failed to sync folders for account ${account.email}:`, error);
        }
      }
      
      // Then sync emails for all accounts
      for (const account of accounts) {
        try {
          await syncEmailsMutation.mutateAsync(account.id);
        } catch (error) {
          console.error(`Failed to sync emails for account ${account.email}:`, error);
        }
      }
      
      // Clear cache after all syncs are done
      try {
        const keysToDelete = cacheService.keys().filter(key => 
          key.startsWith('emails_') || key === 'email_accounts'
        );
        
        keysToDelete.forEach(key => cacheService.delete(key));
        
        toast.success('Sincronização completa para todas as contas');
      } catch (error: any) {
        toast.error(`Erro ao sincronizar contas: ${error.message}`);
      }
    } catch (error: any) {
      toast.error(`Erro ao sincronizar contas: ${error.message}`);
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
