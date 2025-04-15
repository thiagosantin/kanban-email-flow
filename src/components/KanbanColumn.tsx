
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Badge } from "@/components/ui/badge";
import { EmailCard } from "@/components/EmailCard";
import type { Email } from "@/types/email";

type KanbanColumnProps = {
  id: string;
  title: string;
  emails: Email[];
  count: number;
  color: "blue" | "yellow" | "purple" | "green" | "red" | "orange" | "pink";
};

export function KanbanColumn({ id, title, emails, count, color }: KanbanColumnProps) {
  const colorMap = {
    blue: "bg-kanban-blue text-white",
    yellow: "bg-kanban-yellow text-black",
    purple: "bg-kanban-purple text-white",
    green: "bg-kanban-green text-white",
    red: "bg-red-500 text-white",
    orange: "bg-orange-500 text-white",
    pink: "bg-pink-500 text-white"
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
                    className={`mb-2 ${snapshot.isDragging ? "opacity-70" : ""}`}
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
}
