
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { EmailCard } from "@/components/EmailCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Trash2, RefreshCw, Undo } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { TaskSidebar } from "@/components/TaskSidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Email } from "@/types/email";
import { cacheService } from "@/utils/cacheService";
import { CacheDebugger } from "@/components/CacheDebugger";

const TrashView = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchTrashedEmails = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('deleted', true)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching trashed emails:', error);
        toast.error('Failed to load trashed emails');
        throw error;
      }

      setEmails(data || []);
    } catch (error) {
      console.error('Failed to fetch trashed emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashedEmails();
  }, []);

  const handleSelectEmail = (emailId: string, selected: boolean) => {
    if (selected) {
      setSelectedEmails(prev => [...prev, emailId]);
    } else {
      setSelectedEmails(prev => prev.filter(id => id !== emailId));
    }
  };
  
  const handleMarkAll = () => {
    if (selectedEmails.length === emails.length) {
      setSelectedEmails([]);
      return;
    }
    
    const allEmailIds = emails.map(email => email.id);
    setSelectedEmails(allEmailIds);
    toast.success(`${allEmailIds.length} emails selecionados`);
  };
  
  const handleRestoreSelected = async () => {
    if (selectedEmails.length === 0) {
      toast.info("Nenhum email selecionado para restaurar");
      return;
    }
    
    setIsRestoring(true);
    try {
      const { data, error } = await supabase
        .from('emails')
        .update({ 
          deleted: null, 
          updated_at: new Date().toISOString() 
        })
        .in('id', selectedEmails)
        .select();

      if (error) {
        console.error('Error restoring emails:', error);
        toast.error('Falha ao restaurar emails');
        throw error;
      }
      
      // Clear cache for immediate UI update
      Object.keys(cacheService.keys()).forEach(key => {
        if (key.startsWith('emails_')) {
          cacheService.delete(key);
        }
      });
      
      toast.success(`${data.length} emails restaurados com sucesso`);
      setSelectedEmails([]);
      
      // Refresh the trash view
      fetchTrashedEmails();
    } catch (error) {
      console.error('Failed to restore emails:', error);
    } finally {
      setIsRestoring(false);
    }
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
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-semibold leading-tight">Lixeira</h1>
                  <span className="text-xs text-muted-foreground">Emails excluídos</span>
                </div>
              </div>
              
              <span className="text-sm ml-2 px-2 py-0.5 bg-muted rounded-full">
                {emails.length}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTrashedEmails}
                className="h-8"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAll}
                className="h-8"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Marcar Todos
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestoreSelected}
                disabled={selectedEmails.length === 0 || isRestoring}
                className={`h-8 ${selectedEmails.length > 0 ? 'bg-green-50 border-green-200 hover:bg-green-100' : ''}`}
              >
                {isRestoring ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Undo className="h-4 w-4 mr-1" />
                )}
                Restaurar
                {selectedEmails.length > 0 && (
                  <span className="ml-1 text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full">
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
    
    if (emails.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 px-4 h-full">
          <div className="bg-muted/50 p-4 rounded-full mb-3">
            <Trash2 className="h-8 w-8 text-muted-foreground/70" />
          </div>
          <p className="text-muted-foreground text-center">Lixeira vazia</p>
        </div>
      );
    }
    
    return (
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {emails.map((email) => (
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

export default TrashView;
