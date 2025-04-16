
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmailAccount } from "@/types/email";
import { useEmailSync } from "@/hooks/useEmailSync";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";
import { toast } from "sonner";
import { apiClient } from "@/utils/apiClient";

export function EmailSyncManager() {
  const { accounts, isLoading: accountsLoading } = useEmailAccounts();
  const { syncAccount, syncFolders, syncAllAccounts, isSyncing } = useEmailSync();
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [triggeringSched, setTriggeringSched] = useState(false);

  const handleSyncAll = async () => {
    try {
      await syncAllAccounts(accounts);
      setLastSyncTime(new Date().toLocaleString());
      toast.success('All accounts synced successfully');
    } catch (error) {
      console.error('Sync all error:', error);
      toast.error('Failed to sync all accounts');
    }
  };

  const handleTriggerEdgeFunction = async () => {
    try {
      setTriggeringSched(true);
      toast.info('Triggering scheduled sync function...');
      
      const result = await apiClient.triggerScheduledSync();
      toast.success(`Scheduled sync triggered: ${result.message}`);
      setLastSyncTime(new Date().toLocaleString());
    } catch (error) {
      console.error('Failed to trigger scheduled sync:', error);
      toast.error(`Failed to trigger scheduled sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTriggeringSched(false);
    }
  };

  const formatSyncTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Synchronization</CardTitle>
        <CardDescription>
          Manage email synchronization for all connected accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Connected Accounts</h3>
              <p className="text-sm text-muted-foreground">
                {accountsLoading 
                  ? 'Loading accounts...' 
                  : `${accounts.length} email accounts connected`}
              </p>
            </div>
            <div>
              {lastSyncTime && (
                <Badge variant="outline" className="ml-2">
                  Last sync: {lastSyncTime}
                </Badge>
              )}
            </div>
          </div>

          <div className="border rounded-lg divide-y">
            {accountsLoading ? (
              <div className="p-4 text-center">Loading accounts...</div>
            ) : accounts.length === 0 ? (
              <div className="p-4 text-center">No email accounts connected</div>
            ) : (
              accounts.map((account) => (
                <div key={account.id} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{account.email}</div>
                    <div className="text-sm text-muted-foreground">
                      {account.provider} · {account.auth_type} · 
                      Last synced: {formatSyncTime(account.last_synced)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => syncFolders(account.id)}
                      disabled={isSyncing[account.id]}
                    >
                      {isSyncing[account.id] ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Sync Folders
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => syncAccount(account.id)}
                      disabled={isSyncing[account.id]}
                    >
                      {isSyncing[account.id] ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Sync Emails
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleTriggerEdgeFunction}
          disabled={triggeringSched}
        >
          {triggeringSched ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <AlertTriangle className="mr-2 h-4 w-4" />
          )}
          Trigger Scheduled Sync
        </Button>
        <Button 
          onClick={handleSyncAll}
          disabled={accountsLoading || accounts.length === 0 || Object.values(isSyncing).some(Boolean)}
        >
          {Object.values(isSyncing).some(Boolean) ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Sync All Accounts
        </Button>
      </CardFooter>
    </Card>
  );
}
