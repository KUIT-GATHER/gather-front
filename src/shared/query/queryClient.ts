import {
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";

import { ApiError } from "@/shared/api/apiError";

const ONE_MINUTE = 60 * 1000;
const TEN_MINUTES = 10 * ONE_MINUTE;

type ErrorContext = {
  source: "query" | "mutation";
  queryKey?: readonly unknown[];
  mutationKey?: readonly unknown[];
};

function shouldLogError(error: unknown) {
  if (error instanceof ApiError) {
    return error.status >= 500;
  }

  return true;
}

function logError(error: unknown, context: ErrorContext) {
  if (!import.meta.env.DEV || !shouldLogError(error)) {
    return;
  }

  console.error("[TanStack Query Error]", {
    error,
    ...context,
  });
}

function shouldRetryQuery(failureCount: number, error: unknown) {
  if (failureCount >= 1) {
    return false;
  }

  if (error instanceof ApiError) {
    return error.status === 408 || error.status >= 500;
  }

  // fetch 네트워크 오류로 추정되는 경우만 한 번 재시도
  return error instanceof TypeError;
}

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        const errorMode = query.meta?.errorMode ?? "log";

        if (errorMode === "silent") {
          return;
        }

        logError(error, {
          source: "query",
          queryKey: query.queryKey,
        });
      },
    }),

    mutationCache: new MutationCache({
      onError: (
        error,
        _variables,
        _onMutateResult,
        mutation,
      ) => {
        const errorMode = mutation.options.meta?.errorMode ?? "log";

        if (errorMode === "silent") {
          return;
        }

        logError(error, {
          source: "mutation",
          mutationKey: mutation.options.mutationKey,
        });
      },
    }),

    defaultOptions: {
      queries: {
        staleTime: ONE_MINUTE,
        gcTime: TEN_MINUTES,
        retry: shouldRetryQuery,
      },

      mutations: {
        retry: false,
      },
    },
  });
}

export const queryClient = createQueryClient();