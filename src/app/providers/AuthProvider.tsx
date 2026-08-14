import { useEffect, type ReactNode } from "react";

import { KAKAO_CALLBACK_PATH } from "@/features/auth/lib/kakaoOAuth";
import { refreshSessionOnce } from "@/features/auth/lib/refreshSession";
import { useAuthStore } from "@/features/auth/store/auth.store";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setAuthInitialized = useAuthStore((state) => state.setAuthInitialized);

  useEffect(() => {
    if (window.location.pathname === KAKAO_CALLBACK_PATH) {
      setAuthInitialized(true);
      return;
    }

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

    void restoreAuth();

    return () => {
      ignore = true;
    };
  }, [clearAuth, setAuthInitialized]);

  return children;
}
