import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Site = Database['public']['Tables']['sites']['Row'];
type SiteInsert = Database['public']['Tables']['sites']['Insert'];
type SiteUpdate = Database['public']['Tables']['sites']['Update'];

export interface SiteWithClient extends Site {
  clients: {
    id: string;
    name: string;
  } | null;
}

export function useSites() {
  return useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select(`
          *,
          clients (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SiteWithClient[];
    },
  });
}

export function useSitesByClient(clientId: string) {
  return useQuery({
    queryKey: ['sites', 'client', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Site[];
    },
    enabled: !!clientId,
  });
}

export function useSite(id: string) {
  return useQuery({
    queryKey: ['sites', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select(`
          *,
          clients (
            id,
            name
          )
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as SiteWithClient | null;
    },
    enabled: !!id,
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (site: SiteInsert) => {
      const { data, error } = await supabase
        .from('sites')
        .insert(site)
        .select()
        .single();
      
      if (error) throw error;
      return data as Site;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
}

export function useUpdateSite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: SiteUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('sites')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Site;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['sites', data.id] });
    },
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
}
