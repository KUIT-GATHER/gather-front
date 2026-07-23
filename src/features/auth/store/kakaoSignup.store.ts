import { create } from "zustand";

type KakaoSignupSession = {
  signupToken: string;
  initialNickname: string | null;
};

export type KakaoSignupState = {
  signupToken: string | null;
  initialNickname: string | null;
  setKakaoSignupSession: (session: KakaoSignupSession) => void;
  clearKakaoSignupSession: () => void;
};

export const useKakaoSignupStore = create<KakaoSignupState>((set) => ({
  signupToken: null,
  initialNickname: null,

  setKakaoSignupSession: ({ signupToken, initialNickname }) => {
    set({ signupToken, initialNickname });
  },

  clearKakaoSignupSession: () => {
    set({ signupToken: null, initialNickname: null });
  },
}));
