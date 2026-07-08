import { useAuthStore } from "@/features/auth/store/auth.store";
import type { TokenResponse } from "@/features/auth/types/auth.types";
import { ApiError } from "@/shared/api/apiError";
import type { ApiResponse } from "@/shared/api/apiResponse";
import { env } from "@/shared/config/env";

let refreshPromise: Promise<boolean> | null = null;

function buildUrl(endpoint: string) {
  return new URL(endpoint, env.API_BASE_URL).toString();
}

async function parseApiResponse<T>(response: Response) {
  const apiResponse = (await response.json()) as ApiResponse<T>;

  if (!apiResponse.success) {
    throw new ApiError(
      response.status,
      apiResponse.error.code,
      apiResponse.error.message,
    );
  }

  return apiResponse.data;
}

async function refreshSession() {
  const { setAccessToken } = useAuthStore.getState();

  const response = await fetch(buildUrl("/api/v1/auth/reissue"), {
    method: "POST",
    credentials: "include",
  });

  const tokens = await parseApiResponse<TokenResponse>(response);

  setAccessToken(tokens.accessToken);

  return true;
}

export function refreshSessionOnce() {
  if (!refreshPromise) {
    refreshPromise = refreshSession().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}
