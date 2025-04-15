
export type Task = {
  id: string;
  name: string;
  status: "running" | "paused" | "failed" | "completed";
  type: "sync" | "cron" | "background";
  created_at: string;
  updated_at: string;
  owner_id: string;
  owner_email: string;
  last_run: string | null;
  next_run: string | null;
  frequency: string;
  error?: string | null;
};

export type SystemStats = {
  activeUsers: number;
  totalTasks: number;
  activeTasks: number;
  failedTasks: number;
  emailAccounts: number;
  avgSyncTime: number;
};

export type SystemError = {
  id: string;
  message: string;
  stack?: string;
  timestamp: string;
  status?: number;
  path?: string;
  component?: string;
  severity: 'high' | 'medium' | 'low';
};
