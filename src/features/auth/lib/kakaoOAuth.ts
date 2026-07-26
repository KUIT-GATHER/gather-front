import { env } from "@/shared/config/env";

const OAUTH_STATE_STORAGE_KEY = "gather:kakao-oauth-state";
const OAUTH_RETURN_PATH_STORAGE_KEY = "gather:kakao-oauth-return-path";
const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";

export const KAKAO_CALLBACK_PATH = "/login/kakao/callback";

function isSafeInternalPath(value: string | null | undefined): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
  );
}

export function createKakaoOAuthState() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join(
    "",
  );
}

export function saveKakaoOAuthState(state: string) {
  sessionStorage.setItem(OAUTH_STATE_STORAGE_KEY, state);
}

export function consumeKakaoOAuthState(callbackState: string | null) {
  const savedState = sessionStorage.getItem(OAUTH_STATE_STORAGE_KEY);
  sessionStorage.removeItem(OAUTH_STATE_STORAGE_KEY);

  return (
    savedState !== null &&
    callbackState !== null &&
    savedState === callbackState
  );
}

export function getKakaoRedirectUri() {
  return new URL(KAKAO_CALLBACK_PATH, window.location.origin).toString();
}

export function consumeKakaoLoginReturnPath() {
  const returnPath = sessionStorage.getItem(OAUTH_RETURN_PATH_STORAGE_KEY);
  sessionStorage.removeItem(OAUTH_RETURN_PATH_STORAGE_KEY);

  return isSafeInternalPath(returnPath) ? returnPath : null;
}

export function startKakaoLogin(returnPath?: string) {
  const state = createKakaoOAuthState();
  const redirectUri = getKakaoRedirectUri();

  saveKakaoOAuthState(state);

  if (isSafeInternalPath(returnPath)) {
    sessionStorage.setItem(OAUTH_RETURN_PATH_STORAGE_KEY, returnPath);
  } else {
    sessionStorage.removeItem(OAUTH_RETURN_PATH_STORAGE_KEY);
  }

  const authorizeUrl = new URL(KAKAO_AUTHORIZE_URL);
  authorizeUrl.search = new URLSearchParams({
    client_id: env.KAKAO_REST_API_KEY,
    redirect_uri: redirectUri,
    response_type: "code",
    state,
  }).toString();

  window.location.assign(authorizeUrl.toString());
}
