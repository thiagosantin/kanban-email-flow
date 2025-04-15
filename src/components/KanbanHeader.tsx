
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Bell, 
  Filter, 
  Mail, 
  Plus, 
  Search, 
  Settings, 
  User
} from "lucide-react";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface KanbanHeaderProps {
  children?: ReactNode;
}

export function KanbanHeader({ children }: KanbanHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-kanban-gray-200 p-3 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="md:flex items-center hidden">
            <Mail className="h-5 w-5 text-kanban-blue mr-2" />
            <h1 className="text-xl font-semibold text-kanban-gray-900">Email Kanban</h1>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-kanban-gray-500" />
            <Input
              className="pl-8 bg-kanban-gray-100 border-none focus:ring-1 focus:ring-kanban-blue"
              placeholder="Pesquisar emails..."
              type="search"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          {children && (
            <div className="mr-2 hidden md:block">
              {children}
            </div>
          )}
          
          <Button variant="ghost" size="icon" className="text-kanban-gray-600 hover:text-kanban-blue">
            <Filter className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-kanban-gray-600 hover:text-kanban-blue">
            <Bell className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-kanban-gray-600 hover:text-kanban-blue"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="ml-2 rounded-full">
            <User className="h-6 w-6 text-kanban-blue" />
          </Button>

          <Button className="ml-4 bg-kanban-blue hover:bg-kanban-blue/90 hidden md:flex">
            <Plus className="h-4 w-4 mr-2" />
            Novo Email
          </Button>
        </div>
      </div>
      
      {children && (
        <div className="mt-2 md:hidden p-2 flex overflow-x-auto">
          {children}
        </div>
      )}
    </header>
  );
}
