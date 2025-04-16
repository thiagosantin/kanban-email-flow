
import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Attachment {
  name: string;
  size: string;
  type: string;
}

interface EmailAttachmentsProps {
  attachments: Attachment[];
}

export function EmailAttachments({ attachments }: EmailAttachmentsProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
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
  );
}
