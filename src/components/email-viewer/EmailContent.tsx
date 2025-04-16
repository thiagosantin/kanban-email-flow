
import { Email } from "@/types/email";

interface EmailContentProps {
  email: Email;
}

export function EmailContent({ email }: EmailContentProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <div dangerouslySetInnerHTML={{ __html: email.content || email.preview || "No content available" }} />
    </div>
  );
}
