
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BackgroundJob, JobStatus } from '@/types/email';
import { Database } from '@/types/supabase';

type BackgroundJobWithAccount = BackgroundJob & { 
  email_accounts?: { email: string } | null 
};

export function useBackgroundJobs() {
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['background_jobs'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('background_jobs')
          .select('*, email_accounts(email)')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching background jobs:', error);
          toast.error('Failed to load background jobs: ' + (error.message || 'Unknown error'));
          throw error;
        }
        
        // Safely cast the data with proper type assertion
        return (data || []) as unknown as BackgroundJobWithAccount[];
      } catch (err: any) {
        console.error('Unexpected error in useBackgroundJobs:', err);
        toast.error('Failed to load background jobs: ' + (err.message || 'Unknown error'));
        throw err;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  const manageJobMutation = useMutation({
    mutationFn: async ({ jobId, action }: { jobId: string; action: string }) => {
      setActionLoading(prev => ({ ...prev, [jobId]: true }));
      
      try {
        const { data, error } = await supabase.functions.invoke('admin-manage-tasks', {
          body: { taskId: jobId, action }
        });

        if (error) {
          console.error('Error managing job:', error);
          throw new Error(error.message || 'Failed to execute action');
        }
        
        return data;
      } finally {
        setActionLoading(prev => ({ ...prev, [jobId]: false }));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['background_jobs'] });
      toast.success('Task action successful');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message || 'Unknown error occurred'}`);
    }
  });

  const triggerScheduledSync = useMutation({
    mutationFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('scheduled-sync', {
          body: { manual_trigger: true }
        });

        if (error) {
          console.error('Error triggering scheduled sync:', error);
          throw new Error(error.message || 'Failed to trigger scheduled sync');
        }
        
        return data;
      } catch (err: any) {
        console.error('Error in triggerScheduledSync:', err);
        throw new Error(err.message || 'Failed to trigger scheduled sync');
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['background_jobs'] });
      queryClient.invalidateQueries({ queryKey: ['email_accounts'] });
      toast.success(`Processed ${data?.results?.length || 0} accounts`);
    },
    onError: (error: Error) => {
      toast.error(`Error triggering scheduled sync: ${error.message || 'Unknown error'}`);
    }
  });

  const scheduleEmailSync = useMutation({
    mutationFn: async ({ accountId, schedule }: { accountId: string; schedule?: string }) => {
      try {
        // Using functions.invoke instead of rpc
        const { data, error } = await supabase.functions.invoke('schedule-sync', {
          body: { 
            account_id: accountId,
            schedule: schedule 
          }
        });

        if (error) {
          console.error('Error scheduling sync:', error);
          throw new Error(error.message || 'Failed to schedule email sync');
        }
        
        return data;
      } catch (err: any) {
        console.error('Error in scheduleEmailSync:', err);
        throw new Error(err.message || 'Failed to schedule email sync');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['background_jobs'] });
      toast.success('Email sync scheduled');
    },
    onError: (error: Error) => {
      toast.error(`Error scheduling sync: ${error.message || 'Unknown error occurred'}`);
    }
  });

  return {
    jobs,
    isLoading,
    error,
    refetch,
    actionLoading,
    manageJob: manageJobMutation.mutate,
    triggerScheduledSync: triggerScheduledSync.mutate,
    isTriggeringSync: triggerScheduledSync.isPending,
    scheduleEmailSync: scheduleEmailSync.mutate
  };
}
