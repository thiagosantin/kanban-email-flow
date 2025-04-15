import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SuperAdminSidebar } from "@/components/SuperAdminSidebar";
import { AdminStats } from "@/components/admin/AdminStats";
import { TaskList } from "@/components/admin/TaskList";
import { SystemErrorList } from "@/components/admin/SystemErrorList";
import { useAdminData } from "@/hooks/useAdminData";
import { Separator } from "@/components/ui/separator";

const SuperAdmin = () => {
  const {
    tasks,
    accounts,
    stats,
    errors,
    loading,
    actionLoading,
    fetchData,
    handleTaskAction
  } = useAdminData();

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
            <AdminStats stats={stats} />
            
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="tasks">Tarefas & Cron Jobs</TabsTrigger>
                <TabsTrigger value="accounts">Contas de Email</TabsTrigger>
                <TabsTrigger value="system">Estatísticas do Sistema</TabsTrigger>
                <TabsTrigger value="errors">Logs de Erro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tasks">
                <TaskList 
                  tasks={tasks}
                  loading={loading}
                  actionLoading={actionLoading}
                  onTaskAction={handleTaskAction}
                />
              </TabsContent>
              
              <TabsContent value="accounts">
                <Card>
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
                        <h3 className="text-lg font-semibold mb-2">Sistema</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Versão</span>
                                  <span className="font-medium">1.0.0</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Tempo de Atividade</span>
                                  <span className="font-medium">3d 5h 12m</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Último Reinício</span>
                                  <span className="font-medium">12/04/2025 08:23</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">CPU</span>
                                  <span className="font-medium">12%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Memória</span>
                                  <span className="font-medium">348MB / 1GB</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Armazenamento</span>
                                  <span className="font-medium">1.2GB / 5GB</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="errors">
                <SystemErrorList errors={errors} loading={loading} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SuperAdmin;
