import { useAuthStore } from "@/features/auth/store/auth.store";
import { queryClient } from "@/shared/api/queryClient";

export function clearAuthSession() {
  useAuthStore.getState().clearAuth();
  queryClient.clear();
}
