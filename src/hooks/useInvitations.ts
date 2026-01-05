import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface Invitation {
  id: string;
  email: string;
  role: AppRole;
  status: string;
  created_at: string | null;
  expires_at: string;
  token: string;
}

export function useInvitations() {
  const { data: profile } = useProfile();
  
  return useQuery({
    queryKey: ['invitations', profile?.company_id],
    queryFn: async (): Promise<Invitation[]> => {
      if (!profile?.company_id) return [];
      
      const { data, error } = await supabase
        .from('invitations')
        .select('id, email, role, status, created_at, expires_at, token')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.company_id,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  
  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: AppRole }) => {
      if (!profile?.company_id) throw new Error('No company ID');
      
      // Get company name for the email
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', profile.company_id)
        .single();
      
      // Create invitation
      const { data: invitation, error } = await supabase
        .from('invitations')
        .insert({
          company_id: profile.company_id,
          email,
          role,
          invited_by: profile.id,
        })
        .select('token')
        .single();
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('Există deja o invitație activă pentru acest email');
        }
        throw error;
      }
      
      // Send invitation email
      const invitedByName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Un administrator';
      
      const { error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          email,
          role,
          invitedByName,
          companyName: company?.name || 'Compania',
          invitationToken: invitation.token,
          appUrl: window.location.origin,
        },
      });
      
      if (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // Don't throw - invitation was created, just email failed
      }
      
      return invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', profile?.company_id] });
    },
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', profile?.company_id] });
    },
  });
}

export function useResendInvitation() {
  const { data: profile } = useProfile();
  
  return useMutation({
    mutationFn: async (invitation: Invitation) => {
      if (!profile?.company_id) throw new Error('No company ID');
      
      // Get company name
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', profile.company_id)
        .single();
      
      const invitedByName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Un administrator';
      
      const { error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: invitation.email,
          role: invitation.role,
          invitedByName,
          companyName: company?.name || 'Compania',
          invitationToken: invitation.token,
          appUrl: window.location.origin,
        },
      });
      
      if (emailError) throw emailError;
    },
  });
}

export function useInvitationByToken(token: string | null) {
  return useQuery({
    queryKey: ['invitation-token', token],
    queryFn: async () => {
      if (!token) return null;
      
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          id,
          email,
          role,
          status,
          expires_at,
          company_id,
          companies:company_id (name)
        `)
        .eq('token', token)
        .eq('status', 'pending')
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!token,
  });
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: async ({ token, userId }: { token: string; userId: string }) => {
      // Get invitation details
      const { data: invitation, error: invError } = await supabase
        .from('invitations')
        .select('id, company_id, role, status, expires_at')
        .eq('token', token)
        .single();
      
      if (invError || !invitation) throw new Error('Invitație invalidă');
      if (invitation.status !== 'pending') throw new Error('Invitația nu mai este validă');
      if (new Date(invitation.expires_at) < new Date()) throw new Error('Invitația a expirat');
      
      // Update user's profile with company_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ company_id: invitation.company_id })
        .eq('id', userId);
      
      if (profileError) throw profileError;
      
      // Update user's role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: invitation.role });
      
      if (roleError) throw roleError;
      
      // Create engineer record
      const { error: engError } = await supabase
        .from('engineers')
        .upsert({
          profile_id: userId,
          company_id: invitation.company_id,
          is_active: true,
        }, { onConflict: 'profile_id' });
      
      // Mark invitation as accepted
      const { error: acceptError } = await supabase
        .from('invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);
      
      if (acceptError) throw acceptError;
      
      return invitation;
    },
  });
}
