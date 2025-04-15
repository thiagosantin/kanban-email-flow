
import React from "react";
import { RefreshCw, PlayCircle, PauseCircle, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types/admin";
import { AlertTriangle, Activity, Clock, Zap } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  actionLoading: Record<string, boolean>;
  onTaskAction: (taskId: string, action: string) => void;
}

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

const getStatusBadge = (status: Task["status"]) => {
  switch (status) {
    case "running":
      return <Badge className="bg-green-500">Ativo</Badge>;
    case "paused":
      return <Badge variant="outline" className="text-amber-500 border-amber-500">Pausado</Badge>;
    case "failed":
      return <Badge variant="destructive">Falhou</Badge>;
    case "completed":
      return <Badge className="bg-blue-500">Completo</Badge>;
    default:
      return <Badge variant="outline">Desconhecido</Badge>;
  }
};

const getTaskTypeIcon = (type: Task["type"]) => {
  switch (type) {
    case "sync":
      return <RefreshCw className="h-4 w-4 text-blue-500" />;
    case "cron":
      return <Clock className="h-4 w-4 text-amber-500" />;
    case "background":
      return <Zap className="h-4 w-4 text-purple-500" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

export function TaskList({ tasks, loading, actionLoading, onTaskAction }: TaskListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciador de Tarefas</CardTitle>
        <CardDescription>
          Gerencie tarefas em background, sincronizações e cron jobs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 flex justify-center items-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
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
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Nenhuma tarefa encontrada
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <React.Fragment key={task.id}>
                    <TableRow>
                      <TableCell>{getTaskTypeIcon(task.type)}</TableCell>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>{formatDateTime(task.last_run)}</TableCell>
                      <TableCell>{formatDateTime(task.next_run)}</TableCell>
                      <TableCell>{task.frequency}</TableCell>
                      <TableCell>{task.owner_email}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          {task.status === "running" ? (
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => onTaskAction(task.id, "pause")}
                              disabled={actionLoading[task.id]}
                            >
                              {actionLoading[task.id] ? 
                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                <PauseCircle className="h-4 w-4" />
                              }
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => onTaskAction(task.id, "start")}
                              disabled={actionLoading[task.id]}
                            >
                              {actionLoading[task.id] ? 
                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                <PlayCircle className="h-4 w-4" />
                              }
                            </Button>
                          )}
                          
                          {task.status === "failed" && (
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => onTaskAction(task.id, "retry")}
                              disabled={actionLoading[task.id]}
                            >
                              {actionLoading[task.id] ? 
                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                <RefreshCw className="h-4 w-4" />
                              }
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => onTaskAction(task.id, "delete")}
                            disabled={actionLoading[task.id]}
                            className="text-red-500 hover:text-red-600"
                          >
                            {actionLoading[task.id] ? 
                              <RefreshCw className="h-4 w-4 animate-spin" /> : 
                              <Trash className="h-4 w-4" />
                            }
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {task.error && (
                      <TableRow className="bg-red-50">
                        <TableCell colSpan={8} className="py-2 px-4 text-red-600 text-sm flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          {task.error}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
