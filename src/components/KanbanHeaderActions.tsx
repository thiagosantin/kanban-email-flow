
import { Button } from "@/components/ui/button";
import { Archive, Trash2 } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KanbanHeaderActionsProps {
  onArchive: () => void;
  onTrash: () => void;
}

export function KanbanHeaderActions({ onArchive, onTrash }: KanbanHeaderActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onArchive}
              className="text-kanban-gray-700 border-kanban-gray-300"
            >
              <Archive className="h-4 w-4 mr-1" />
              <span>Arquivo</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mover e-mails selecionados para o arquivo</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onTrash}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span>Lixeira</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mover e-mails selecionados para a lixeira</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
