import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserRoles {
  roles: AppRole[];
  isAdmin: boolean;
  isEngineer: boolean;
  isViewer: boolean;
}

export function useUserRole() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async (): Promise<UserRoles> => {
      if (!user?.id) {
        return { roles: [], isAdmin: false, isEngineer: false, isViewer: false };
      }
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const roles = data?.map(r => r.role) || [];
      
      return {
        roles,
        isAdmin: roles.includes('admin'),
        isEngineer: roles.includes('engineer'),
        isViewer: roles.includes('viewer'),
      };
    },
    enabled: !!user?.id,
  });
}
