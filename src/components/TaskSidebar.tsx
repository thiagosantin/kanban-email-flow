
import React, { useState } from "react";
import { Check, PlusCircle, X, CheckCircle, Circle, Tag, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

type Task = {
  id: string;
  text: string;
  completed: boolean;
  tags: string[];
};

type Tag = {
  id: string;
  name: string;
  color: string;
};

export function TaskSidebar() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", text: "Responder emails urgentes", completed: false, tags: ["urgente"] },
    { id: "2", text: "Preparar relatório semanal", completed: false, tags: ["trabalho"] },
    { id: "3", text: "Agendar reunião com equipe", completed: true, tags: ["trabalho"] },
  ]);
  
  const [tags, setTags] = useState<Tag[]>([
    { id: "1", name: "urgente", color: "bg-red-500" },
    { id: "2", name: "trabalho", color: "bg-blue-500" },
    { id: "3", name: "pessoal", color: "bg-green-500" },
  ]);
  
  const [newTask, setNewTask] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleAddTask = () => {
    if (newTask.trim()) {
      const newTaskObj: Task = {
        id: Date.now().toString(),
        text: newTask,
        completed: false,
        tags: activeTag ? [activeTag] : [],
      };
      
      setTasks([...tasks, newTaskObj]);
      setNewTask("");
    }
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const filteredTasks = activeTag 
    ? tasks.filter(task => task.tags.includes(activeTag))
    : tasks;

  const taskContent = (
    <div className="flex flex-col h-full">
      <div className="space-y-1 mb-4">
        <div className="flex items-center mb-4">
          <ListTodo className="mr-2 h-5 w-5 text-kanban-blue" />
          <h3 className="text-lg font-medium">Tarefas</h3>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Button 
            variant={activeTag === null ? "default" : "outline"} 
            size="sm" 
            onClick={() => setActiveTag(null)}
            className="h-7 px-2"
          >
            Todas
          </Button>
          {tags.map(tag => (
            <Button
              key={tag.id}
              variant={activeTag === tag.name ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTag(tag.name)}
              className="h-7 px-2"
            >
              <span className={`w-2 h-2 rounded-full mr-1.5 ${tag.color}`}></span>
              {tag.name}
            </Button>
          ))}
        </div>
        
        <div className="flex mb-4">
          <Input
            placeholder="Adicionar tarefa..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            className="flex-1 mr-2"
          />
          <Button onClick={handleAddTask} size="sm">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1">
        <ul className="space-y-2">
          {filteredTasks.map((task) => (
            <li 
              key={task.id} 
              className={`p-2 rounded-md border flex items-start justify-between group ${
                task.completed ? "bg-gray-50" : "bg-white"
              }`}
            >
              <div className="flex items-start">
                <button 
                  onClick={() => toggleTaskCompletion(task.id)}
                  className="mt-0.5 mr-2 flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle className="h-5 w-5 text-kanban-green" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                <div>
                  <p className={task.completed ? "line-through text-gray-500" : ""}>
                    {task.text}
                  </p>
                  {task.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {task.tags.map(tagName => {
                        const tagInfo = tags.find(t => t.name === tagName);
                        return tagInfo ? (
                          <Badge 
                            key={tagName} 
                            variant="outline" 
                            className={`text-xs ${tagInfo.color.replace('bg-', 'text-')} px-1.5 py-0`}
                          >
                            {tagName}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Para dispositivos móveis, usamos um Sheet (gaveta) para mostrar as tarefas
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed bottom-4 right-4 z-10 rounded-full h-14 w-14 shadow-lg">
            <ListTodo className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Tarefas</SheetTitle>
          </SheetHeader>
          {taskContent}
        </SheetContent>
      </Sheet>
    );
  }

  // Para desktop, mostramos a barra lateral normalmente
  return (
    <div className="hidden lg:block w-[300px] border-l p-4 overflow-hidden h-full flex flex-col bg-white">
      {taskContent}
    </div>
  );
}
