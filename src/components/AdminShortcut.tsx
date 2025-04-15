
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function AdminShortcut() {
  const navigate = useNavigate();
  const { isAdmin } = useAdminStatus();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Erro ao realizar logout');
    }
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-lg hover:shadow-xl"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 text-red-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sair do Sistema</p>
          </TooltipContent>
        </Tooltip>

        {isAdmin && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full shadow-lg hover:shadow-xl"
                onClick={() => navigate('/admin')}
              >
                <ShieldAlert className="h-5 w-5 text-red-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Painel Admin</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
