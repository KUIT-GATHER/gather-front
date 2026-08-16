import { useEffect, type ReactNode } from "react";

import { KAKAO_CALLBACK_PATH } from "@/features/auth/lib/kakaoOAuth";
import { restoreSessionOnce } from "@/features/auth/lib/restoreSession";
import { useAuthStore } from "@/features/auth/store/auth.store";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setAuthInitialized = useAuthStore((state) => state.setAuthInitialized);

  useEffect(() => {
    if (window.location.pathname === KAKAO_CALLBACK_PATH) {
      setAuthInitialized(true);
      return;
    }

    let ignore = false;

    async function restoreAuth() {
      try {
        const session = await restoreSessionOnce();

        if (!ignore) {
          if (session.authenticated) {
            setAccessToken(session.accessToken);
          } else {
            clearAuth();
          }
        }
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
  }, [clearAuth, setAccessToken, setAuthInitialized]);

  return children;
}
