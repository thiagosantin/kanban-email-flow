
import { 
  Archive, 
  Calendar, 
  ChevronDown,  
  Cog, 
  Mail, 
  MessageSquare, 
  Plus, 
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
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";
import { EmailAccountsList } from "./email/EmailAccountsList";
import { EmailAccountManager } from "./EmailAccountManager";

export function AppSidebar() {
  const navigate = useNavigate();
  const { accounts, isLoading } = useEmailAccounts();

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
          <EmailAccountManager />
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Connected Accounts</SidebarGroupLabel>
          <SidebarGroupContent>
            <EmailAccountsList accounts={accounts} isLoading={isLoading} />
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
                    <span>Calendar</span>
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin">
                    <Shield className="h-5 w-5 mr-3 text-red-500" />
                    <span>Admin Panel</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/settings")}>
          <Cog className="h-5 w-5 mr-3" />
          <span>Settings</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
