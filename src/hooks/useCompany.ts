import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/integrations/supabase/types';

type Company = Database['public']['Tables']['companies']['Row'];

export function useCompany() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['company', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // First get the profile to get company_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) throw profileError;
      if (!profile?.company_id) return null;
      
      // Then get the company data
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profile.company_id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Company | null;
    },
    enabled: !!user?.id,
  });
}
