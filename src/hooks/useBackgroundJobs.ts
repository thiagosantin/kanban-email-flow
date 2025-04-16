
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BackgroundJob, JobStatus } from '@/types/email';

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
      
      return data as (BackgroundJob & { email_accounts?: { email: string } })[];
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

  const scheduleEmailSync = useMutation({
    mutationFn: async ({ accountId, schedule }: { accountId: string; schedule?: string }) => {
      const { data, error } = await supabase.rpc('schedule_email_sync', {
        p_account_id: accountId,
        p_schedule: schedule
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
    isTriggeringSync: triggerScheduledSync.isPending, // Changed from isLoading to isPending
    scheduleEmailSync: scheduleEmailSync.mutate
  };
}
