
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Email } from "@/types/email";

interface EmailSenderProps {
  email: Email;
  formattedDate: string;
}

export function EmailSender({ email, formattedDate }: EmailSenderProps) {
  const initials = email.from_email
    .split('@')[0]
    .split('.')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={`https://avatars.dicebear.com/api/initials/${email.from_email}.svg`} alt={email.from_email} />
        <AvatarFallback className="bg-kanban-blue/20 text-kanban-blue">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="font-medium">{email.from_name || email.from_email}</div>
        <div className="text-sm text-muted-foreground">{email.from_email}</div>
      </div>
      <div className="ml-auto text-sm text-muted-foreground">
        {formattedDate}
      </div>
    </div>
  );
}
