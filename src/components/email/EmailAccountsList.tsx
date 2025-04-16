
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Mail, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmailAccount } from "@/types/email";
import { EmailFolderList } from './EmailFolderList';
import { useEmailSync } from '@/hooks/useEmailSync';

interface EmailAccountsListProps {
  accounts: EmailAccount[];
  isLoading: boolean;
}

export function EmailAccountsList({ accounts, isLoading }: EmailAccountsListProps) {
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({});
  const { syncAccount, syncFolders, isSyncing } = useEmailSync();

  const toggleAccount = (accountId: string) => {
    setExpandedAccounts(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const handleSyncAccount = (e: React.MouseEvent, accountId: string) => {
    e.stopPropagation();
    syncAccount(accountId);
  };

  const handleSyncFolders = (e: React.MouseEvent, accountId: string) => {
    e.stopPropagation();
    syncFolders(accountId);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground p-2">
        No email accounts connected
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {accounts.map(account => (
        <div key={account.id} className="space-y-1">
          <div
            className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
            onClick={() => toggleAccount(account.id)}
          >
            <div className="flex items-center">
              {expandedAccounts[account.id] ? (
                <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />
              )}
              <Mail className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium truncate max-w-[140px]">{account.email}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => handleSyncFolders(e, account.id)}
                disabled={isSyncing[account.id]}
                title="Sync Folders"
              >
                <RefreshCw 
                  className={`h-3 w-3 ${isSyncing[account.id] ? 'animate-spin' : ''}`} 
                />
              </Button>
              <Badge variant="outline" className="text-xs">
                {account.provider}
              </Badge>
            </div>
          </div>
          
          {expandedAccounts[account.id] && (
            <EmailFolderList 
              folders={account.folders || []} 
              accountId={account.id} 
            />
          )}
        </div>
      ))}
    </div>
  );
}
