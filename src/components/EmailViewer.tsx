
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { type Email } from "@/types/email";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmailSender } from "./email-viewer/EmailSender";
import { EmailStatus } from "./email-viewer/EmailStatus";
import { EmailCustomFields } from "./email-viewer/EmailCustomFields";
import { EmailHeaders } from "./email-viewer/EmailHeaders";
import { EmailAttachments } from "./email-viewer/EmailAttachments";
import { EmailContent } from "./email-viewer/EmailContent";

interface EmailViewerProps {
  email: Email;
  isOpen: boolean;
  onClose: () => void;
}

export function EmailViewer({ email, isOpen, onClose }: EmailViewerProps) {
  // Format the date for display
  const formattedDate = new Date(email.date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

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
          <EmailSender email={email} formattedDate={formattedDate} />

          {/* Email status */}
          <EmailStatus email={email} />

          {/* Custom fields section */}
          <EmailCustomFields />

          <Separator />

          {/* Headers accordion */}
          <EmailHeaders email={email} formattedDate={formattedDate} />

          {/* Attachments section */}
          <EmailAttachments attachments={attachments} />

          {/* Email content */}
          <EmailContent email={email} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
