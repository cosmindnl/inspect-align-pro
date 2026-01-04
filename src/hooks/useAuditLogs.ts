import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

export function useReportAuditLogs(reportId: string) {
  return useQuery({
    queryKey: ['audit_logs', 'reports', reportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('table_name', 'reports')
        .eq('record_id', reportId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AuditLog[];
    },
    enabled: !!reportId,
  });
}

export function useCreateAuditLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (log: {
      action: string;
      table_name: string;
      record_id: string;
      old_values?: Record<string, unknown>;
      new_values?: Record<string, unknown>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          action: log.action,
          table_name: log.table_name,
          record_id: log.record_id,
          old_values: log.old_values as any,
          new_values: log.new_values as any,
          user_id: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as AuditLog;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['audit_logs', variables.table_name, variables.record_id] 
      });
    },
  });
}
