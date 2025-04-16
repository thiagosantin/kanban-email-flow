
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Email } from "@/types/email";
import { EmailViewer } from "./EmailViewer";

interface EmailCardProps {
  email: Email;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
}

export function EmailCard({ email, selected = false, onSelect }: EmailCardProps) {
  const [showEmailViewer, setShowEmailViewer] = useState(false);
  
  const initials = email.from_email
    .split('@')[0]
    .split('.')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  // Format the date for display
  const displayDate = new Date(email.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });

  const handleEmailClick = () => {
    setShowEmailViewer(true);
  };

  const handleCheckboxChange = (event: React.MouseEvent) => {
    // Impedir que o clique no checkbox abra o visualizador de e-mail
    event.stopPropagation();
    if (onSelect) {
      onSelect(!selected);
    }
  };

  return (
    <>
      <div 
        className={cn(
          "p-3 rounded-md border hover:shadow-md transition-all relative",
          email.read ? "bg-white border-kanban-gray-200" : "bg-kanban-blue/5 border-kanban-blue/30 font-medium",
          selected && "ring-2 ring-kanban-blue/40"
        )}
        onClick={handleEmailClick}
      >
        {onSelect && (
          <div 
            className="absolute top-2 left-2" 
            onClick={handleCheckboxChange}
          >
            <Checkbox 
              checked={selected} 
              className="h-4 w-4 border-kanban-gray-400"
            />
          </div>
        )}
        
        <div className="flex items-start space-x-2">
          <Avatar className="h-8 w-8 mt-1 ml-6">
            <AvatarImage src={`https://avatars.dicebear.com/api/initials/${email.from_email}.svg`} alt={email.from_email} />
            <AvatarFallback className="bg-kanban-blue/20 text-kanban-blue text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-kanban-gray-800 truncate">
                {email.from_name || email.from_email}
              </p>
              <div className="flex items-center space-x-1">
                {email.flagged && (
                  <Star className="h-4 w-4 fill-kanban-yellow stroke-kanban-yellow" />
                )}
                <span className="text-xs text-kanban-gray-500">{displayDate}</span>
              </div>
            </div>
            
            <h4 className="text-sm font-medium text-kanban-gray-900 truncate mt-1">
              {email.subject}
            </h4>
            
            <p className="text-xs text-kanban-gray-600 line-clamp-2 mt-1">
              {email.preview || "No preview available"}
            </p>
          </div>
        </div>
      </div>

      {showEmailViewer && (
        <EmailViewer 
          email={email} 
          isOpen={showEmailViewer} 
          onClose={() => setShowEmailViewer(false)} 
        />
      )}
    </>
  );
}
