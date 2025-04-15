
import React from "react";
import { useNavigate } from "react-router-dom";
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

export function SuperAdminSidebar() {
  const navigate = useNavigate();
  
  // Items do menu principal
  const mainItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      url: "/admin",
      badge: null
    },
    {
      title: "Tarefas & Cron",
      icon: Clock,
      url: "/admin",
      badge: 3
    },
    {
      title: "Usuários",
      icon: Users,
      url: "/admin",
      badge: null
    },
    {
      title: "Banco de Dados",
      icon: Database,
      url: "/admin",
      badge: null
    },
    {
      title: "Servidor",
      icon: Server, 
      url: "/admin",
      badge: null
    }
  ];

  // Items do menu de ferramentas
  const toolItems = [
    {
      title: "Email Sync",
      icon: Mail,
      url: "/admin",
      badge: null
    },
    {
      title: "Background Jobs",
      icon: Zap,
      url: "/admin",
      badge: 2
    },
    {
      title: "Atividade",
      icon: Activity,
      url: "/admin",
      badge: null
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
                      className="flex justify-between cursor-pointer"
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
                      className="flex justify-between cursor-pointer"
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
      </SidebarFooter>
    </Sidebar>
  );
}
