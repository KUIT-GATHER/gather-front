import { useMutation } from "@tanstack/react-query";

import {
  confirmPhoneVerification,
  createPhoneVerificationQrCode,
  findAccountByPhoneVerification,
  issuePasswordResetToken,
  resetPassword,
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

export function useFindAccountMutation() {
  return useMutation({
    mutationFn: findAccountByPhoneVerification,
  });
}

export function useIssuePasswordResetTokenMutation() {
  return useMutation({
    mutationFn: issuePasswordResetToken,
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: resetPassword,
  });
}
