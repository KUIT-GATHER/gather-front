import { useMutation } from "@tanstack/react-query";

import {
  confirmPhoneVerification,
  createPhoneVerificationQrCode,
  startPhoneVerification,
} from "@/features/auth/api/auth.api";

export function useStartPhoneVerificationMutation() {
  return useMutation({
    mutationFn: startPhoneVerification,
  });
}

export function useCreatePhoneVerificationQrCodeMutation() {
  return useMutation({
    mutationFn: createPhoneVerificationQrCode,
  });
}

export function useConfirmPhoneVerificationMutation() {
  return useMutation({
    mutationFn: confirmPhoneVerification,
  });
}
