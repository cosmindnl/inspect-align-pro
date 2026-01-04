import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Report = Database['public']['Tables']['reports']['Row'];
type ReportInsert = Database['public']['Tables']['reports']['Insert'];
type ReportUpdate = Database['public']['Tables']['reports']['Update'];

export interface ReportWithRelations extends Report {
  sites: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    clients: {
      id: string;
      name: string;
    } | null;
  } | null;
  engineers: {
    id: string;
    signature_url: string | null;
    anre_certificate_number: string | null;
    profiles: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  } | null;
}

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
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
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ReportWithRelations[];
    },
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ['reports', id],
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
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as ReportWithRelations | null;
    },
    enabled: !!id,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (report: ReportInsert) => {
      const { data, error } = await supabase
        .from('reports')
        .insert(report)
        .select()
        .single();
      
      if (error) throw error;
      return data as Report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: ReportUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Report;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports', data.id] });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete
      const { error } = await supabase
        .from('reports')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
