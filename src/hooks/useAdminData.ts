
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task, SystemStats, SystemError } from "@/types/admin";
import { EmailAccount } from "@/types/email";

export function useAdminData() {
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
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: accountsData, error: accountsError } = await supabase
        .from('email_accounts')
        .select('*');
        
      if (accountsError) throw accountsError;
      
      const emailAccounts = accountsData as EmailAccount[] || [];
      setAccounts(emailAccounts);
      
      const mockTasks: Task[] = [
        {
          id: "1",
          name: "Email Sync - Gmail",
          status: "running",
          type: "sync",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          owner_id: "user1",
          owner_email: "user@example.com",
          last_run: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          next_run: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
          frequency: "15min"
        },
        {
          id: "2",
          name: "Email Sync - Outlook",
          status: "failed",
          type: "sync",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          owner_id: "user2",
          owner_email: "another@example.com",
          last_run: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          next_run: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
          frequency: "30min",
          error: "Authentication failed: Invalid credentials"
        },
        {
          id: "3",
          name: "Daily Report Generator",
          status: "paused",
          type: "cron",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          owner_id: "user1",
          owner_email: "user@example.com",
          last_run: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          next_run: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
          frequency: "daily@8am"
        }
      ];
      
      setTasks(mockTasks);
      
      const mockErrors: SystemError[] = [
        {
          id: '1',
          message: 'Authentication failed: Invalid credentials',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 401,
          path: '/auth',
          component: 'AuthProvider',
          severity: 'high'
        },
        {
          id: '2',
          message: 'Email sync failed: Connection timeout',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          path: '/api/sync',
          component: 'EmailSync',
          severity: 'medium'
        }
      ];
      
      setErrors(mockErrors);
      
      setStats({
        activeUsers: 2,
        totalTasks: mockTasks.length,
        activeTasks: mockTasks.filter(t => t.status === "running").length,
        failedTasks: mockTasks.filter(t => t.status === "failed").length,
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

  const handleTaskAction = async (taskId: string, action: string) => {
    setActionLoading(prev => ({ ...prev, [taskId]: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (action === "start") {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, status: "running" } : task
        ));
        toast.success("Tarefa iniciada com sucesso");
      } else if (action === "pause") {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, status: "paused" } : task
        ));
        toast.success("Tarefa pausada com sucesso");
      } else if (action === "delete") {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        toast.success("Tarefa removida com sucesso");
      } else if (action === "retry") {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, status: "running", error: null } : task
        ));
        toast.success("Tarefa reiniciada com sucesso");
      }
      
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: action === "start" ? "running" : action === "pause" ? "paused" : task.status }
          : task
      ).filter(task => action !== "delete" || task.id !== taskId);
      
      setStats(prev => ({
        ...prev,
        totalTasks: action === "delete" ? prev.totalTasks - 1 : prev.totalTasks,
        activeTasks: updatedTasks.filter(t => t.status === "running").length,
        failedTasks: updatedTasks.filter(t => t.status === "failed").length,
      }));
      
    } catch (error: any) {
      console.error(`Error performing ${action} on task:`, error.message);
      toast.error(`Erro ao ${action === "start" ? "iniciar" : action === "pause" ? "pausar" : action === "delete" ? "remover" : "reiniciar"} tarefa`);
    } finally {
      setActionLoading(prev => ({ ...prev, [taskId]: false }));
    }
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Acesso não autorizado");
        navigate("/auth");
        return;
      }
      
      const { data, error } = await supabase
        .from('email_accounts')
        .select('email')
        .eq('user_id', user.id)
        .single();
        
      if (error || !data) {
        toast.error("Acesso não autorizado");
        navigate("/dashboard");
        return;
      }
      
      fetchData();
    };
    
    checkAdminAccess();
  }, [navigate]);

  return {
    tasks,
    accounts,
    stats,
    errors,
    loading,
    actionLoading,
    fetchData,
    handleTaskAction
  };
}
