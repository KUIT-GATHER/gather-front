import { useEffect } from "react";
import { useNavigate } from "react-router";

import { Splash } from "@/features/onboarding/components/Splash";
import { useAuthStore } from "@/features/auth/store/auth.store";

const SPLASH_DURATION_MS = 2000;

export function EntryPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authInitialized = useAuthStore((state) => state.authInitialized);

  useEffect(() => {
    if (!authInitialized) {
      return;
    }

    const timer = window.setTimeout(() => {
      navigate(isAuthenticated ? "/home" : "/onboarding", {
        replace: true,
      });
    }, SPLASH_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [authInitialized, isAuthenticated, navigate]);

  return <Splash />;
}
