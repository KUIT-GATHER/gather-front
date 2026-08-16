import { restoreSession } from "@/features/auth/api/auth.api";
import type { SessionRestoreResponse } from "@/features/auth/types/auth.types";

let restorePromise: Promise<SessionRestoreResponse> | null = null;

export function restoreSessionOnce() {
  if (!restorePromise) {
    restorePromise = restoreSession().finally(() => {
      restorePromise = null;
    });
  }

  return restorePromise;
}
