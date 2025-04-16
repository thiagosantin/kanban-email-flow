
import React from "react";
import { 
  RefreshCw, 
  PlayCircle,
  PauseCircle,
  Trash,
  AlertTriangle
} from "lucide-react";
import { BackgroundJob } from "@/types/email";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface JobsTableProps {
  jobs: (BackgroundJob & { email_accounts?: { email: string } })[];
  isLoading: boolean;
  actionLoading: Record<string, boolean>;
  onAction: (jobId: string, action: string) => void;
}

export function JobsTable({ jobs, isLoading, actionLoading, onAction }: JobsTableProps) {
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('pt-BR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: BackgroundJob["status"]) => {
    switch (status) {
      case "running":
        return <Badge className="bg-green-500">Ativo</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Pendente</Badge>;
      case "failed":
        return <Badge variant="destructive">Falhou</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Completo</Badge>;
      case "cancelled":
        return <Badge variant="outline">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getTaskTypeIcon = (type: BackgroundJob["type"]) => {
    switch (type) {
      case "email_sync":
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case "cleanup":
        return <RefreshCw className="h-4 w-4 text-amber-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-purple-500" />;
    }
  };

  const getTaskName = (job: BackgroundJob & { email_accounts?: { email: string } }) => {
    switch (job.type) {
      case "email_sync":
        return `Sync: ${job.email_accounts?.email || 'Unknown email'}`;
      case "cleanup":
        return "System Cleanup";
      case "report_generation":
        return "Report Generation";
      default:
        return `Job: ${job.type}`;
    }
  };

  const getTaskFrequency = (job: BackgroundJob) => {
    return job.schedule || 'One-time';
  };

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center items-center">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma tarefa encontrada
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">Tipo</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Última Execução</TableHead>
          <TableHead>Próxima Execução</TableHead>
          <TableHead>Frequência</TableHead>
          <TableHead>Usuário</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <React.Fragment key={job.id}>
            <TableRow>
              <TableCell>{getTaskTypeIcon(job.type)}</TableCell>
              <TableCell className="font-medium">{getTaskName(job)}</TableCell>
              <TableCell>{getStatusBadge(job.status)}</TableCell>
              <TableCell>{formatDateTime(job.started_at)}</TableCell>
              <TableCell>{formatDateTime(job.next_run_at)}</TableCell>
              <TableCell>{getTaskFrequency(job)}</TableCell>
              <TableCell>{job.user_id || 'System'}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  {job.status === "running" ? (
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => onAction(job.id, "pause")}
                      disabled={actionLoading[job.id]}
                    >
                      {actionLoading[job.id] ? 
                        <RefreshCw className="h-4 w-4 animate-spin" /> : 
                        <PauseCircle className="h-4 w-4" />
                      }
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => onAction(job.id, "start")}
                      disabled={actionLoading[job.id]}
                    >
                      {actionLoading[job.id] ? 
                        <RefreshCw className="h-4 w-4 animate-spin" /> : 
                        <PlayCircle className="h-4 w-4" />
                      }
                    </Button>
                  )}
                  
                  {job.status === "failed" && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => onAction(job.id, "retry")}
                      disabled={actionLoading[job.id]}
                    >
                      {actionLoading[job.id] ? 
                        <RefreshCw className="h-4 w-4 animate-spin" /> : 
                        <RefreshCw className="h-4 w-4" />
                      }
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onAction(job.id, "delete")}
                    disabled={actionLoading[job.id]}
                    className="text-red-500 hover:text-red-600"
                  >
                    {actionLoading[job.id] ? 
                      <RefreshCw className="h-4 w-4 animate-spin" /> : 
                      <Trash className="h-4 w-4" />
                    }
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            
            {job.error && (
              <TableRow className="bg-red-50">
                <TableCell colSpan={8} className="py-2 px-4 text-red-600 text-sm flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {job.error}
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
}
