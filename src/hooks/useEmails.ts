
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Email, EmailStatus } from '@/types/email';

export function useEmails(folderId?: string) {
  const queryClient = useQueryClient();

  const { data: emails = [], isLoading } = useQuery({
    queryKey: ['emails', folderId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('emails')
          .select('*')
          .order('date', { ascending: false });
        
        // If a folder ID is provided, filter by folder
        if (folderId) {
          query = query.eq('folder_id', folderId);
          console.log('Fetching emails for folder:', folderId);
        }

        // Try to filter by archived and deleted fields if they exist
        try {
          // First check if the columns exist by getting the first email
          const { data: testEmail, error: testError } = await supabase
            .from('emails')
            .select('*')
            .limit(1);
          
          // If we have a test email and it has the archived property
          if (testEmail && testEmail.length > 0 && 'archived' in testEmail[0]) {
            // The columns exist, apply the filters
            query = query.is('archived', null).is('deleted', null);
          }
        } catch (e) {
          console.log('Archived/deleted columns may not exist, skipping filters');
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching emails:', error);
          toast.error('Failed to load emails');
          throw error;
        }

        console.log(`Fetched ${data?.length || 0} emails${folderId ? ' for folder ' + folderId : ''}`);
        return data as Email[];
      } catch (error: any) {
        console.error('Failed to fetch emails:', error);
        toast.error('Failed to load emails: ' + error.message);
        return [];
      }
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

  const archiveEmails = useMutation({
    mutationFn: async (emailIds: string[]) => {
      console.log(`Archiving ${emailIds.length} emails`);
      
      try {
        // Check if the archived column exists
        const { data: testEmail, error: testError } = await supabase
          .from('emails')
          .select('*')
          .limit(1);
        
        if (testError) throw testError;
        
        if (testEmail && testEmail.length > 0 && 'archived' in testEmail[0]) {
          // Column exists, proceed with update
          const { data, error } = await supabase
            .from('emails')
            .update({ 
              archived: true, 
              updated_at: new Date().toISOString() 
            })
            .in('id', emailIds)
            .select();

          if (error) throw error;
          return data;
        } else {
          // Column doesn't exist, use a different approach - update status to 'done'
          const { data, error } = await supabase
            .from('emails')
            .update({ 
              status: 'done',  // Move to done as an alternative
              updated_at: new Date().toISOString() 
            })
            .in('id', emailIds)
            .select();

          if (error) throw error;
          toast.info('Archived functionality not fully available - emails marked as done');
          return data;
        }
      } catch (error: any) {
        console.error('Error archiving emails:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast.success(`${data.length} emails arquivados com sucesso`);
    },
    onError: (error) => {
      console.error('Archive error:', error);
      toast.error('Falha ao arquivar emails');
    }
  });

  const trashEmails = useMutation({
    mutationFn: async (emailIds: string[]) => {
      console.log(`Moving ${emailIds.length} emails to trash`);
      
      try {
        // Check if the deleted column exists
        const { data: testEmail, error: testError } = await supabase
          .from('emails')
          .select('*')
          .limit(1);
        
        if (testError) throw testError;
        
        if (testEmail && testEmail.length > 0 && 'deleted' in testEmail[0]) {
          // Column exists, proceed with update
          const { data, error } = await supabase
            .from('emails')
            .update({ 
              deleted: true, 
              updated_at: new Date().toISOString() 
            })
            .in('id', emailIds)
            .select();

          if (error) throw error;
          return data;
        } else {
          // Column doesn't exist, update status to 'done' as a fallback
          const { data, error } = await supabase
            .from('emails')
            .update({ 
              status: 'done',
              updated_at: new Date().toISOString() 
            })
            .in('id', emailIds)
            .select();

          if (error) throw error;
          toast.info('Trash functionality not fully available - emails marked as done');
          return data;
        }
      } catch (error: any) {
        console.error('Error trashing emails:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast.success(`${data.length} emails movidos para lixeira`);
    },
    onError: (error) => {
      console.error('Trash error:', error);
      toast.error('Falha ao mover emails para lixeira');
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
    updateEmailStatus: updateEmailStatus.mutate,
    archiveEmails: archiveEmails.mutate,
    trashEmails: trashEmails.mutate
  };
}
