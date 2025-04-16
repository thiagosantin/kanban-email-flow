
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Archive, Trash2, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface KanbanHeaderActionsProps {
  onArchive: () => void;
  onTrash: () => void;
  onMarkAll?: () => void;
  hasSelection: boolean;
  selectedCount?: number;
}

export function KanbanHeaderActions({ 
  onArchive, 
  onTrash, 
  onMarkAll,
  hasSelection,
  selectedCount = 0
}: KanbanHeaderActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      {onMarkAll && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAll}
                className="h-8"
              >
                <Check className="h-4 w-4 mr-1" />
                Marcar Todos
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Selecionar todos os emails</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onArchive}
              disabled={!hasSelection}
              className={`h-8 ${hasSelection ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' : ''}`}
            >
              <Archive className="h-4 w-4 mr-1" />
              Arquivar
              {selectedCount > 0 && (
                <span className="ml-1 text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full">
                  {selectedCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mover para arquivos</p>
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
              disabled={!hasSelection}
              className={`h-8 ${hasSelection ? 'bg-red-50 border-red-200 hover:bg-red-100' : ''}`}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Lixeira
              {selectedCount > 0 && (
                <span className="ml-1 text-xs bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full">
                  {selectedCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mover para lixeira</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
