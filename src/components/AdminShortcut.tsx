
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAdminStatus } from '@/hooks/useAdminStatus';

export function AdminShortcut() {
  const navigate = useNavigate();
  const { isAdmin } = useAdminStatus();

  if (!isAdmin) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg hover:shadow-xl"
            onClick={() => navigate('/admin')}
          >
            <ShieldAlert className="h-5 w-5 text-red-500" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Painel Admin</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
