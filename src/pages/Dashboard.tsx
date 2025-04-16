
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KanbanHeader } from "@/components/KanbanHeader";
import { KanbanBoard } from "@/components/KanbanBoard";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEmails } from "@/hooks/useEmails";
import { TaskSidebar } from "@/components/TaskSidebar";
import { KanbanColumnEditor } from "@/components/KanbanColumnEditor";
import { OAuthHelpDialog } from "@/components/OAuthHelpDialog";
import { AdminUsersButton } from "@/components/admin/AdminUsersButton";
import { toast } from "sonner";
import type { EmailStatus } from "@/types/email";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";

// Tipo para configuração de colunas kanban
type ColumnConfig = {
  id: string;
  title: string;
  color: "blue" | "yellow" | "purple" | "green" | "red" | "orange" | "pink";
};

const Dashboard = () => {
  const { emails, isLoading, updateEmailStatus } = useEmails();
  const { accounts, isLoading: accountsLoading } = useEmailAccounts();
  const navigate = useNavigate();
  
  // Configuração inicial das colunas
  const defaultColumns: ColumnConfig[] = [
    { id: "inbox", title: "Caixa de Entrada", color: "blue" },
    { id: "awaiting", title: "Aguardando", color: "yellow" },
    { id: "processing", title: "Em Processamento", color: "purple" },
    { id: "done", title: "Concluído", color: "green" }
  ];
  
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      // Only update if the status has actually changed
      if (destination.droppableId !== source.droppableId) {
        console.log(`Moving email ${draggableId} from ${source.droppableId} to ${destination.droppableId}`);
        
        updateEmailStatus({
          emailId: draggableId,
          newStatus: destination.droppableId as EmailStatus
        });
      }
    } catch (error) {
      console.error("Error in handleDragEnd:", error);
      toast.error("Failed to update email status");
    }
  };

  const handleUpdateColumns = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
  };

  // Log email count for debugging
  console.log('Email counts:', {
    inbox: emails.inbox.length,
    awaiting: emails.awaiting.length,
    processing: emails.processing.length, 
    done: emails.done.length
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-kanban-gray-100">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <KanbanHeader>
            <div className="flex space-x-2">
              <KanbanColumnEditor 
                initialColumns={columns} 
                onUpdateColumns={handleUpdateColumns} 
              />
              <AdminUsersButton />
              <OAuthHelpDialog />
            </div>
          </KanbanHeader>
          
          <div className="p-4 md:p-6 flex-1 overflow-auto">
            <div className="flex h-full">
              <div className="flex-1 overflow-x-auto">
                <KanbanBoard 
                  emails={emails}
                  isLoading={isLoading || accountsLoading}
                  onDragEnd={handleDragEnd}
                  columns={columns}
                  onUpdateColumns={handleUpdateColumns}
                />
              </div>
              <TaskSidebar />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
