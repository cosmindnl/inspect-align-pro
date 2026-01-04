import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

export function useOnboardingCheck() {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoading = authLoading || profileLoading;
  const needsOnboarding = user && profile && !profile.company_id;

  useEffect(() => {
    if (isLoading) return;
    
    // Skip if on auth or onboarding page
    if (location.pathname === "/auth" || location.pathname === "/onboarding") {
      return;
    }

    // Redirect to onboarding if user doesn't have a company
    if (needsOnboarding) {
      navigate("/onboarding", { replace: true });
    }
  }, [isLoading, needsOnboarding, location.pathname, navigate]);

  return { isLoading, needsOnboarding };
}
