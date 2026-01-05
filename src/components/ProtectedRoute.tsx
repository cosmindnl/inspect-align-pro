import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresOnboarding?: boolean;
}

export function ProtectedRoute({ children, requiresOnboarding = true }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const location = useLocation();

  const isLoading = authLoading || (user && profileLoading);
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

  // Redirect to onboarding if user doesn't have a company (except on onboarding page)
  if (requiresOnboarding && profile && !profile.company_id && location.pathname !== "/onboarding") {
    // If there's an invitation token in the URL, route to the invitation flow instead of company onboarding.
    if (hasInvitationToken) {
      return <Navigate to={`/auth${location.search}`} replace />;
    }

    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
