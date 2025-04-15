
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Email, EmailStatus } from '@/types/email';

export function useEmails() {
  const queryClient = useQueryClient();

  const { data: emails = [], isLoading } = useQuery({
    queryKey: ['emails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        toast.error('Failed to load emails');
        throw error;
      }

      return data as Email[];
    }
  });

  const updateEmailStatus = useMutation({
    mutationFn: async ({ emailId, newStatus }: { emailId: string; newStatus: EmailStatus }) => {
      const { data, error } = await supabase
        .rpc('update_email_status', {
          email_id: emailId,
          new_status: newStatus
        });

      if (error) {
        toast.error('Failed to update email status');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    }
  });

  const emailsByStatus = emails.reduce((acc, email) => {
    if (!acc[email.status]) {
      acc[email.status] = [];
    }
    acc[email.status].push(email);
    return acc;
  }, {} as Record<EmailStatus, Email[]>);

  return {
    emails: {
      inbox: emailsByStatus.inbox || [],
      awaiting: emailsByStatus.awaiting || [],
      processing: emailsByStatus.processing || [],
      done: emailsByStatus.done || []
    },
    isLoading,
    updateEmailStatus: updateEmailStatus.mutate
  };
}
