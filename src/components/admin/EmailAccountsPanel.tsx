
import { useEmailAccounts } from "@/hooks/useEmailAccounts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailAccountsTable } from "./EmailAccountsTable";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useEmailSync } from "@/hooks/useEmailSync";

export function EmailAccountsPanel() {
  const { accounts, isLoading, error, refetch } = useEmailAccounts();
  const { syncAllAccounts, isSyncing } = useEmailSync();

  const handleSyncAll = () => {
    if (accounts && accounts.length > 0) {
      syncAllAccounts(accounts);
    }
  };

  const handleRetry = () => {
    refetch();
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
        <div className="flex gap-2">
          {error && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
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
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Erro ao carregar contas de email. Por favor, tente novamente.</span>
          </div>
        )}
        <EmailAccountsTable 
          accounts={accounts}
          isLoading={isLoading}
          error={error}
        />
      </CardContent>
    </Card>
  );
}
