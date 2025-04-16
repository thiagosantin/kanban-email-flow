
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Star, Flag, Mail, Calendar, User, Clock } from "lucide-react";
import { type Email } from "@/types/email";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface EmailViewerProps {
  email: Email;
  isOpen: boolean;
  onClose: () => void;
}

export function EmailViewer({ email, isOpen, onClose }: EmailViewerProps) {
  const initials = email.from_email
    .split('@')[0]
    .split('.')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  // Format the date for display
  const formattedDate = new Date(email.date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Dummy headers (in a real app, these would come from the email)
  const emailHeaders = {
    "From": `${email.from_name || ''} <${email.from_email}>`,
    "Date": formattedDate,
    "Subject": email.subject,
    "To": "me@example.com",
    "Message-ID": `<${Math.random().toString(36).substring(2)}@example.com>`,
  };

  // Dummy attachments (in a real app, these would come from the email)
  const attachments = [
    { name: "documento.pdf", size: "2.4 MB", type: "application/pdf" },
    { name: "imagem.jpg", size: "1.1 MB", type: "image/jpeg" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader className="space-y-2">
          <div className="flex justify-between items-start">
            <DialogTitle className="text-xl font-semibold">{email.subject}</DialogTitle>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon">
                <Star className={email.flagged ? "h-5 w-5 fill-kanban-yellow stroke-kanban-yellow" : "h-5 w-5"} />
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="sm">Fechar</Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1">
          {/* Sender info */}
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

          {/* Email status */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{email.status}</Badge>
            {!email.read && <Badge className="bg-kanban-blue text-white text-xs">Não lido</Badge>}
          </div>

          <Separator />

          {/* Headers accordion */}
          <div className="rounded-md border">
            <div className="flex p-3 text-sm font-medium items-center cursor-pointer justify-between" onClick={() => document.getElementById('headers')?.classList.toggle('hidden')}>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Cabeçalhos do Email</span>
              </div>
              <Button variant="ghost" size="sm">Exibir detalhes</Button>
            </div>
            <div id="headers" className="hidden border-t p-3 text-sm">
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                {Object.entries(emailHeaders).map(([key, value]) => (
                  <>
                    <div className="font-medium">{key}:</div>
                    <div className="text-muted-foreground break-all">{value}</div>
                  </>
                ))}
              </div>
            </div>
          </div>

          {/* Attachments section */}
          {attachments.length > 0 && (
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 mb-2">
                <Paperclip className="h-4 w-4" />
                <span className="font-medium">Anexos ({attachments.length})</span>
              </div>
              <div className="grid gap-2">
                {attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted/40 rounded p-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded flex items-center justify-center bg-muted text-xs font-medium">
                        {attachment.type.startsWith('image') ? 'IMG' : 'DOC'}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{attachment.name}</div>
                        <div className="text-xs text-muted-foreground">{attachment.size}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email content */}
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: email.content || email.preview || "No content available" }} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
