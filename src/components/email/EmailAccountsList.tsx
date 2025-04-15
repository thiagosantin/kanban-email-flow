
import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MoreHorizontal, 
  RefreshCw, 
  Trash2, 
  Settings, 
  Mail 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEmailSync } from "@/hooks/useEmailSync";
import { EmailAccount } from "@/types/email";
import { format, formatDistanceToNow } from "date-fns";

export function EmailAccountsList() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { syncAccount, syncAllAccounts, isSyncing } = useEmailSync();

  useEffect(() => {
    loadEmailAccounts();
    
    // Listen for changes to the email_accounts table
    const channel = supabase
      .channel('email_accounts_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'email_accounts' 
      }, () => {
        loadEmailAccounts();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadEmailAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_accounts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setAccounts(data || []);
    } catch (error: any) {
      toast.error('Failed to load email accounts: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('email_accounts')
        .delete()
        .eq('id', accountId);
        
      if (error) throw error;
      
      setAccounts(accounts.filter(account => account.id !== accountId));
      toast.success('Email account deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete account: ' + error.message);
    }
  };

  const getProviderLogo = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return 'https://www.google.com/gmail/about/static-2.0/images/logo-gmail.png';
      case 'outlook':
        return 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b';
      default:
        return null;
    }
  };

  const getProviderInitials = (provider: string, email: string) => {
    if (provider === 'gmail') return 'GM';
    if (provider === 'outlook') return 'OL';
    
    // Use email initials for custom providers
    return email.substring(0, 2).toUpperCase();
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return 'bg-red-100 text-red-800';
      case 'outlook':
        return 'bg-blue-100 text-blue-800';
      case 'custom':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastSynced = (lastSynced: string | null) => {
    if (!lastSynced) return 'Never synced';
    
    try {
      const lastSyncedDate = new Date(lastSynced);
      const today = new Date();
      
      if (lastSyncedDate.toDateString() === today.toDateString()) {
        return `Today at ${format(lastSyncedDate, 'HH:mm')}`;
      }
      
      return formatDistanceToNow(lastSyncedDate, { addSuffix: true });
    } catch (e) {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {accounts.length > 0 && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => syncAllAccounts(accounts)}
            disabled={Object.values(isSyncing).some(Boolean)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${Object.values(isSyncing).some(Boolean) ? 'animate-spin' : ''}`} />
            Sync All Accounts
          </Button>
        </div>
      )}
      
      {accounts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">No email accounts connected yet</p>
          </CardContent>
        </Card>
      ) : (
        accounts.map(account => (
          <Card key={account.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getProviderLogo(account.provider)} />
                    <AvatarFallback className={`text-xs ${getProviderColor(account.provider)}`}>
                      {getProviderInitials(account.provider, account.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{account.email}</CardTitle>
                    <CardDescription className="text-xs">
                      {account.provider.charAt(0).toUpperCase() + account.provider.slice(1)} · {account.auth_type.toUpperCase()}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => syncAccount(account.id)}
                      disabled={isSyncing[account.id]}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" /> Sync Now
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" /> Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600" 
                      onClick={() => handleDeleteAccount(account.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-sm text-gray-500">
                <p>Last synced: {formatLastSynced(account.last_synced)}</p>
                <p>Sync interval: Every {account.sync_interval_minutes} minutes</p>
              </div>
            </CardContent>
            <CardFooter className="pt-2 flex justify-between">
              <Badge variant="outline" className={getProviderColor(account.provider)}>
                {account.provider.toUpperCase()}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7"
                onClick={() => syncAccount(account.id)}
                disabled={isSyncing[account.id]}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isSyncing[account.id] ? 'animate-spin' : ''}`} />
                {isSyncing[account.id] ? 'Syncing...' : 'Sync'}
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
}
