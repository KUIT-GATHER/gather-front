import { useMutation } from "@tanstack/react-query";

import {
  confirmEmailVerification,
  sendEmailVerification,
} from "@/features/auth/api/auth.api";

export function useSendEmailVerificationMutation() {
  return useMutation({
    mutationFn: sendEmailVerification,
  });
}

export function useConfirmEmailVerificationMutation() {
  return useMutation({
    mutationFn: confirmEmailVerification,
  });
}
