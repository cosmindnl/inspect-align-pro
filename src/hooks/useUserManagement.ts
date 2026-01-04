import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface UserWithRole {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  roles: AppRole[];
  created_at: string | null;
}

export function useCompanyUsers() {
  const { data: profile } = useProfile();
  
  return useQuery({
    queryKey: ['company-users', profile?.company_id],
    queryFn: async (): Promise<UserWithRole[]> => {
      if (!profile?.company_id) return [];
      
      // First get all profiles in the company
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, created_at')
        .eq('company_id', profile.company_id);
      
      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) return [];
      
      // Get roles for all users
      const userIds = profiles.map(p => p.id);
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);
      
      if (rolesError) throw rolesError;
      
      // Get emails from auth (we'll use supabase function or just show profile data)
      // Since we can't access auth.users directly, we'll work with what we have
      
      // Group roles by user
      const rolesByUser: Record<string, AppRole[]> = {};
      roles?.forEach(r => {
        if (!rolesByUser[r.user_id]) {
          rolesByUser[r.user_id] = [];
        }
        rolesByUser[r.user_id].push(r.role);
      });
      
      return profiles.map(p => ({
        id: p.id,
        email: '', // Will be populated if we add email to profiles later
        first_name: p.first_name,
        last_name: p.last_name,
        roles: rolesByUser[p.id] || [],
        created_at: p.created_at,
      }));
    },
    enabled: !!profile?.company_id,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  
  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      // First, remove all existing roles for the user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) throw deleteError;
      
      // Then add the new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });
      
      if (insertError) throw insertError;
      
      return { userId, newRole };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-users', profile?.company_id] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    },
  });
}

export function useAdminCount() {
  const { data: profile } = useProfile();
  
  return useQuery({
    queryKey: ['admin-count', profile?.company_id],
    queryFn: async (): Promise<number> => {
      if (!profile?.company_id) return 0;
      
      // Get all profiles in the company
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .eq('company_id', profile.company_id);
      
      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) return 0;
      
      const userIds = profiles.map(p => p.id);
      
      // Count admins
      const { data: admins, error: adminsError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('user_id', userIds)
        .eq('role', 'admin');
      
      if (adminsError) throw adminsError;
      
      return admins?.length || 0;
    },
    enabled: !!profile?.company_id,
  });
}
