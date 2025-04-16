
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Info,
  Bug,
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type LogLevel = 'info' | 'warning' | 'error' | 'debug';

interface SystemLog {
  id: string;
  level: LogLevel;
  message: string;
  metadata: Record<string, any>;
  source: string | null;
  created_at: string;
  user_id: string | null;
}

export function SystemLogsViewer() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const logsPerPage = 10;

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['system-logs', currentPage, selectedLevel],
    queryFn: async () => {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * logsPerPage, currentPage * logsPerPage - 1);

      if (selectedLevel !== 'all') {
        query = query.eq('level', selectedLevel);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SystemLog[];
    },
  });

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'debug':
        return <Bug className="h-4 w-4 text-purple-500" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Select
          value={selectedLevel}
          onValueChange={(value) => setSelectedLevel(value as LogLevel | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Level</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="w-[180px]">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : logs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No logs found
                </TableCell>
              </TableRow>
            ) : (
              logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getLevelIcon(log.level)}
                      <span className="capitalize">{log.level}</span>
                    </div>
                  </TableCell>
                  <TableCell>{log.message}</TableCell>
                  <TableCell>{log.source || '-'}</TableCell>
                  <TableCell>{formatDate(log.created_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="cursor-pointer"
              aria-disabled={currentPage === 1}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>{currentPage}</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(p => p + 1)}
              className="cursor-pointer"
              aria-disabled={!logs || logs.length < logsPerPage}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
