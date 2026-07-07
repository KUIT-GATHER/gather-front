import { useAuthStore } from "@/features/auth/store/auth.store";
import { refreshSessionOnce } from "@/features/auth/lib/refreshSession";
import { ApiError } from "@/shared/api/apiError";
import type { ApiResponse } from "@/shared/api/apiResponse";
import { env } from "@/shared/config/env";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";

type FetchClientOptions = RequestInit & {
  skipAuth?: boolean; // authorization header를 생략할지 여부
  skipRefresh?: boolean; // access token 재발급을 시도하지 않을지 여부
};

function buildUrl(endpoint: string) {
  return new URL(endpoint, env.API_BASE_URL).toString();
}

function isFormData(body: BodyInit | null | undefined) {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

function createHeaders(options: FetchClientOptions) {
  const headers = new Headers(options.headers);

  if (
    options.body &&
    !isFormData(options.body) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (!options.skipAuth) {
    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  return headers;
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

async function request<T>(endpoint: string, options: FetchClientOptions) {
  const requestInit: RequestInit = { ...options };

  delete (requestInit as Partial<FetchClientOptions>).skipAuth;
  delete (requestInit as Partial<FetchClientOptions>).skipRefresh;

  const response = await fetch(buildUrl(endpoint), {
    ...requestInit,
    headers: createHeaders(options),
  });

  return parseApiResponse<T>(response);
}

export async function fetchClient<T>(
  endpoint: string,
  options: FetchClientOptions = {},
) {
  try {
    return await request<T>(endpoint, options);
  } catch (error) {
    const shouldTryRefresh =
      error instanceof ApiError &&
      error.status === 401 &&
      error.code === API_ERROR_CODE.EXPIRED_TOKEN &&
      !options.skipAuth &&
      !options.skipRefresh;

    if (shouldTryRefresh) {
      try {
        const refreshed = await refreshSessionOnce();

        if (refreshed) {
          return await request<T>(endpoint, options);
        }

        useAuthStore.getState().clearAuth();
        throw error;
      } catch {
        useAuthStore.getState().clearAuth();
        throw error;
      }
    }

    const shouldClearAuth =
      error instanceof ApiError &&
      error.status === 401 &&
      (error.code === API_ERROR_CODE.UNAUTHORIZED ||
        error.code === API_ERROR_CODE.INVALID_TOKEN ||
        error.code === API_ERROR_CODE.REVOKED_TOKEN);

    if (shouldClearAuth) {
      useAuthStore.getState().clearAuth();
    }

    throw error;
  }
}
