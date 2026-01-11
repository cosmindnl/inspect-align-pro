import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReportWithRelations } from './useReports';

export function useDeletedReports() {
  return useQuery({
    queryKey: ['deleted-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          sites (
            id,
            name,
            address,
            city,
            clients (
              id,
              name
            )
          ),
          engineers (
            id,
            signature_url,
            anre_certificate_number,
            profiles (
              first_name,
              last_name
            )
          )
        `)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });
      
      if (error) throw error;
      return data as ReportWithRelations[];
    },
  });
}

export function useRestoreReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reports')
        .update({ deleted_at: null })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['deleted-reports'] });
    },
  });
}

export function useBulkUpdateStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const { error } = await supabase
        .from('reports')
        .update({ status: status as any })
        .in('id', ids);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useBulkDeleteReports() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('reports')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', ids);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['deleted-reports'] });
    },
  });
}

export function usePermanentDeleteReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // First delete related measurements
      await supabase.from('measurements').delete().eq('report_id', id);
      // Then delete report files
      await supabase.from('report_files').delete().eq('report_id', id);
      // Finally delete the report
      const { error } = await supabase.from('reports').delete().eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deleted-reports'] });
    },
  });
}
