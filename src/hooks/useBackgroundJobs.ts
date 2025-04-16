
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
      const { data, error } = await supabase
        .from('background_jobs')
        .select('*, email_accounts(email)')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to load background jobs');
        throw error;
      }
      
      // Cast the data to match our expected type
      return (data || []) as BackgroundJobWithAccount[];
    }
  });

  const manageJobMutation = useMutation({
    mutationFn: async ({ jobId, action }: { jobId: string; action: string }) => {
      setActionLoading(prev => ({ ...prev, [jobId]: true }));
      
      try {
        const { data, error } = await supabase.functions.invoke('admin-manage-tasks', {
          body: { taskId: jobId, action }
        });

        if (error) throw error;
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
      toast.error(`Error: ${error.message}`);
    }
  });

  const triggerScheduledSync = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('scheduled-sync', {
        body: { manual_trigger: true }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['background_jobs'] });
      queryClient.invalidateQueries({ queryKey: ['email_accounts'] });
      toast.success(`Processed ${data?.results?.length || 0} accounts`);
    },
    onError: (error: Error) => {
      toast.error(`Error triggering scheduled sync: ${error.message}`);
    }
  });

  // Fixed this mutation to not use RPC since it's not in our type definition yet
  const scheduleEmailSync = useMutation({
    mutationFn: async ({ accountId, schedule }: { accountId: string; schedule?: string }) => {
      // Using functions.invoke instead of rpc
      const { data, error } = await supabase.functions.invoke('schedule-sync', {
        body: { 
          account_id: accountId,
          schedule: schedule 
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['background_jobs'] });
      toast.success('Email sync scheduled');
    },
    onError: (error: Error) => {
      toast.error(`Error scheduling sync: ${error.message}`);
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
