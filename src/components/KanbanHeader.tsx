
import React from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEmailSync } from "@/hooks/useEmailSync";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { EmailAccount } from "@/types/email";

export function KanbanHeader({ children }: { children?: React.ReactNode }) {
  const { syncAllAccounts, isSyncing } = useEmailSync();
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('email_accounts')
          .select('*');
          
        if (error) throw error;
        setAccounts(data || []);
      } catch (error: any) {
        console.error('Error fetching accounts:', error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccounts();
  }, []);

  const handleSync = async () => {
    if (accounts.length === 0) {
      toast.error("No email accounts configured");
      return;
    }
    
    await syncAllAccounts(accounts);
  };

  const isSyncingAny = Object.values(isSyncing).some(Boolean);

  return (
    <header className="bg-white border-b border-kanban-gray-200 p-3 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <SidebarTrigger />
          <h1 className="ml-2 text-xl font-semibold text-kanban-gray-900">Kanban do Email</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncingAny || loading}
            className="mr-2"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isSyncingAny ? 'animate-spin' : ''}`} />
            {isSyncingAny ? 'Sincronizando' : 'Sincronizar Emails'}
          </Button>
          
          {children}
        </div>
      </div>
    </header>
  );
}
