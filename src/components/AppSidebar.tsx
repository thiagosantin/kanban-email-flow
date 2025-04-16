
import { 
  Archive, 
  Calendar, 
  ChevronDown,  
  Cog, 
  Mail, 
  MessageSquare, 
  Shield 
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
import { Link, useNavigate } from "react-router-dom";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";
import { EmailAccountsList } from "./email/EmailAccountsList";
import { EmailAccountManager } from "./EmailAccountManager";
import { LogoutButton } from "./LogoutButton";

export function AppSidebar() {
  const navigate = useNavigate();
  const { accounts, isLoading } = useEmailAccounts();

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <h2 className="text-xl font-bold flex items-center">
          <Mail className="h-6 w-6 text-kanban-blue mr-2" />
          Email Kanban
        </h2>
      </SidebarHeader>
      
      <SidebarContent>
        <div className="px-3 py-4">
          <EmailAccountManager />
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-medium text-kanban-gray-500">Contas Conectadas</SidebarGroupLabel>
          <SidebarGroupContent>
            <EmailAccountsList accounts={accounts} isLoading={isLoading} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-medium text-kanban-gray-500">Aplicativos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild
                  className="transition-colors duration-200 hover:bg-kanban-gray-100">
                  <Link to="/dashboard" className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-kanban-blue" />
                    <span>Calendário</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild
                  className="transition-colors duration-200 hover:bg-kanban-gray-100">
                  <Link to="/dashboard" className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-3 text-kanban-green" />
                    <span>Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild
                  className="transition-colors duration-200 hover:bg-kanban-gray-100">
                  <Link to="/dashboard" className="flex items-center">
                    <Archive className="h-5 w-5 mr-3 text-kanban-purple" />
                    <span>Arquivo</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild
                  className="transition-colors duration-200 hover:bg-kanban-gray-100">
                  <Link to="/admin" className="flex items-center">
                    <Shield className="h-5 w-5 mr-3 text-kanban-red" />
                    <span>Painel Admin</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border pt-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start hover:bg-kanban-gray-100 transition-colors duration-200" 
          onClick={() => navigate("/settings")}
        >
          <Cog className="h-5 w-5 mr-3 text-kanban-gray-600" />
          <span>Configurações</span>
        </Button>
        
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
