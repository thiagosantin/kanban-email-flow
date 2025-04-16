
import { Badge } from "@/components/ui/badge";
import { Email } from "@/types/email";

interface EmailStatusProps {
  email: Email;
}

export function EmailStatus({ email }: EmailStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="text-xs">{email.status}</Badge>
      {!email.read && <Badge className="bg-kanban-blue text-white text-xs">Não lido</Badge>}
    </div>
  );
}
