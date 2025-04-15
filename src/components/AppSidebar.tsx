import { 
  Archive, 
  Calendar, 
  Cog, 
  Inbox, 
  Mail, 
  MessageSquare, 
  Plus, 
  Send, 
  Shield, 
  Star, 
  Trash 
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
import { Link, useNavigate } from "react-router-dom";
import { useAdminStatus } from "@/hooks/useAdminStatus";

export function AppSidebar() {
  const navigate = useNavigate();
  const { isAdmin } = useAdminStatus();
  
  // Items de menu principal
  const mainItems = [
    {
      title: "Caixa de Entrada",
      icon: Inbox,
      unread: 3,
      url: "/dashboard"
    },
    {
      title: "Enviados",
      icon: Send,
      unread: 0,
      url: "/dashboard"
    },
    {
      title: "Favoritos",
      icon: Star,
      unread: 0, 
      url: "/dashboard"
    },
    {
      title: "Arquivados",
      icon: Archive,
      unread: 0,
      url: "/dashboard"
    },
    {
      title: "Lixeira",
      icon: Trash,
      unread: 0,
      url: "/dashboard"
    }
  ];

  // Itens de menu de contas conectadas
  const accountItems = [
    {
      title: "Gmail - Pessoal",
      icon: Mail,
      url: "/dashboard",
      color: "text-red-500"
    },
    {
      title: "Outlook - Trabalho",
      icon: Mail,
      url: "/dashboard",
      color: "text-blue-500"
    }
  ];

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center h-16 px-4">
        <h2 className="text-xl font-bold flex items-center">
          <Mail className="h-6 w-6 text-kanban-blue mr-2" />
          Email Kanban
        </h2>
      </SidebarHeader>
      
      <SidebarContent>
        <div className="px-3 mb-4">
          <Button className="w-full bg-kanban-blue hover:bg-kanban-blue/90">
            <Plus className="h-4 w-4 mr-2" />
            Compor
          </Button>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex justify-between">
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 mr-3" />
                        <span>{item.title}</span>
                      </div>
                      {item.unread > 0 && (
                        <Badge className="bg-kanban-blue text-white ml-2">
                          {item.unread}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Contas Conectadas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon className={`h-5 w-5 mr-3 ${item.color}`} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Apps</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard">
                    <Calendar className="h-5 w-5 mr-3" />
                    <span>Calendário</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard">
                    <MessageSquare className="h-5 w-5 mr-3" />
                    <span>Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/admin" className="flex items-center">
                      <Shield className="h-5 w-5 mr-3 text-red-500" />
                      <span>Painel Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/settings")}>
          <Cog className="h-5 w-5 mr-3" />
          <span>Configurações</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
