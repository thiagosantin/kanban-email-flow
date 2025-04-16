
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EmailAccount } from "@/types/email";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SuperAdminSidebar } from "@/components/SuperAdminSidebar";
import { OAuthHelpDialog } from "@/components/OAuthHelpDialog";
import { OAuthConfigurationForm } from "@/components/admin/OAuthConfigurationForm";
import { SystemLogsViewer } from "@/components/admin/SystemLogsViewer";
import { TasksPanel } from "@/components/admin/TasksPanel";
import { EmailAccountsPanel } from "@/components/admin/EmailAccountsPanel";

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
      
      const { data: jobsData, error: jobsError } = await supabase
        .from('background_jobs')
        .select('*');

      if (jobsError) throw jobsError;
      
      setStats({
        activeUsers: 2,
        totalTasks: jobsData?.length || 0,
        activeTasks: jobsData?.filter(t => t.status === "running").length || 0,
        failedTasks: jobsData?.filter(t => t.status === "failed").length || 0,
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
                <TasksPanel />
              </TabsContent>
              
              <TabsContent value="accounts">
                <EmailAccountsPanel />
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
                      
                      <div className="h-1 bg-gray-100 my-6"></div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">OAuth Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base font-medium flex items-center gap-2">
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
