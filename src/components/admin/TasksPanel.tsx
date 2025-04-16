
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JobsTable } from "./JobsTable";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useBackgroundJobs } from "@/hooks/useBackgroundJobs";

export function TasksPanel() {
  const { 
    jobs, 
    isLoading, 
    actionLoading, 
    manageJob, 
    refetch,
    triggerScheduledSync,
    isTriggeringSync
  } = useBackgroundJobs();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Gerenciador de Tarefas</CardTitle>
          <CardDescription>
            Gerencie tarefas em background, sincronizações e cron jobs
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerScheduledSync()}
            disabled={isTriggeringSync}
          >
            {isTriggeringSync ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Executar Sincronização
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Carregando' : 'Atualizar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <JobsTable 
          jobs={jobs}
          isLoading={isLoading}
          actionLoading={actionLoading}
          onAction={(jobId, action) => manageJob({ jobId, action })}
        />
      </CardContent>
    </Card>
  );
}
