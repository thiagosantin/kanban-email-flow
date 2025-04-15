import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { KanbanHeader } from "@/components/KanbanHeader";
import { EmailCard } from "@/components/EmailCard";
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
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 text-kanban-blue animate-spin" />
                <span className="ml-2 text-lg text-kanban-gray-600">Carregando emails...</span>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex space-x-4 h-full min-w-[900px]">
                  <KanbanColumn 
                    id="inbox" 
                    title="Caixa de Entrada" 
                    emails={emails.inbox} 
                    count={emails.inbox.length}
                    color="blue"
                  />
                  <KanbanColumn 
                    id="awaiting" 
                    title="Aguardando" 
                    emails={emails.awaiting} 
                    count={emails.awaiting.length}
                    color="yellow"
                  />
                  <KanbanColumn 
                    id="processing" 
                    title="Em Processamento" 
                    emails={emails.processing} 
                    count={emails.processing.length}
                    color="purple"
                  />
                  <KanbanColumn 
                    id="done" 
                    title="Concluído" 
                    emails={emails.done} 
                    count={emails.done.length}
                    color="green"
                  />
                </div>
              </DragDropContext>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

type KanbanColumnProps = {
  id: string;
  title: string;
  emails: any[];
  count: number;
  color: "blue" | "yellow" | "purple" | "green";
};

const KanbanColumn = ({ id, title, emails, count, color }: KanbanColumnProps) => {
  const colorMap = {
    blue: "bg-kanban-blue text-white",
    yellow: "bg-kanban-yellow text-black",
    purple: "bg-kanban-purple text-white",
    green: "bg-kanban-green text-white"
  };

  return (
    <div className="flex-1 flex flex-col min-w-[250px] max-w-[350px] bg-white rounded-lg shadow">
      <div className={`p-3 rounded-t-lg ${colorMap[color]}`}>
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{title}</h3>
          <Badge variant="secondary" className="bg-white/20 hover:bg-white/30">
            {count}
          </Badge>
        </div>
      </div>
      
      <Droppable droppableId={id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 p-2 overflow-y-auto"
            style={{ minHeight: "100px" }}
          >
            {emails.map((email, index) => (
              <Draggable key={email.id} draggableId={email.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-2 ${
                      snapshot.isDragging ? "opacity-70" : ""
                    }`}
                  >
                    <EmailCard email={email} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Dashboard;
