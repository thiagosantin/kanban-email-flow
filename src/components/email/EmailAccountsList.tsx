
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
      <div className="text-sm text-muted-foreground p-4 bg-white/50 rounded-lg border border-border/30 shadow-sm">
        No email accounts connected
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <div key={account.id} className="bg-white/80 backdrop-blur-sm border border-border/30 rounded-lg p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium text-primary">{account.email}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncFolders(account.id)}
                disabled={isSyncing[account.id]}
                className="text-xs flex items-center transition-all hover:bg-primary/5"
              >
                <Folder className="h-3.5 w-3.5 mr-1.5" />
                {isSyncing[account.id] ? 'Syncing...' : 'Sync Folders'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncAccount(account.id)}
                disabled={isSyncing[account.id]}
                className="text-xs flex items-center transition-all hover:bg-primary/5"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isSyncing[account.id] ? 'animate-spin' : ''}`} />
                {isSyncing[account.id] ? 'Syncing...' : 'Sync Emails'}
              </Button>
            </div>
          </div>
          
          <div className="pl-2 mt-4 border-t border-border/20 pt-3">
            <EmailFolderList 
              folders={account.folders} 
              isLoading={isSyncing[account.id]} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}
