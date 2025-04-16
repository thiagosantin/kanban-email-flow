
import { useEmailAccounts } from "@/hooks/useEmailAccounts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailAccountsTable } from "./EmailAccountsTable";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useEmailSync } from "@/hooks/useEmailSync";

export function EmailAccountsPanel() {
  const { accounts, isLoading, error } = useEmailAccounts();
  const { syncAllAccounts, isSyncing } = useEmailSync();

  const handleSyncAll = () => {
    if (accounts && accounts.length > 0) {
      syncAllAccounts(accounts);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Contas de Email Conectadas</CardTitle>
          <CardDescription>
            Visualize todas as contas de email configuradas no sistema
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSyncAll}
          disabled={isLoading || isSyncing["all"] || accounts.length === 0}
        >
          {isSyncing["all"] ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar Todas
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <EmailAccountsTable 
          accounts={accounts}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
