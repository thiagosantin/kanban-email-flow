
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailCardProps {
  email: {
    id: string;
    from: string;
    subject: string;
    preview: string;
    date: string;
    read: boolean;
    flagged: boolean;
    avatar: string;
  };
}

export function EmailCard({ email }: EmailCardProps) {
  const initials = email.from
    .split('@')[0]
    .split('.')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div 
      className={cn(
        "p-3 rounded-md border cursor-pointer hover:shadow-md transition-all",
        email.read ? "bg-white border-kanban-gray-200" : "bg-kanban-blue/5 border-kanban-blue/30 font-medium"
      )}
    >
      <div className="flex items-start space-x-2">
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={email.avatar} alt={email.from} />
          <AvatarFallback className="bg-kanban-blue/20 text-kanban-blue text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-kanban-gray-800 truncate">{email.from}</p>
            <div className="flex items-center space-x-1">
              {email.flagged && (
                <Star className="h-4 w-4 fill-kanban-yellow stroke-kanban-yellow" />
              )}
              <span className="text-xs text-kanban-gray-500">{email.date}</span>
            </div>
          </div>
          
          <h4 className="text-sm font-medium text-kanban-gray-900 truncate mt-1">
            {email.subject}
          </h4>
          
          <p className="text-xs text-kanban-gray-600 line-clamp-2 mt-1">
            {email.preview}
          </p>
        </div>
      </div>
    </div>
  );
}
