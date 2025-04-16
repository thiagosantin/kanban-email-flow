import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Activity, 
  Clock, 
  Database, 
  LayoutDashboard, 
  Server, 
  Settings, 
  Users, 
  Zap,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Trash,
  AlertTriangle,
  Mail
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";
import { EmailAccount } from "@/types/email";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SuperAdminSidebar } from "@/components/SuperAdminSidebar";
import { OAuthHelpDialog } from "@/components/OAuthHelpDialog";
import { OAuthConfigurationForm } from "@/components/admin/OAuthConfigurationForm";
import { SystemLogsViewer } from "@/components/admin/SystemLogsViewer";

type Task = {
  id: string;
  name: string;
  status: "running" | "paused" | "failed" | "completed";
  type: "sync" | "cron" | "background";
  created_at: string;
  updated_at: string;
  owner_id: string;
  owner_email: string;
  last_run: string | null;
  next_run: string | null;
  frequency: string;
  error?: string | null;
};

type SystemStats = {
  activeUsers: number;
  totalTasks: number;
  activeTasks: number;
  failedTasks: number;
  emailAccounts: number;
  avgSyncTime: number;
};

const SuperAdmin = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    activeUsers: 0,
    totalTasks: 0,
    activeTasks: 0,
    failedTasks: 0,
    emailAccounts: 0,
    avgSyncTime: 2.3,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [oauthConfigs, setOauthConfigs] = useState<Record<string, any>>({});

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Acesso não autorizado");
        navigate("/auth");
        return;
      }
      
      fetchData();
    };
    
    checkAuthAndFetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: accountsData, error: accountsError } = await supabase
        .from('email_accounts')
        .select('*');
        
      if (accountsError) throw accountsError;
      
      const emailAccounts = accountsData as EmailAccount[] || [];
      setAccounts(emailAccounts);
      
      const { data: tasksData, error: tasksError } = await supabase
        .from('background_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;
      
      const tasks = tasksData || [];
      setTasks(tasks);
      
      setStats({
        activeUsers: 2,
        totalTasks: tasks.length,
        activeTasks: tasks.filter(t => t.status === "running").length,
        failedTasks: tasks.filter(t => t.status === "failed").length,
        emailAccounts: emailAccounts.length,
        avgSyncTime: 2.3
      });
      
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const fetchOAuthConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('oauth_configurations')
        .select('*');
        
      if (error) throw error;
      
      const configsByProvider = data.reduce((acc: Record<string, any>, config) => {
        acc[config.provider] = config;
        return acc;
      }, {});
      
      setOauthConfigs(configsByProvider);
    } catch (error) {
      console.error('Error fetching OAuth configs:', error);
      toast.error('Failed to load OAuth configurations');
    }
  };

  useEffect(() => {
    fetchOAuthConfigs();
  }, []);

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

  const handleTaskAction = async (taskId: string, action: string) => {
    setActionLoading(prev => ({ ...prev, [taskId]: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-tasks', {
        body: { taskId, action }
      });

      if (error) throw error;
      
      await fetchData(); // Refresh data after action
      toast.success(`Task ${action} successful`);
    } catch (error: any) {
      console.error(`Error performing ${action} on task:`, error.message);
      toast.error(`Error: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [taskId]: false }));
    }
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-kanban-gray-100">
        <SuperAdminSidebar />
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="bg-white border-b border-kanban-gray-200 p-3 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-kanban-gray-900">Painel de Super Administrador</h1>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchData}
                  disabled={loading}
                  className="mr-2"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Carregando' : 'Atualizar Dados'}
                </Button>
              </div>
            </div>
          </header>
          
          <div className="p-4 md:p-6 flex-1 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeUsers}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tarefas Ativas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeTasks}/{stats.totalTasks}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Contas de Email</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.emailAccounts}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tarefas com Erro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">{stats.failedTasks}</div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="tasks">Tarefas & Cron Jobs</TabsTrigger>
                <TabsTrigger value="accounts">Contas de Email</TabsTrigger>
                <TabsTrigger value="system">Estatísticas do Sistema</TabsTrigger>
                <TabsTrigger value="logs">Logs do Sistema</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tasks">
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
                                          onClick={() => handleTaskAction(task.id, "pause")}
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
                                          onClick={() => handleTaskAction(task.id, "start")}
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
                                          onClick={() => handleTaskAction(task.id, "retry")}
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
                                        onClick={() => handleTaskAction(task.id, "delete")}
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
              </TabsContent>
              
              <TabsContent value="accounts">
                <Card>
                  <CardHeader>
                    <CardTitle>Contas de Email Conectadas</CardTitle>
                    <CardDescription>
                      Visualize todas as contas de email configuradas no sistema
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
                            <TableHead>Email</TableHead>
                            <TableHead>Provedor</TableHead>
                            <TableHead>Tipo de Autenticação</TableHead>
                            <TableHead>Última Sincronização</TableHead>
                            <TableHead>Intervalo</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accounts.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                Nenhuma conta de email encontrada
                              </TableCell>
                            </TableRow>
                          ) : (
                            accounts.map((account) => (
                              <TableRow key={account.id}>
                                <TableCell className="font-medium">{account.email}</TableCell>
                                <TableCell>{account.provider}</TableCell>
                                <TableCell>{account.auth_type}</TableCell>
                                <TableCell>
                                  {account.last_synced ? 
                                    formatDateTime(account.last_synced) : 
                                    "Nunca sincronizado"}
                                </TableCell>
                                <TableCell>
                                  {account.sync_interval_minutes ? 
                                    `${account.sync_interval_minutes} minutos` : 
                                    "Manual"}
                                </TableCell>
                                <TableCell>
                                  {account.last_synced ? 
                                    <Badge className="bg-green-500">Ativo</Badge> : 
                                    <Badge variant="outline">Não Configurado</Badge>}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="system">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Configurações do Sistema</CardTitle>
                        <CardDescription>
                          Configurações gerais e OAuth para provedores de email
                        </CardDescription>
                      </div>
                      <OAuthHelpDialog />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Métricas de Sincronização</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm font-medium text-muted-foreground mb-1">
                                Tempo Médio de Sincronização
                              </div>
                              <div className="text-2xl font-bold">
                                {stats.avgSyncTime} seg
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm font-medium text-muted-foreground mb-1">
                                Total de Sincronizações (24h)
                              </div>
                              <div className="text-2xl font-bold">
                                43
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm font-medium text-muted-foreground mb-1">
                                Taxa de Sucesso
                              </div>
                              <div className="text-2xl font-bold">
                                98.2%
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">OAuth Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base font-medium flex items-center gap-2">
                                <Mail className="h-4 w-4 text-red-500" />
                                Gmail OAuth
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <OAuthConfigurationForm
                                provider="gmail"
                                config={oauthConfigs['gmail']}
                                onSuccess={fetchOAuthConfigs}
                              />
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base font-medium flex items-center gap-2">
                                <Mail className="h-4 w-4 text-blue-500" />
                                Outlook OAuth
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <OAuthConfigurationForm
                                provider="outlook"
                                config={oauthConfigs['outlook']}
                                onSuccess={fetchOAuthConfigs}
                              />
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="logs">
                <Card>
                  <CardHeader>
                    <CardTitle>Logs do Sistema</CardTitle>
                    <CardDescription>
                      Visualize e monitore todos os logs do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SystemLogsViewer />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SuperAdmin;
