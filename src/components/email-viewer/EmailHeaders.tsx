
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Email } from "@/types/email";

interface EmailHeadersProps {
  email: Email;
  formattedDate: string;
}

export function EmailHeaders({ email, formattedDate }: EmailHeadersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Dummy headers (in a real app, these would come from the email)
  const emailHeaders = {
    "From": `${email.from_name || ''} <${email.from_email}>`,
    "Date": formattedDate,
    "Subject": email.subject,
    "To": "me@example.com",
    "Message-ID": `<${Math.random().toString(36).substring(2)}@example.com>`,
  };

  return (
    <div className="rounded-md border">
      <div className="flex p-3 text-sm font-medium items-center cursor-pointer justify-between" 
           onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span>Cabeçalhos do Email</span>
        </div>
        <Button variant="ghost" size="sm">Exibir detalhes</Button>
      </div>
      {isExpanded && (
        <div className="border-t p-3 text-sm">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            {Object.entries(emailHeaders).map(([key, value]) => (
              <>
                <div className="font-medium">{key}:</div>
                <div className="text-muted-foreground break-all">{value}</div>
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
