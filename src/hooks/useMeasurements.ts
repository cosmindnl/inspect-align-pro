import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Measurement = Database['public']['Tables']['measurements']['Row'];
type MeasurementInsert = Database['public']['Tables']['measurements']['Insert'];
type MeasurementUpdate = Database['public']['Tables']['measurements']['Update'];

export function useMeasurements(reportId: string) {
  return useQuery({
    queryKey: ['measurements', reportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Measurement[];
    },
    enabled: !!reportId,
  });
}

export function useCreateMeasurement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (measurement: MeasurementInsert) => {
      const { data, error } = await supabase
        .from('measurements')
        .insert(measurement)
        .select()
        .single();
      
      if (error) throw error;
      return data as Measurement;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['measurements', data.report_id] });
    },
  });
}

export function useUpdateMeasurement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: MeasurementUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('measurements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Measurement;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['measurements', data.report_id] });
    },
  });
}

export function useDeleteMeasurement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reportId }: { id: string; reportId: string }) => {
      const { error } = await supabase
        .from('measurements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return reportId;
    },
    onSuccess: (reportId) => {
      queryClient.invalidateQueries({ queryKey: ['measurements', reportId] });
    },
  });
}

export function useBulkCreateMeasurements() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (measurements: MeasurementInsert[]) => {
      const { data, error } = await supabase
        .from('measurements')
        .insert(measurements)
        .select();
      
      if (error) throw error;
      return data as Measurement[];
    },
    onSuccess: (data) => {
      if (data.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['measurements', data[0].report_id] });
      }
    },
  });
}
