
import { useState, useEffect } from "react";
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
import { KanbanHeaderActions } from "@/components/KanbanHeaderActions";
import { toast } from "sonner";
import type { EmailStatus } from "@/types/email";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from "@/components/ui/resizable";

// Tipo para configuração de colunas kanban
type ColumnConfig = {
  id: string;
  title: string;
  color: "blue" | "yellow" | "purple" | "green" | "red" | "orange" | "pink";
  defaultSize?: number;
};

const COLUMNS_STORAGE_KEY = "kanban-email-flow-columns";

const Dashboard = () => {
  const { emails, isLoading, updateEmailStatus, archiveEmails, trashEmails } = useEmails();
  const { accounts, isLoading: accountsLoading } = useEmailAccounts();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Configuração inicial das colunas
  const defaultColumns: ColumnConfig[] = [
    { id: "inbox", title: "Caixa de Entrada", color: "blue", defaultSize: 25 },
    { id: "awaiting", title: "Aguardando", color: "yellow", defaultSize: 25 },
    { id: "processing", title: "Em Processamento", color: "purple", defaultSize: 25 },
    { id: "done", title: "Concluído", color: "green", defaultSize: 25 }
  ];
  
  // Load columns from localStorage or use defaults
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    const savedColumns = localStorage.getItem(COLUMNS_STORAGE_KEY);
    return savedColumns ? JSON.parse(savedColumns) : defaultColumns;
  });
  
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [taskSidebarWidth, setTaskSidebarWidth] = useState(25);

  // Save columns to localStorage when they change
  useEffect(() => {
    localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(columns));
  }, [columns]);

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

  const handleArchiveSelected = () => {
    if (selectedEmails.length === 0) {
      toast.info("Nenhum email selecionado para arquivar");
      return;
    }
    
    archiveEmails(selectedEmails);
    setSelectedEmails([]);
  };

  const handleTrashSelected = () => {
    if (selectedEmails.length === 0) {
      toast.info("Nenhum email selecionado para mover para lixeira");
      return;
    }
    
    trashEmails(selectedEmails);
    setSelectedEmails([]);
  };

  const handleSelectEmail = (emailId: string, selected: boolean) => {
    if (selected) {
      setSelectedEmails(prev => [...prev, emailId]);
    } else {
      setSelectedEmails(prev => prev.filter(id => id !== emailId));
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-kanban-gray-100">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <KanbanHeader>
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <KanbanColumnEditor 
                  initialColumns={columns} 
                  onUpdateColumns={handleUpdateColumns} 
                />
                <AdminUsersButton />
                <OAuthHelpDialog />
              </div>
              
              <KanbanHeaderActions 
                onArchive={handleArchiveSelected}
                onTrash={handleTrashSelected}
              />
            </div>
          </KanbanHeader>
          
          <div className="p-4 md:p-6 flex-1 overflow-auto">
            {isMobile ? (
              // Mobile view
              <div className="flex h-full flex-col">
                <div className="flex-1 overflow-x-auto mb-4">
                  <KanbanBoard 
                    emails={emails}
                    isLoading={isLoading || accountsLoading}
                    onDragEnd={handleDragEnd}
                    columns={columns}
                    onUpdateColumns={handleUpdateColumns}
                    selectedEmails={selectedEmails}
                    onSelectEmail={handleSelectEmail}
                  />
                </div>
                <TaskSidebar />
              </div>
            ) : (
              // Desktop view with resizable panels
              <ResizablePanelGroup 
                direction="horizontal" 
                className="min-h-[calc(100vh-130px)]"
              >
                <ResizablePanel 
                  defaultSize={75} 
                  minSize={50}
                  className="overflow-hidden"
                >
                  <div className="h-full overflow-auto pr-2">
                    <KanbanBoard 
                      emails={emails}
                      isLoading={isLoading || accountsLoading}
                      onDragEnd={handleDragEnd}
                      columns={columns}
                      onUpdateColumns={handleUpdateColumns}
                      selectedEmails={selectedEmails}
                      onSelectEmail={handleSelectEmail}
                    />
                  </div>
                </ResizablePanel>
                
                <ResizableHandle withHandle />
                
                <ResizablePanel 
                  defaultSize={25} 
                  minSize={15}
                  onResize={size => setTaskSidebarWidth(size)}
                >
                  <div className="h-full">
                    <TaskSidebar />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
