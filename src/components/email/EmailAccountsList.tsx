
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  Mail,
  Folder,
  ExternalLink
} from "lucide-react";
import { EmailAccount } from '@/types/email';
import { useEmailSync } from '@/hooks/useEmailSync';
import { EmailFolderList } from './EmailFolderList';
import { useNavigate } from 'react-router-dom';

interface EmailAccountsListProps {
  accounts: EmailAccount[];
  isLoading?: boolean;
}

export function EmailAccountsList({ accounts, isLoading = false }: EmailAccountsListProps) {
  const { syncAccount, syncFolders, isSyncing } = useEmailSync();
  const navigate = useNavigate();

  if (!accounts || accounts.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-6 bg-white/80 rounded-lg border border-border/30 shadow-sm flex flex-col items-center justify-center">
        <Mail className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p>Nenhuma conta de email conectada</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {accounts.map((account) => (
        <div key={account.id} className="bg-white/90 backdrop-blur-sm border border-border/30 rounded-lg shadow-sm transition-all hover:shadow-md overflow-hidden">
          <div className="border-b border-border/10 px-5 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-primary">{account.email}</span>
                  <span className="text-xs text-muted-foreground">
                    {account.auth_type === 'oauth2' ? 'OAuth' : account.auth_type === 'imap' ? 'IMAP' : 'POP3'}
                  </span>
                </div>
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
                  {isSyncing[account.id] ? 'Sincronizando...' : 'Sincronizar Pastas'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncAccount(account.id)}
                  disabled={isSyncing[account.id]}
                  className="text-xs flex items-center transition-all hover:bg-primary/5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isSyncing[account.id] ? 'animate-spin' : ''}`} />
                  {isSyncing[account.id] ? 'Sincronizando...' : 'Sincronizar Emails'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="text-xs flex items-center transition-all hover:bg-primary/5"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Ver Kanban
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-4 pt-3">
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
