import { useAuthStore } from "@/features/auth/store/auth.store";
import { queryClient } from "@/shared/query/queryClient";

export function clearAuthSession() {
  useAuthStore.getState().clearAuth();
  queryClient.clear();
}
