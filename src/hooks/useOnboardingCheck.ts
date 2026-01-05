import { useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

export function useOnboardingCheck() {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isLoading = authLoading || profileLoading;
  const hasInvitationToken = !!searchParams.get('invitation');
  const needsOnboarding = user && profile && !profile.company_id && !hasInvitationToken;

  useEffect(() => {
    if (isLoading) return;
    
    // Skip if on auth or onboarding page
    if (location.pathname === "/auth" || location.pathname === "/onboarding") {
      return;
    }

    // Don't redirect if user has invitation token - they're in the process of joining
    if (hasInvitationToken) {
      return;
    }

    // Redirect to onboarding if user doesn't have a company
    if (needsOnboarding) {
      navigate("/onboarding", { replace: true });
    }
  }, [isLoading, needsOnboarding, hasInvitationToken, location.pathname, navigate]);

  return { isLoading, needsOnboarding };
}
