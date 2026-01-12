import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Create clients
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });

    // Verify the requesting user is authenticated
    const { data: { user: requestingUser }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !requestingUser) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Nu sunteți autentificat' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Requesting user:', requestingUser.id);

    // Verify the requesting user is an admin
    const { data: requestingUserRoles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id);

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      return new Response(
        JSON.stringify({ error: 'Eroare la verificarea rolului' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isAdmin = requestingUserRoles?.some(r => r.role === 'admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Nu aveți permisiuni de administrator' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get requesting user's company
    const { data: requestingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('company_id')
      .eq('id', requestingUser.id)
      .single();

    if (profileError || !requestingProfile?.company_id) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Nu s-a putut determina compania' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, targetUserId } = await req.json();
    console.log('Action:', action, 'Target user:', targetUserId);

    if (!action || !targetUserId) {
      return new Response(
        JSON.stringify({ error: 'Parametri lipsă: action și targetUserId sunt necesari' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify target user is in the same company
    const { data: targetProfile, error: targetProfileError } = await supabaseAdmin
      .from('profiles')
      .select('company_id, first_name, last_name')
      .eq('id', targetUserId)
      .single();

    if (targetProfileError || !targetProfile) {
      console.error('Error fetching target profile:', targetProfileError);
      return new Response(
        JSON.stringify({ error: 'Utilizatorul țintă nu a fost găsit' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (targetProfile.company_id !== requestingProfile.company_id) {
      return new Response(
        JSON.stringify({ error: 'Utilizatorul nu face parte din compania dvs.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle actions
    if (action === 'reset-password') {
      // Get target user's email
      const { data: targetAuthUser, error: targetAuthError } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
      
      if (targetAuthError || !targetAuthUser?.user?.email) {
        console.error('Error fetching target auth user:', targetAuthError);
        return new Response(
          JSON.stringify({ error: 'Nu s-a putut găsi adresa de email a utilizatorului' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Send password reset email
      const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: targetAuthUser.user.email,
      });

      if (resetError) {
        console.error('Error generating reset link:', resetError);
        return new Response(
          JSON.stringify({ error: 'Eroare la trimiterea emailului de resetare: ' + resetError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log the action
      await supabaseAdmin.from('audit_logs').insert({
        user_id: requestingUser.id,
        action: 'password_reset_requested',
        table_name: 'auth.users',
        record_id: targetUserId,
        new_values: { target_email: targetAuthUser.user.email },
      });

      console.log('Password reset email sent to:', targetAuthUser.user.email);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Email de resetare parolă trimis către ${targetAuthUser.user.email}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'delete-user') {
      // Prevent self-deletion
      if (targetUserId === requestingUser.id) {
        return new Response(
          JSON.stringify({ error: 'Nu vă puteți șterge propriul cont' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if target is the last admin
      const { data: targetRoles } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', targetUserId);

      const isTargetAdmin = targetRoles?.some(r => r.role === 'admin');

      if (isTargetAdmin) {
        // Count admins in the company
        const { data: companyProfiles } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('company_id', requestingProfile.company_id);

        const companyUserIds = companyProfiles?.map(p => p.id) || [];

        const { data: adminRoles } = await supabaseAdmin
          .from('user_roles')
          .select('user_id')
          .in('user_id', companyUserIds)
          .eq('role', 'admin');

        if ((adminRoles?.length || 0) <= 1) {
          return new Response(
            JSON.stringify({ error: 'Nu puteți șterge ultimul administrator din companie' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Mark engineer as inactive instead of deleting
      const { error: engineerError } = await supabaseAdmin
        .from('engineers')
        .update({ is_active: false })
        .eq('profile_id', targetUserId);

      if (engineerError) {
        console.error('Error deactivating engineer:', engineerError);
      }

      // Log the action before deletion
      await supabaseAdmin.from('audit_logs').insert({
        user_id: requestingUser.id,
        action: 'user_deleted',
        table_name: 'auth.users',
        record_id: targetUserId,
        old_values: { 
          first_name: targetProfile.first_name, 
          last_name: targetProfile.last_name 
        },
      });

      // Delete the user from auth.users (cascades to profiles)
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

      if (deleteError) {
        console.error('Error deleting user:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Eroare la ștergerea utilizatorului: ' + deleteError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('User deleted successfully:', targetUserId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Utilizatorul a fost șters cu succes' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({ error: 'Acțiune necunoscută: ' + action }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: unknown) {
    console.error('Error in admin-users function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Eroare internă';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
