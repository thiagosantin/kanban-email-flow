
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Activity, 
  Clock, 
  Database, 
  LayoutDashboard, 
  Mail,
  Server, 
  Settings, 
  Users, 
  Zap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "./LogoutButton";
import { useBackgroundJobs } from "@/hooks/useBackgroundJobs";

export function SuperAdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobs = [] } = useBackgroundJobs();
  
  const failedJobs = jobs.filter(job => job.status === 'failed').length;
  const pendingJobs = jobs.filter(job => job.status === 'pending').length;
  
  // Items do menu principal
  const mainItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      url: "/admin",
      badge: null,
      active: location.pathname === '/admin'
    },
    {
      title: "Tarefas & Cron",
      icon: Clock,
      url: "/admin?tab=tasks",
      badge: pendingJobs > 0 ? pendingJobs : null,
      active: location.pathname === '/admin' && location.search.includes('tab=tasks')
    },
    {
      title: "Usuários",
      icon: Users,
      url: "/admin?tab=users",
      badge: null,
      active: location.pathname === '/admin' && location.search.includes('tab=users')
    },
    {
      title: "Banco de Dados",
      icon: Database,
      url: "/admin?tab=database",
      badge: null,
      active: location.pathname === '/admin' && location.search.includes('tab=database')
    },
    {
      title: "Servidor",
      icon: Server, 
      url: "/admin?tab=server",
      badge: null,
      active: location.pathname === '/admin' && location.search.includes('tab=server')
    }
  ];

  // Items do menu de ferramentas
  const toolItems = [
    {
      title: "Email Sync",
      icon: Mail,
      url: "/admin?tab=accounts",
      badge: null,
      active: location.pathname === '/admin' && location.search.includes('tab=accounts')
    },
    {
      title: "Background Jobs",
      icon: Zap,
      url: "/admin?tab=jobs",
      badge: failedJobs > 0 ? failedJobs : null,
      active: location.pathname === '/admin' && location.search.includes('tab=jobs')
    },
    {
      title: "Atividade",
      icon: Activity,
      url: "/admin?tab=logs",
      badge: null,
      active: location.pathname === '/admin' && location.search.includes('tab=logs')
    }
  ];

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center h-16 px-4">
        <h2 className="text-xl font-bold flex items-center">
          <Server className="h-6 w-6 text-kanban-blue mr-2" />
          Admin Painel
        </h2>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <div 
                      onClick={() => navigate(item.url)}
                      className={`flex justify-between cursor-pointer ${item.active ? 'bg-gray-100 rounded' : ''}`}
                    >
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 mr-3" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge className="bg-kanban-blue text-white ml-2">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <div 
                      onClick={() => navigate(item.url)}
                      className={`flex justify-between cursor-pointer ${item.active ? 'bg-gray-100 rounded' : ''}`}
                    >
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 mr-3" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge className="bg-red-500 text-white ml-2">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          onClick={() => navigate("/dashboard")}
        >
          <Mail className="h-5 w-5 mr-3" />
          <span>Voltar para Email</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          onClick={() => navigate("/settings")}
        >
          <Settings className="h-5 w-5 mr-3" />
          <span>Configurações</span>
        </Button>

        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
