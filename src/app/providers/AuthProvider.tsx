import { useEffect, type ReactNode } from "react";

import { reissue } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/store/auth.store";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const getRefreshToken = useAuthStore((state) => state.getRefreshToken);
  const setTokens = useAuthStore((state) => state.setTokens);
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
        const tokens = await reissue({ refreshToken });

        if (!ignore) {
          setTokens(tokens);
        }
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
  }, [clearAuth, getRefreshToken, setAuthReady, setTokens]);

  if (!isAuthReady) {
    return null;
  }

  return children;
}
