
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
import { 
  Archive, 
  Calendar, 
  Cog, 
  Inbox, 
  Mail, 
  MessageSquare, 
  Plus, 
  Send, 
  Star, 
  Trash 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AppSidebar() {
  // Items de menu principal
  const mainItems = [
    {
      title: "Caixa de Entrada",
      icon: Inbox,
      unread: 3,
      url: "#"
    },
    {
      title: "Enviados",
      icon: Send,
      unread: 0,
      url: "#"
    },
    {
      title: "Favoritos",
      icon: Star,
      unread: 0, 
      url: "#"
    },
    {
      title: "Arquivados",
      icon: Archive,
      unread: 0,
      url: "#"
    },
    {
      title: "Lixeira",
      icon: Trash,
      unread: 0,
      url: "#"
    }
  ];

  // Itens de menu de contas conectadas
  const accountItems = [
    {
      title: "Gmail - Pessoal",
      icon: Mail,
      url: "#",
      color: "text-red-500"
    },
    {
      title: "Outlook - Trabalho",
      icon: Mail,
      url: "#",
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
                    <a href={item.url} className="flex justify-between">
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 mr-3" />
                        <span>{item.title}</span>
                      </div>
                      {item.unread > 0 && (
                        <Badge className="bg-kanban-blue text-white ml-2">
                          {item.unread}
                        </Badge>
                      )}
                    </a>
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
                    <a href={item.url}>
                      <item.icon className={`h-5 w-5 mr-3 ${item.color}`} />
                      <span>{item.title}</span>
                    </a>
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
                  <a href="#">
                    <Calendar className="h-5 w-5 mr-3" />
                    <span>Calendário</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <MessageSquare className="h-5 w-5 mr-3" />
                    <span>Chat</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <Button variant="ghost" className="w-full justify-start" asChild>
          <a href="/settings">
            <Cog className="h-5 w-5 mr-3" />
            <span>Configurações</span>
          </a>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
