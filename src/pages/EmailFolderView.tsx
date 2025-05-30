import { useParams } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEmails } from "@/hooks/useEmails";
import { EmailCard } from "@/components/EmailCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Folder, Check, Archive, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { TaskSidebar } from "@/components/TaskSidebar";
import { useState } from "react";
import { toast } from "sonner";
import { cacheService } from "@/utils/cacheService";
import { CacheDebugger } from "@/components/CacheDebugger";

const EmailFolderView = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { allEmails, isLoading, archiveEmails, trashEmails } = useEmails(folderId);
  const { accounts } = useEmailAccounts();
  const isMobile = useIsMobile();
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  // Find the current folder name
  const currentFolder = accounts
    .flatMap(account => account.folders)
    .find(folder => folder?.id === folderId);

  const folderName = currentFolder?.name || "Folder";
  
  // Find the parent account
  const parentAccount = accounts.find(account => 
    account.folders?.some(folder => folder.id === folderId)
  );
  
  const handleArchiveSelected = () => {
    if (selectedEmails.length === 0) {
      toast.info("Nenhum email selecionado para arquivar");
      return;
    }
    
    archiveEmails(selectedEmails);
    setSelectedEmails([]);
  };

  const handleTrashSelected = () => {
    if (selectedEmails.length === 0) {
      toast.info("Nenhum email selecionado para mover para lixeira");
      return;
    }
    
    trashEmails(selectedEmails);
    setSelectedEmails([]);
    
    // Clear cache for this folder to ensure UI updates
    if (folderId) {
      cacheService.delete(`emails_${folderId}`);
    }
  };
  
  const handleSelectEmail = (emailId: string, selected: boolean) => {
    if (selected) {
      setSelectedEmails(prev => [...prev, emailId]);
    } else {
      setSelectedEmails(prev => prev.filter(id => id !== emailId));
    }
  };
  
  const handleMarkAll = () => {
    // If all emails are already selected, deselect all
    if (selectedEmails.length === allEmails.length) {
      setSelectedEmails([]);
      return;
    }
    
    // Otherwise, select all visible emails
    const allEmailIds = allEmails.map(email => email.id);
    setSelectedEmails(allEmailIds);
    toast.success(`${allEmailIds.length} emails selecionados`);
  };

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
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAll}
                className="h-8"
              >
                <Check className="h-4 w-4 mr-1" />
                Marcar Todos
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleArchiveSelected}
                disabled={selectedEmails.length === 0}
                className={`h-8 ${selectedEmails.length > 0 ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' : ''}`}
              >
                <Archive className="h-4 w-4 mr-1" />
                Arquivar
                {selectedEmails.length > 0 && (
                  <span className="ml-1 text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full">
                    {selectedEmails.length}
                  </span>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleTrashSelected}
                disabled={selectedEmails.length === 0}
                className={`h-8 ${selectedEmails.length > 0 ? 'bg-red-50 border-red-200 hover:bg-red-100' : ''}`}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Lixeira
                {selectedEmails.length > 0 && (
                  <span className="ml-1 text-xs bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full">
                    {selectedEmails.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
          
          <div className="p-4 flex-1 overflow-auto">
            {isMobile ? (
              // Mobile layout
              <div className="flex flex-col h-full">
                <div className="flex-1 mb-4">
                  {renderEmailList()}
                </div>
                <div className="space-y-4">
                  <CacheDebugger />
                  <TaskSidebar />
                </div>
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
                  <div className="h-full overflow-auto">
                    <div className="space-y-4">
                      <CacheDebugger />
                      <TaskSidebar />
                    </div>
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
          <EmailCard 
            key={email.id} 
            email={email} 
            selected={selectedEmails.includes(email.id)}
            onSelect={(selected) => handleSelectEmail(email.id, selected)}
          />
        ))}
      </div>
    );
  }
};

export default EmailFolderView;
