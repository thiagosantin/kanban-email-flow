
import { useParams } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEmails } from "@/hooks/useEmails";
import { EmailCard } from "@/components/EmailCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";

const EmailFolderView = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { allEmails, isLoading } = useEmails(folderId);
  const { accounts } = useEmailAccounts();

  // Find the current folder name
  const currentFolder = accounts
    .flatMap(account => account.folders)
    .find(folder => folder?.id === folderId);

  const folderName = currentFolder?.name || "Folder";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-kanban-gray-100">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <div className="border-b bg-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/dashboard')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">{folderName}</h1>
              <span className="text-sm text-muted-foreground">
                ({allEmails.length} emails)
              </span>
            </div>
          </div>
          
          <div className="p-4 flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : allEmails.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No emails found in this folder</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {allEmails.map((email) => (
                  <EmailCard key={email.id} email={email} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default EmailFolderView;
