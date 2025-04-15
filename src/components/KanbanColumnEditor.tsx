
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";

type Column = {
  id: string;
  title: string;
  color: "blue" | "yellow" | "purple" | "green" | "red" | "orange" | "pink";
};

interface KanbanColumnEditorProps {
  onUpdateColumns: (columns: Column[]) => void;
  initialColumns: Column[];
}

export function KanbanColumnEditor({ 
  onUpdateColumns, 
  initialColumns 
}: KanbanColumnEditorProps) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);

  const colorOptions = [
    { value: "blue", label: "Azul" },
    { value: "yellow", label: "Amarelo" },
    { value: "purple", label: "Roxo" },
    { value: "green", label: "Verde" },
    { value: "red", label: "Vermelho" },
    { value: "orange", label: "Laranja" },
    { value: "pink", label: "Rosa" },
  ];

  const handleAddColumn = () => {
    const newColumn: Column = {
      id: Date.now().toString(),
      title: "Nova Coluna",
      color: "blue",
    };
    setColumns([...columns, newColumn]);
  };

  const handleRemoveColumn = (id: string) => {
    setColumns(columns.filter((col) => col.id !== id));
  };

  const handleColumnChange = (
    id: string,
    field: keyof Column,
    value: string
  ) => {
    setColumns(
      columns.map((col) =>
        col.id === id
          ? { ...col, [field]: value as any }
          : col
      )
    );
  };

  const handleSave = () => {
    onUpdateColumns(columns);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="h-4 w-4" />
          <span>Editar Quadros</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurar Quadros Kanban</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto pr-2">
          {columns.map((column) => (
            <div 
              key={column.id} 
              className="flex flex-col gap-3 p-3 border rounded-md relative"
            >
              <button 
                onClick={() => handleRemoveColumn(column.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                disabled={columns.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              
              <div>
                <Label htmlFor={`title-${column.id}`}>Título</Label>
                <Input
                  id={`title-${column.id}`}
                  value={column.title}
                  onChange={(e) => 
                    handleColumnChange(column.id, "title", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor={`color-${column.id}`}>Cor</Label>
                <Select
                  value={column.color}
                  onValueChange={(value) => 
                    handleColumnChange(column.id, "color", value)
                  }
                >
                  <SelectTrigger id={`color-${column.id}`} className="mt-1">
                    <SelectValue placeholder="Selecione uma cor" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div 
                            className={`w-3 h-3 rounded-full mr-2 bg-kanban-${color.value}`} 
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full mt-2" 
            onClick={handleAddColumn}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Coluna
          </Button>
        </div>
        
        <DialogFooter>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
