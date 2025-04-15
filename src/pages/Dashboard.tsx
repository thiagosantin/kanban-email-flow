
import { useNavigate } from "react-router-dom";
import { KanbanHeader } from "@/components/KanbanHeader";
import { KanbanBoard } from "@/components/KanbanBoard";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEmails } from "@/hooks/useEmails";
import type { EmailStatus } from "@/types/email";

const Dashboard = () => {
  const { emails, isLoading, updateEmailStatus } = useEmails();
  const navigate = useNavigate();

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    updateEmailStatus({
      emailId: draggableId,
      newStatus: destination.droppableId as EmailStatus
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-kanban-gray-100">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <KanbanHeader />
          
          <div className="p-4 md:p-6 flex-1 overflow-x-auto">
            <KanbanBoard 
              emails={emails}
              isLoading={isLoading}
              onDragEnd={handleDragEnd}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
