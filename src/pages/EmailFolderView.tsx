
import { useParams } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEmails } from "@/hooks/useEmails";
import { EmailCard } from "@/components/EmailCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { TaskSidebar } from "@/components/TaskSidebar";

const EmailFolderView = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { allEmails, isLoading } = useEmails(folderId);
  const { accounts } = useEmailAccounts();
  const isMobile = useIsMobile();

  // Find the current folder name
  const currentFolder = accounts
    .flatMap(account => account.folders)
    .find(folder => folder?.id === folderId);

  const folderName = currentFolder?.name || "Folder";
  
  // Find the parent account
  const parentAccount = accounts.find(account => 
    account.folders?.some(folder => folder.id === folderId)
  );

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
                className="hover:bg-muted/50"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <Folder className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-semibold leading-tight">{folderName}</h1>
                  {parentAccount && (
                    <span className="text-xs text-muted-foreground">{parentAccount.email}</span>
                  )}
                </div>
              </div>
              
              <span className="text-sm ml-2 px-2 py-0.5 bg-muted rounded-full">
                {allEmails.length}
              </span>
            </div>
          </div>
          
          <div className="p-4 flex-1 overflow-auto">
            {isMobile ? (
              // Mobile layout
              <div className="flex flex-col h-full">
                <div className="flex-1 mb-4">
                  {renderEmailList()}
                </div>
                <TaskSidebar />
              </div>
            ) : (
              // Desktop layout with resizable panels
              <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-130px)]">
                <ResizablePanel defaultSize={75} minSize={50}>
                  <div className="h-full pr-2 overflow-auto">
                    {renderEmailList()}
                  </div>
                </ResizablePanel>
                
                <ResizableHandle withHandle />
                
                <ResizablePanel defaultSize={25} minSize={15}>
                  <div className="h-full">
                    <TaskSidebar />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
  
  function renderEmailList() {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      );
    }
    
    if (allEmails.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 px-4 h-full">
          <div className="bg-muted/50 p-4 rounded-full mb-3">
            <Folder className="h-8 w-8 text-muted-foreground/70" />
          </div>
          <p className="text-muted-foreground text-center">Nenhum email encontrado nesta pasta</p>
        </div>
      );
    }
    
    return (
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {allEmails.map((email) => (
          <EmailCard key={email.id} email={email} />
        ))}
      </div>
    );
  }
};

export default EmailFolderView;
