
import { DragDropContext } from "react-beautiful-dnd";
import { KanbanColumn } from "@/components/KanbanColumn";
import { Loader2 } from "lucide-react";
import type { Email, EmailStatus } from "@/types/email";

interface KanbanBoardProps {
  emails: {
    inbox: Email[];
    awaiting: Email[];
    processing: Email[];
    done: Email[];
  };
  isLoading: boolean;
  onDragEnd: (result: any) => void;
}

export function KanbanBoard({ emails, isLoading, onDragEnd }: KanbanBoardProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 text-kanban-blue animate-spin" />
        <span className="ml-2 text-lg text-kanban-gray-600">Carregando emails...</span>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
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
  );
}
