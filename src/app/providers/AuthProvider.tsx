import { useEffect, type ReactNode } from "react";

import { refreshSessionOnce } from "@/features/auth/lib/refreshSession";
import { useAuthStore } from "@/features/auth/store/auth.store";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const getRefreshToken = useAuthStore((state) => state.getRefreshToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setAuthReady = useAuthStore((state) => state.setAuthReady);

  useEffect(() => {
    let ignore = false;

    async function restoreAuth() {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        setAuthReady(true);
        return;
      }

      try {
        await refreshSessionOnce();
      } catch {
        if (!ignore) {
          clearAuth();
        }
      } finally {
        if (!ignore) {
          setAuthReady(true);
        }
      }
    }

    restoreAuth();

    return () => {
      ignore = true;
    };
  }, [clearAuth, getRefreshToken, setAuthReady]);

  if (!isAuthReady) {
    return null;
  }

  return children;
}
