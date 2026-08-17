import { useCallback, useEffect, useRef, useState } from "react";

import {
  useConfirmPhoneVerificationMutation,
  useCreatePhoneVerificationQrCodeMutation,
  useStartPhoneVerificationMutation,
} from "@/features/auth/hooks/usePhoneVerificationMutation";
import { shouldLaunchSmsVerificationApp } from "@/features/auth/lib/phoneVerification";
import { normalizePhoneNumber } from "@/features/auth/lib/signupFormatters";
import { signupPhoneNumberSchema } from "@/features/auth/schemas/signupCommon.schema";
import type {
  PhoneVerificationPurpose,
  PhoneVerificationStartResponse,
} from "@/features/auth/types/auth.types";
import { ApiError } from "@/shared/api/apiError";
import { env } from "@/shared/config/env";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";

const SMS_DEVICE_USER_AGENT_PATTERN =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
const IOS_USER_AGENT_PATTERN = /iPhone|iPad|iPod/i;
const PHONE_NUMBER_ERROR_MESSAGE =
  "전화번호는 010으로 시작하는 11자리 숫자로 입력해 주세요.";
const CONFIRM_POLL_INITIAL_DELAY_MS = 3_000;
const CONFIRM_POLL_INTERVAL_MS = 10_000;
const CONFIRM_POLL_FALLBACK_EXPIRES_MS = 5 * 60 * 1000;

export type PhoneVerificationSession = {
  verificationId: string;
  phoneNumber: string;
};

type PhoneVerificationFlowOptions = {
  phoneNumber: string;
  purpose: PhoneVerificationPurpose;
  onError?: (message: string) => void;
  onClearError?: () => void;
  onDuplicatePhoneNumber?: () => void;
};

function isIpadOsDesktopMode() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

function shouldUseSmsVerification() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return (
    SMS_DEVICE_USER_AGENT_PATTERN.test(navigator.userAgent) ||
    isIpadOsDesktopMode()
  );
}

function createSmsHref(receiverNumber: string, messageText: string) {
  const bodySeparator =
    typeof navigator !== "undefined" &&
    (IOS_USER_AGENT_PATTERN.test(navigator.userAgent) || isIpadOsDesktopMode())
      ? "&"
      : "?";

  return `sms:${receiverNumber}${bodySeparator}body=${encodeURIComponent(messageText)}`;
}

function getPhoneVerificationErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof ApiError)) {
    return fallback;
  }

  switch (error.code) {
    case API_ERROR_CODE.VALIDATION_ERROR:
      return PHONE_NUMBER_ERROR_MESSAGE;
    case API_ERROR_CODE.PHONE_VERIFICATION_RATE_LIMITED:
      return "잠시 후 다시 시도해 주세요.";
    case API_ERROR_CODE.PHONE_VERIFICATION_PROVIDER_UNAVAILABLE:
      return "휴대폰 인증 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.";
    case API_ERROR_CODE.PHONE_VERIFICATION_EXPIRED:
      return "휴대폰 인증 시간이 만료되었습니다. 다시 인증해 주세요.";
    case API_ERROR_CODE.PHONE_VERIFICATION_NOT_FOUND:
      return "휴대폰 인증 요청을 찾을 수 없습니다. 다시 인증해 주세요.";
    case API_ERROR_CODE.PHONE_VERIFICATION_PURPOSE_MISMATCH:
      return "현재 화면에서 시작한 휴대폰 인증만 사용할 수 있습니다. 다시 인증해 주세요.";
    case API_ERROR_CODE.DUPLICATE_PHONE_NUMBER:
      return "이미 가입된 전화번호입니다.";
    case API_ERROR_CODE.ACCOUNT_REJOIN_BLOCKED:
    case API_ERROR_CODE.WITHDRAWN_ACCOUNT_COOLDOWN:
      return "탈퇴 후 7일간 재가입할 수 없습니다.";
    default:
      return error.message || fallback;
  }
}

function shouldResetVerificationSession(error: unknown) {
  return (
    error instanceof ApiError &&
    (error.code === API_ERROR_CODE.PHONE_VERIFICATION_EXPIRED ||
      error.code === API_ERROR_CODE.PHONE_VERIFICATION_NOT_FOUND ||
      error.code === API_ERROR_CODE.PHONE_VERIFICATION_PURPOSE_MISMATCH ||
      error.code === API_ERROR_CODE.DUPLICATE_PHONE_NUMBER ||
      error.code === API_ERROR_CODE.ACCOUNT_REJOIN_BLOCKED ||
      error.code === API_ERROR_CODE.WITHDRAWN_ACCOUNT_COOLDOWN)
  );
}

function isDuplicatePhoneNumberError(error: unknown) {
  return (
    error instanceof ApiError &&
    error.code === API_ERROR_CODE.DUPLICATE_PHONE_NUMBER
  );
}

export function usePhoneVerificationFlow({
  phoneNumber,
  purpose,
  onError,
  onClearError,
  onDuplicatePhoneNumber,
}: PhoneVerificationFlowOptions) {
  const startMutation = useStartPhoneVerificationMutation();
  const qrMutation = useCreatePhoneVerificationQrCodeMutation();
  const confirmMutation = useConfirmPhoneVerificationMutation();
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState<string | null>(
    null,
  );
  const [phoneVerificationId, setPhoneVerificationId] = useState<string | null>(
    null,
  );
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [isVerificationActive, setIsVerificationActive] = useState(false);
  const activeVerificationIdRef = useRef<string | null>(null);
  const activePhoneNumberRef = useRef(phoneNumber);
  const activePurposeRef = useRef(purpose);
  const confirmPollingDelayRef = useRef<number | null>(null);
  const confirmPollingIntervalRef = useRef<number | null>(null);
  const confirmPollingExpiresRef = useRef<number | null>(null);
  const isConfirmPollingRequestPendingRef = useRef(false);
  const isMountedRef = useRef(true);
  const onErrorRef = useRef(onError);
  const onClearErrorRef = useRef(onClearError);
  const onDuplicatePhoneNumberRef = useRef(onDuplicatePhoneNumber);
  const resetRef = useRef<() => void>(() => undefined);

  const usesSmsVerification = shouldUseSmsVerification();
  const shouldLaunchSmsApp = shouldLaunchSmsVerificationApp(
    usesSmsVerification,
    env.IS_DEV && env.ENABLE_MSW,
  );
  const isPhoneNumberValid =
    signupPhoneNumberSchema.safeParse(phoneNumber).success;
  const isPhoneVerified =
    phoneNumber.length > 0 &&
    phoneNumber === verifiedPhoneNumber &&
    Boolean(phoneVerificationId);
  const canReopenQr =
    !usesSmsVerification &&
    isVerificationActive &&
    !isPhoneVerified &&
    Boolean(qrMutation.data?.qrCode);
  const isVerificationActionPending =
    startMutation.isPending || qrMutation.isPending;
  const isPending = isVerificationActionPending || confirmMutation.isPending;
  const isVerificationInProgress =
    startMutation.isPending || isVerificationActive;

  const clearTimers = useCallback(() => {
    if (confirmPollingDelayRef.current !== null) {
      window.clearTimeout(confirmPollingDelayRef.current);
      confirmPollingDelayRef.current = null;
    }

    if (confirmPollingIntervalRef.current !== null) {
      window.clearInterval(confirmPollingIntervalRef.current);
      confirmPollingIntervalRef.current = null;
    }

    if (confirmPollingExpiresRef.current !== null) {
      window.clearTimeout(confirmPollingExpiresRef.current);
      confirmPollingExpiresRef.current = null;
    }
  }, []);

  const stopConfirmPolling = useCallback(() => {
    activeVerificationIdRef.current = null;
    isConfirmPollingRequestPendingRef.current = false;
    setIsVerificationActive(false);
    clearTimers();
  }, [clearTimers]);

  const reset = useCallback(() => {
    stopConfirmPolling();
    setVerifiedPhoneNumber(null);
    setPhoneVerificationId(null);
    setIsQrDialogOpen(false);
    qrMutation.reset();
    startMutation.reset();
    confirmMutation.reset();
    onClearErrorRef.current?.();
  }, [confirmMutation, qrMutation, startMutation, stopConfirmPolling]);

  useEffect(() => {
    onErrorRef.current = onError;
    onClearErrorRef.current = onClearError;
    onDuplicatePhoneNumberRef.current = onDuplicatePhoneNumber;
    resetRef.current = reset;
  }, [onClearError, onDuplicatePhoneNumber, onError, reset]);

  useEffect(() => {
    const phoneChanged = activePhoneNumberRef.current !== phoneNumber;
    const purposeChanged = activePurposeRef.current !== purpose;

    activePhoneNumberRef.current = phoneNumber;
    activePurposeRef.current = purpose;

    if (phoneChanged || purposeChanged) {
      resetRef.current();
    }
  }, [phoneNumber, purpose]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      activeVerificationIdRef.current = null;
      isConfirmPollingRequestPendingRef.current = false;
      clearTimers();
    };
  }, [clearTimers]);

  const handleConfirmError = (
    session: PhoneVerificationSession,
    error: unknown,
  ) => {
    if (activeVerificationIdRef.current !== session.verificationId) {
      return;
    }

    if (shouldResetVerificationSession(error)) {
      reset();

      if (isDuplicatePhoneNumberError(error)) {
        onDuplicatePhoneNumberRef.current?.();
      }
    }

    onErrorRef.current?.(
      getPhoneVerificationErrorMessage(
        error,
        "휴대폰 인증을 확인하지 못했습니다. 다시 시도해 주세요.",
      ),
    );
  };

  const handleConfirmVerified = (session: PhoneVerificationSession) => {
    setVerifiedPhoneNumber(session.phoneNumber);
    setPhoneVerificationId(session.verificationId);
    setIsQrDialogOpen(false);
    onClearErrorRef.current?.();
    stopConfirmPolling();
  };

  const pollConfirmVerification = (session: PhoneVerificationSession) => {
    if (
      activeVerificationIdRef.current !== session.verificationId ||
      isConfirmPollingRequestPendingRef.current
    ) {
      return;
    }

    isConfirmPollingRequestPendingRef.current = true;

    confirmMutation.mutate(session.verificationId, {
      onSuccess: (data) => {
        if (activeVerificationIdRef.current !== session.verificationId) {
          return;
        }

        if (data.status === "VERIFIED") {
          handleConfirmVerified(session);
        }
      },
      onError: (error) => handleConfirmError(session, error),
      onSettled: () => {
        if (activeVerificationIdRef.current === session.verificationId) {
          isConfirmPollingRequestPendingRef.current = false;
        }
      },
    });
  };

  const startConfirmPolling = (
    session: PhoneVerificationSession,
    expiresAt: string,
  ) => {
    stopConfirmPolling();
    activeVerificationIdRef.current = session.verificationId;
    setIsVerificationActive(true);

    const expiresAtTime = Date.parse(expiresAt);
    const timeoutDelay = Number.isNaN(expiresAtTime)
      ? CONFIRM_POLL_FALLBACK_EXPIRES_MS
      : Math.max(expiresAtTime - Date.now(), 0);

    confirmPollingDelayRef.current = window.setTimeout(() => {
      pollConfirmVerification(session);
      confirmPollingIntervalRef.current = window.setInterval(() => {
        pollConfirmVerification(session);
      }, CONFIRM_POLL_INTERVAL_MS);
    }, CONFIRM_POLL_INITIAL_DELAY_MS);

    confirmPollingExpiresRef.current = window.setTimeout(() => {
      if (activeVerificationIdRef.current !== session.verificationId) {
        return;
      }

      reset();
      onErrorRef.current?.(
        "휴대폰 인증 시간이 만료되었습니다. 다시 인증해 주세요.",
      );
    }, timeoutDelay);
  };

  const handleStartSuccess = (
    requestedPhoneNumber: string,
    data: PhoneVerificationStartResponse,
  ) => {
    if (
      !isMountedRef.current ||
      activePhoneNumberRef.current !== requestedPhoneNumber ||
      activePurposeRef.current !== purpose
    ) {
      return;
    }

    const session = {
      verificationId: data.verificationId,
      phoneNumber: requestedPhoneNumber,
    };

    stopConfirmPolling();
    setVerifiedPhoneNumber(null);
    setPhoneVerificationId(null);
    qrMutation.reset();
    onClearErrorRef.current?.();
    startConfirmPolling(session, data.expiresAt);

    if (usesSmsVerification) {
      if (shouldLaunchSmsApp) {
        window.location.href = createSmsHref(
          data.receiverNumber,
          data.messageText,
        );
      }

      return;
    }

    setIsQrDialogOpen(true);
    qrMutation.mutate(data.verificationId, {
      onSuccess: () => onClearErrorRef.current?.(),
      onError: (error) => {
        if (activeVerificationIdRef.current !== data.verificationId) {
          return;
        }

        if (shouldResetVerificationSession(error)) {
          reset();

          if (isDuplicatePhoneNumberError(error)) {
            onDuplicatePhoneNumberRef.current?.();
          }
        }

        onErrorRef.current?.(
          getPhoneVerificationErrorMessage(
            error,
            "QR 코드를 불러오지 못했습니다. 다시 인증해 주세요.",
          ),
        );
      },
    });
  };

  const handleVerifyPhone = () => {
    const requestedPhoneNumber = normalizePhoneNumber(phoneNumber);

    onClearErrorRef.current?.();

    if (!isPhoneNumberValid || requestedPhoneNumber !== phoneNumber) {
      onErrorRef.current?.(PHONE_NUMBER_ERROR_MESSAGE);
      return;
    }

    if (canReopenQr) {
      setIsQrDialogOpen(true);
      return;
    }

    startMutation.mutate(
      { phoneNumber: requestedPhoneNumber, purpose },
      {
        onSuccess: (data) => handleStartSuccess(requestedPhoneNumber, data),
        onError: (error) => {
          if (activePhoneNumberRef.current !== requestedPhoneNumber) {
            return;
          }

          onErrorRef.current?.(
            getPhoneVerificationErrorMessage(
              error,
              "휴대폰 인증을 시작하지 못했습니다. 다시 시도해 주세요.",
            ),
          );
        },
      },
    );
  };

  const retryQr = () => {
    const verificationId = activeVerificationIdRef.current;

    if (!verificationId) {
      return;
    }

    qrMutation.mutate(verificationId, {
      onSuccess: () => onClearErrorRef.current?.(),
      onError: (error) =>
        onErrorRef.current?.(
          getPhoneVerificationErrorMessage(
            error,
            "QR 코드를 불러오지 못했습니다. 다시 인증해 주세요.",
          ),
        ),
    });
  };

  return {
    verifiedPhoneNumber,
    phoneVerificationId,
    setVerifiedPhoneNumber,
    setPhoneVerificationId,
    isPhoneVerified,
    isPhoneNumberValid,
    isVerificationActive,
    isVerificationActionPending,
    isPending,
    isVerificationInProgress,
    canReopenQr,
    handleVerifyPhone,
    reset,
    isQrDialogOpen,
    setIsQrDialogOpen,
    qrCode: qrMutation.data?.qrCode ?? null,
    isQrPending: qrMutation.isPending,
    qrError: qrMutation.error,
    retryQr,
  };
}

export type PhoneVerificationFlow = ReturnType<typeof usePhoneVerificationFlow>;
