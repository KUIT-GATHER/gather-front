import { create } from "zustand";

type AuthState = {
  accessToken: string | null;
  isAuthenticated: boolean;
  authInitialized: boolean;

  setAccessToken: (accessToken: string | null) => void;
  clearAuth: () => void;
  setAuthInitialized: (initialized: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  authInitialized: false,

  setAccessToken: (accessToken) => {
    set({
      accessToken,
      isAuthenticated: Boolean(accessToken),
    });
  },

  clearAuth: () => {
    set({
      accessToken: null,
      isAuthenticated: false,
    });
  },

  setAuthInitialized: (initialized) => {
    set({ authInitialized: initialized });
  },
}));
