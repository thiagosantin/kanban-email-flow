
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
import { Edit, Plus, Trash2, Move } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type Column = {
  id: string;
  title: string;
  color: "blue" | "yellow" | "purple" | "green" | "red" | "orange" | "pink";
  defaultSize?: number;
};

interface KanbanColumnEditorProps {
  onUpdateColumns: (columns: Column[]) => void;
  initialColumns: Column[];
}

export function KanbanColumnEditor({ 
  onUpdateColumns, 
  initialColumns 
}: KanbanColumnEditorProps) {
  const [columns, setColumns] = useState<Column[]>(
    initialColumns.map(col => ({
      ...col,
      defaultSize: col.defaultSize || 100 / initialColumns.length
    }))
  );
  
  const [isOpen, setIsOpen] = useState(false);

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
    // Calculate even widths for all columns
    const newColumnCount = columns.length + 1;
    const evenSize = 100 / newColumnCount;
    
    const updatedColumns = columns.map(col => ({
      ...col,
      defaultSize: evenSize
    }));
    
    const newColumn: Column = {
      id: Date.now().toString(),
      title: "Nova Coluna",
      color: "blue",
      defaultSize: evenSize
    };
    
    setColumns([...updatedColumns, newColumn]);
  };

  const handleRemoveColumn = (id: string) => {
    const newColumns = columns.filter((col) => col.id !== id);
    
    // Recalculate sizes to distribute evenly
    if (newColumns.length > 0) {
      const evenSize = 100 / newColumns.length;
      setColumns(newColumns.map(col => ({
        ...col,
        defaultSize: evenSize
      })));
    } else {
      setColumns([]);
    }
  };

  const handleColumnChange = (
    id: string,
    field: keyof Column,
    value: string | number
  ) => {
    setColumns(
      columns.map((col) =>
        col.id === id
          ? { ...col, [field]: value }
          : col
      )
    );
  };

  const handleSizeChange = (id: string, newSize: number) => {
    // Find the column being resized
    const column = columns.find(col => col.id === id);
    if (!column) return;
    
    // Calculate the difference between old and new size
    const oldSize = column.defaultSize || 0;
    const difference = newSize - oldSize;
    
    // Adjust other columns proportionally
    const otherColumns = columns.filter(col => col.id !== id);
    const totalOtherSize = otherColumns.reduce((sum, col) => sum + (col.defaultSize || 0), 0);
    
    // Must have at least 10% for other columns
    if (newSize > 90) {
      newSize = 90;
    }
    
    const adjustedColumns = columns.map(col => {
      if (col.id === id) {
        return { ...col, defaultSize: newSize };
      } else {
        // Adjust other columns proportionally
        const ratio = (col.defaultSize || 0) / totalOtherSize;
        const adjustment = difference * ratio;
        const newColSize = (col.defaultSize || 0) - adjustment;
        
        // Ensure minimum size
        return { ...col, defaultSize: Math.max(5, newColSize) };
      }
    });
    
    setColumns(adjustedColumns);
  };

  const handleSave = () => {
    onUpdateColumns(columns);
    setIsOpen(false);
  };

  // Move column up in order
  const moveColumnUp = (index: number) => {
    if (index === 0) return;
    const newColumns = [...columns];
    [newColumns[index], newColumns[index - 1]] = [newColumns[index - 1], newColumns[index]];
    setColumns(newColumns);
  };
  
  // Move column down in order
  const moveColumnDown = (index: number) => {
    if (index === columns.length - 1) return;
    const newColumns = [...columns];
    [newColumns[index], newColumns[index + 1]] = [newColumns[index + 1], newColumns[index]];
    setColumns(newColumns);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="h-4 w-4" />
          <span>Personalizar Quadros</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Configurar Quadros Kanban</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto pr-2">
          {columns.map((column, index) => (
            <div 
              key={column.id} 
              className="flex flex-col gap-3 p-3 border rounded-md relative"
            >
              <div className="absolute top-2 right-2 flex gap-1">
                <button 
                  onClick={() => moveColumnUp(index)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  disabled={index === 0}
                >
                  <Move className="h-4 w-4 rotate-90" />
                </button>
                <button 
                  onClick={() => moveColumnDown(index)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  disabled={index === columns.length - 1}
                >
                  <Move className="h-4 w-4 -rotate-90" />
                </button>
                <button 
                  onClick={() => handleRemoveColumn(column.id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                  disabled={columns.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
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
              
              <div>
                <Label htmlFor={`width-${column.id}`}>
                  Largura: {Math.round(column.defaultSize || 0)}%
                </Label>
                <Slider
                  id={`width-${column.id}`}
                  min={10}
                  max={90}
                  step={1}
                  value={[column.defaultSize || 25]}
                  onValueChange={(values) => handleSizeChange(column.id, values[0])}
                  className="mt-2"
                />
              </div>
              
              <div className={`flex items-center gap-1 p-1 rounded ${colorMap[column.color as keyof typeof colorMap] || "bg-kanban-blue text-white"}`}>
                <div 
                  className="h-3 bg-white/80 rounded"
                  style={{ width: `${column.defaultSize || 25}%` }}
                ></div>
                <span className="text-xs font-medium">{Math.round(column.defaultSize || 0)}%</span>
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

// Helper function for color map
const colorMap = {
  blue: "bg-kanban-blue",
  yellow: "bg-kanban-yellow",
  purple: "bg-kanban-purple", 
  green: "bg-kanban-green",
  red: "bg-red-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500"
};
