
import { useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { KanbanColumn } from "@/components/KanbanColumn";
import { Loader2 } from "lucide-react";
import type { Email, EmailStatus } from "@/types/email";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from "@/components/ui/resizable";

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
  defaultSize?: number; // New field for default size
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
    { id: "inbox", title: "Caixa de Entrada", color: statusColorMap.inbox, defaultSize: 25 },
    { id: "awaiting", title: "Aguardando", color: statusColorMap.awaiting, defaultSize: 25 },
    { id: "processing", title: "Em Processamento", color: statusColorMap.processing, defaultSize: 25 },
    { id: "done", title: "Concluído", color: statusColorMap.done, defaultSize: 25 }
  ];

  // Use colunas externas se fornecidas, caso contrário use as padrão
  const [columns] = useState<ColumnConfig[]>(
    externalColumns?.map(col => ({
      ...col, 
      defaultSize: col.defaultSize || 100 / (externalColumns.length || 1)
    })) || 
    defaultColumns
  );
  
  const isMobile = useIsMobile();

  // Save panel sizes when resizing
  const handlePanelResize = (panelId: string, size: number) => {
    if (onUpdateColumns && columns) {
      const updatedColumns = columns.map(col => 
        col.id === panelId ? { ...col, defaultSize: size } : col
      );
      onUpdateColumns(updatedColumns);
    }
  };

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
      {isMobile ? (
        // Mobile view - stacked columns
        <div className="flex flex-col space-y-4">
          {columns.map(column => {
            const columnEmails = emails[column.id as EmailStatus] || [];
            return (
              <div key={column.id} className="w-full">
                <KanbanColumn 
                  id={column.id}
                  title={column.title}
                  emails={columnEmails}
                  count={columnEmails.length}
                  color={column.color}
                  selectedEmails={selectedEmails}
                  onSelectEmail={onSelectEmail}
                />
              </div>
            );
          })}
        </div>
      ) : (
        // Desktop view - resizable panels
        <ResizablePanelGroup 
          direction="horizontal" 
          className="min-h-[400px] w-full rounded-lg border"
        >
          {columns.map((column, index) => {
            const columnEmails = emails[column.id as EmailStatus] || [];
            return (
              <React.Fragment key={column.id}>
                <ResizablePanel 
                  id={column.id}
                  defaultSize={column.defaultSize || 25}
                  minSize={15}
                  className="transition-all duration-200 ease-in-out"
                  onResize={(size) => handlePanelResize(column.id, size)}
                >
                  <div className="h-full">
                    <KanbanColumn 
                      id={column.id}
                      title={column.title}
                      emails={columnEmails}
                      count={columnEmails.length}
                      color={column.color}
                      selectedEmails={selectedEmails}
                      onSelectEmail={onSelectEmail}
                    />
                  </div>
                </ResizablePanel>
                {index < columns.length - 1 && (
                  <ResizableHandle withHandle className="bg-border/50 hover:bg-border transition-colors" />
                )}
              </React.Fragment>
            );
          })}
        </ResizablePanelGroup>
      )}
    </DragDropContext>
  );
}
