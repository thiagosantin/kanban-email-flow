
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Email } from "@/types/email";

interface EmailCardProps {
  email: Email;
}

export function EmailCard({ email }: EmailCardProps) {
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

  return (
    <div 
      className={cn(
        "p-3 rounded-md border cursor-pointer hover:shadow-md transition-all",
        email.read ? "bg-white border-kanban-gray-200" : "bg-kanban-blue/5 border-kanban-blue/30 font-medium"
      )}
    >
      <div className="flex items-start space-x-2">
        <Avatar className="h-8 w-8 mt-1">
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
  );
}
