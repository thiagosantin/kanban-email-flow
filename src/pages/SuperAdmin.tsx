import React, { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SuperAdminSidebar } from "@/components/SuperAdminSidebar";
import { AdminStats } from "@/components/admin/AdminStats";
import { TaskList } from "@/components/admin/TaskList";
import { SystemErrorList } from "@/components/admin/SystemErrorList";
import { AccountsList } from "@/components/admin/AccountsList";
import { SystemMetrics } from "@/components/admin/SystemStats";
import { useAdminData } from "@/hooks/useAdminData";
import { toast } from "react-toastify";

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

  const assignAdmin = async () => {
    try {
      await assignAdminToEmail('thiagoaosantos@outlook.com');
      toast.success('Permissão de administrador concedida com sucesso');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao conceder permissão de administrador');
    }
  };

  useEffect(() => {
    assignAdmin();
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
                <AccountsList accounts={accounts} loading={loading} />
              </TabsContent>
              
              <TabsContent value="system">
                <SystemMetrics avgSyncTime={stats.avgSyncTime} />
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
