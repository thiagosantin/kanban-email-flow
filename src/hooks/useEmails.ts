
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Email, EmailStatus } from '@/types/email';

export function useEmails(folderId?: string) {
  const queryClient = useQueryClient();

  const { data: emails = [], isLoading } = useQuery({
    queryKey: ['emails', folderId],
    queryFn: async () => {
      let query = supabase
        .from('emails')
        .select('*')
        .order('date', { ascending: false });
      
      // If a folder ID is provided, filter by folder
      if (folderId) {
        query = query.eq('folder_id', folderId);
        console.log('Fetching emails for folder:', folderId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching emails:', error);
        toast.error('Failed to load emails');
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} emails${folderId ? ' for folder ' + folderId : ''}`);
      return data as Email[];
    }
  });

  const updateEmailStatus = useMutation({
    mutationFn: async ({ emailId, newStatus }: { emailId: string; newStatus: EmailStatus }) => {
      console.log(`Updating email ${emailId} to status ${newStatus}`);
      
      // Use a direct update instead of the RPC function which is returning an error
      const { data, error } = await supabase
        .from('emails')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', emailId)
        .select();

      if (error) {
        console.error('Error updating email status:', error);
        toast.error('Failed to update email status');
        throw error;
      }

      console.log('Email status updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast.success('Email moved successfully');
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error('Failed to move email');
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
    allEmails: emails,
    isLoading,
    updateEmailStatus: updateEmailStatus.mutate
  };
}
