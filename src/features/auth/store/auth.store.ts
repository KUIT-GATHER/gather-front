import { create } from "zustand";

import type { TokenResponse } from "@/features/auth/types/auth.types";

export const REFRESH_TOKEN_STORAGE_KEY = "gather_refresh_token";

type AuthState = {
  accessToken: string | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;

  setAccessToken: (accessToken: string | null) => void;
  setTokens: (tokens: TokenResponse) => void;
  getRefreshToken: () => string | null;
  clearAuth: () => void;
  setAuthReady: (ready: boolean) => void;
};

function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

function setStoredRefreshToken(refreshToken: string) {
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
}

function removeStoredRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  isAuthReady: false,

  setAccessToken: (accessToken) => {
    set({
      accessToken,
      isAuthenticated: Boolean(accessToken),
    });
  },

  setTokens: (tokens) => {
    setStoredRefreshToken(tokens.refreshToken);
    set({
      accessToken: tokens.accessToken,
      isAuthenticated: true,
    });
  },

  getRefreshToken: getStoredRefreshToken,

  clearAuth: () => {
    removeStoredRefreshToken();
    set({
      accessToken: null,
      isAuthenticated: false,
    });
  },

  setAuthReady: (ready) => {
    set({ isAuthReady: ready });
  },
}));
