
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  Mail,
  Folder
} from "lucide-react";
import { EmailAccount } from '@/types/email';
import { useEmailSync } from '@/hooks/useEmailSync';
import { EmailFolderList } from './EmailFolderList';

interface EmailAccountsListProps {
  accounts: EmailAccount[];
  isLoading?: boolean;
}

export function EmailAccountsList({ accounts, isLoading = false }: EmailAccountsListProps) {
  const { syncAccount, syncFolders, isSyncing } = useEmailSync();

  if (!accounts || accounts.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4">
        No email accounts connected
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <div key={account.id} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              <span className="font-medium">{account.email}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncFolders(account.id)}
                disabled={isSyncing[account.id]}
              >
                <Folder className="h-4 w-4 mr-2" />
                {isSyncing[account.id] ? 'Syncing...' : 'Sync Folders'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncAccount(account.id)}
                disabled={isSyncing[account.id]}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing[account.id] ? 'animate-spin' : ''}`} />
                {isSyncing[account.id] ? 'Syncing...' : 'Sync Emails'}
              </Button>
            </div>
          </div>
          
          <EmailFolderList 
            folders={account.folders} 
            isLoading={isSyncing[account.id]} 
          />
        </div>
      ))}
    </div>
  );
}
