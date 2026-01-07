import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useUserRole } from '@/hooks/useUserRole';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresOnboarding?: boolean;
}

export function ProtectedRoute({ children, requiresOnboarding = true }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  const location = useLocation();

  const isLoading = authLoading || (user && (profileLoading || roleLoading));
  const searchParams = new URLSearchParams(location.search);
  const hasInvitationToken = !!searchParams.get('invitation');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    // Preserve invitation token (if any) so invited users land on the correct flow.
    return <Navigate to={`/auth${location.search || ''}`} state={{ from: location }} replace />;
  }

  // User has a company - allow access
  if (profile?.company_id) {
    return <>{children}</>;
  }

  // User doesn't have company - handle based on context
  if (requiresOnboarding && profile && !profile.company_id) {
    // If there's an invitation token in the URL, route to the invitation flow
    if (hasInvitationToken) {
      return <Navigate to={`/auth${location.search}`} replace />;
    }

    // Allow access to settings and waiting pages without company
    if (location.pathname === "/settings" || location.pathname === "/waiting") {
      return <>{children}</>;
    }

    // Redirect based on role
    if (userRole?.isAdmin) {
      // Admins go to settings to create company
      return <Navigate to="/settings" replace />;
    } else {
      // Non-admins go to waiting page
      return <Navigate to="/waiting" replace />;
    }
  }

  return <>{children}</>;
}
