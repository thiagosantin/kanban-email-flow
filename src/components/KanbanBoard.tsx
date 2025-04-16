
import { useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { KanbanColumn } from "@/components/KanbanColumn";
import { Loader2 } from "lucide-react";
import type { Email, EmailStatus } from "@/types/email";
import { useIsMobile } from "@/hooks/use-mobile";

// Mapeamento entre EmailStatus e cores
const statusColorMap = {
  inbox: "blue" as const,
  awaiting: "yellow" as const,
  processing: "purple" as const,
  done: "green" as const
};

type ColumnConfig = {
  id: string;
  title: string;
  color: "blue" | "yellow" | "purple" | "green" | "red" | "orange" | "pink";
};

interface KanbanBoardProps {
  emails: {
    inbox: Email[];
    awaiting: Email[];
    processing: Email[];
    done: Email[];
  };
  isLoading: boolean;
  onDragEnd: (result: any) => void;
  columns?: ColumnConfig[]; // Configuração de colunas opcional
  onUpdateColumns?: (columns: ColumnConfig[]) => void; // Callback para atualizar colunas
  selectedEmails?: string[]; // Nova prop para emails selecionados
  onSelectEmail?: (emailId: string, selected: boolean) => void; // Nova prop para callback de seleção
}

export function KanbanBoard({ 
  emails, 
  isLoading, 
  onDragEnd,
  columns: externalColumns,
  onUpdateColumns,
  selectedEmails = [],
  onSelectEmail
}: KanbanBoardProps) {
  // Colunas padrão baseadas nas status de email
  const defaultColumns: ColumnConfig[] = [
    { id: "inbox", title: "Caixa de Entrada", color: statusColorMap.inbox },
    { id: "awaiting", title: "Aguardando", color: statusColorMap.awaiting },
    { id: "processing", title: "Em Processamento", color: statusColorMap.processing },
    { id: "done", title: "Concluído", color: statusColorMap.done }
  ];

  // Use colunas externas se fornecidas, caso contrário use as padrão
  const [columns] = useState<ColumnConfig[]>(externalColumns || defaultColumns);
  
  const isMobile = useIsMobile();

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
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'space-x-4'} h-full ${!isMobile && 'min-w-[900px]'}`}>
        {columns.map(column => {
          const columnEmails = emails[column.id as EmailStatus] || [];
          return (
            <KanbanColumn 
              key={column.id}
              id={column.id}
              title={column.title}
              emails={columnEmails}
              count={columnEmails.length}
              color={column.color}
              selectedEmails={selectedEmails}
              onSelectEmail={onSelectEmail}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
}
