import { useEffect, type ReactNode } from "react";

import { refreshSessionOnce } from "@/features/auth/lib/refreshSession";
import { useAuthStore } from "@/features/auth/store/auth.store";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const authInitialized = useAuthStore((state) => state.authInitialized);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setAuthInitialized = useAuthStore((state) => state.setAuthInitialized);

  useEffect(() => {
    let ignore = false;

    async function restoreAuth() {
      try {
        await refreshSessionOnce();
      } catch {
        if (!ignore) {
          clearAuth();
        }
      } finally {
        if (!ignore) {
          setAuthInitialized(true);
        }
      }
    }

    restoreAuth();

    return () => {
      ignore = true;
    };
  }, [clearAuth, setAuthInitialized]);

  if (!authInitialized) {
    return null;
  }

  return children;
}
