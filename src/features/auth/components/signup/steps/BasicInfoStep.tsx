import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import {
  useConfirmPhoneVerificationMutation,
  useCreatePhoneVerificationQrCodeMutation,
  useStartPhoneVerificationMutation,
} from "@/features/auth/hooks/usePhoneVerificationMutation";
import {
  getSignupFieldDescribedBy,
  getSignupFieldErrorId,
} from "@/features/auth/lib/signupFieldA11y";
import {
  formatBirthDateInput,
  formatPhoneNumber,
  isAllowedBirthDate,
  normalizeBirthDate,
  normalizePhoneNumber,
} from "@/features/auth/lib/signupFormatters";
import {
  signupCommonSchema,
  signupPhoneNumberSchema,
  type SignupCommonFormValues,
} from "@/features/auth/schemas/signupCommon.schema";
import { ApiError } from "@/shared/api/apiError";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";

import { SignupStepButton } from "../SignupFormParts";

type BasicInfoStepProps = {
  verifiedPhoneNumber: string | null;
  phoneVerificationId: string | null;
  onVerifiedPhoneNumberChange: (value: string | null) => void;
  onPhoneVerificationIdChange: (value: string | null) => void;
};

type PhoneVerificationSession = {
  verificationId: string;
  phoneNumber: string;
};

const SMS_DEVICE_USER_AGENT_PATTERN =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
const IOS_USER_AGENT_PATTERN = /iPhone|iPad|iPod/i;
const PHONE_NUMBER_ERROR_MESSAGE =
  "전화번호는 010으로 시작하는 11자리 숫자로 입력해 주세요.";
const CONFIRM_POLL_INITIAL_DELAY_MS = 3_000;
const CONFIRM_POLL_INTERVAL_MS = 10_000;
const CONFIRM_POLL_FALLBACK_EXPIRES_MS = 5 * 60 * 1000;
const basicInfoCompletionSchema = signupCommonSchema.pick({
  name: true,
  birthDate: true,
  gender: true,
  phoneNumber: true,
});

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
      error.code === API_ERROR_CODE.DUPLICATE_PHONE_NUMBER ||
      error.code === API_ERROR_CODE.ACCOUNT_REJOIN_BLOCKED ||
      error.code === API_ERROR_CODE.WITHDRAWN_ACCOUNT_COOLDOWN)
  );
}

export function BasicInfoStep({
  verifiedPhoneNumber,
  phoneVerificationId,
  onVerifiedPhoneNumberChange,
  onPhoneVerificationIdChange,
}: BasicInfoStepProps) {
  const {
    control,
    register,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<SignupCommonFormValues>();
  const startMutation = useStartPhoneVerificationMutation();
  const qrMutation = useCreatePhoneVerificationQrCodeMutation();
  const confirmMutation = useConfirmPhoneVerificationMutation();
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const activeVerificationIdRef = useRef<string | null>(null);
  const confirmPollingDelayRef = useRef<number | null>(null);
  const confirmPollingIntervalRef = useRef<number | null>(null);
  const confirmPollingExpiresRef = useRef<number | null>(null);
  const isConfirmPollingRequestPendingRef = useRef(false);
  const name = useWatch({ control, name: "name" });
  const birthDate = useWatch({ control, name: "birthDate" });
  const gender = useWatch({ control, name: "gender" });
  const phoneNumber = useWatch({ control, name: "phoneNumber" });
  const isPhoneNumberValid =
    signupPhoneNumberSchema.safeParse(phoneNumber).success;
  const isBasicInfoComplete = basicInfoCompletionSchema.safeParse({
    name,
    birthDate,
    gender,
    phoneNumber,
  }).success;
  const isPhoneVerified =
    phoneNumber.length > 0 &&
    phoneNumber === verifiedPhoneNumber &&
    Boolean(phoneVerificationId);
  const isVerificationActionPending =
    startMutation.isPending || qrMutation.isPending;
  const isPending = isVerificationActionPending || confirmMutation.isPending;

  const stopConfirmPolling = () => {
    activeVerificationIdRef.current = null;
    isConfirmPollingRequestPendingRef.current = false;

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
  };

  useEffect(() => {
    return () => {
      activeVerificationIdRef.current = null;
      isConfirmPollingRequestPendingRef.current = false;

      if (confirmPollingDelayRef.current !== null) {
        window.clearTimeout(confirmPollingDelayRef.current);
      }

      if (confirmPollingIntervalRef.current !== null) {
        window.clearInterval(confirmPollingIntervalRef.current);
      }

      if (confirmPollingExpiresRef.current !== null) {
        window.clearTimeout(confirmPollingExpiresRef.current);
      }
    };
  }, []);

  const resetPhoneVerification = () => {
    stopConfirmPolling();
    onVerifiedPhoneNumberChange(null);
    onPhoneVerificationIdChange(null);
    setIsQrDialogOpen(false);
    qrMutation.reset();
  };

  const handleConfirmVerified = (session: PhoneVerificationSession) => {
    onVerifiedPhoneNumberChange(session.phoneNumber);
    onPhoneVerificationIdChange(session.verificationId);
    setIsQrDialogOpen(false);
    clearErrors("phoneNumber");
    stopConfirmPolling();
  };

  const handleConfirmError = (
    session: PhoneVerificationSession,
    error: unknown,
  ) => {
    if (activeVerificationIdRef.current !== session.verificationId) {
      return;
    }

    resetPhoneVerification();

    if (shouldResetVerificationSession(error)) {
      startMutation.reset();
    }

    setError("phoneNumber", {
      message: getPhoneVerificationErrorMessage(
        error,
        "휴대폰 인증을 확인하지 못했습니다. 다시 시도해 주세요.",
      ),
    });
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

      stopConfirmPolling();
      setIsQrDialogOpen(false);
      setError("phoneNumber", {
        message: "휴대폰 인증 시간이 만료되었습니다. 다시 인증해 주세요.",
      });
    }, timeoutDelay);
  };

  const loadQrCode = (verificationId: string) => {
    qrMutation.mutate(verificationId, {
      onError: (error) => {
        resetPhoneVerification();
        setError("phoneNumber", {
          message: getPhoneVerificationErrorMessage(
            error,
            "QR 코드를 불러오지 못했습니다. 다시 인증해 주세요.",
          ),
        });
      },
    });
  };

  const handleStartVerification = () => {
    clearErrors("phoneNumber");

    if (!isPhoneNumberValid) {
      setError("phoneNumber", {
        message: PHONE_NUMBER_ERROR_MESSAGE,
      });
      return;
    }

    startMutation.mutate(
      { phoneNumber },
      {
        onSuccess: (data) => {
          const session = {
            verificationId: data.verificationId,
            phoneNumber,
          };

          stopConfirmPolling();
          onVerifiedPhoneNumberChange(null);
          onPhoneVerificationIdChange(null);
          qrMutation.reset();
          clearErrors("phoneNumber");
          startConfirmPolling(session, data.expiresAt);

          if (shouldUseSmsVerification()) {
            window.location.href = createSmsHref(
              data.receiverNumber,
              data.messageText,
            );
            return;
          }

          setIsQrDialogOpen(true);
          loadQrCode(data.verificationId);
        },
        onError: (error) => {
          setError("phoneNumber", {
            message: getPhoneVerificationErrorMessage(
              error,
              "휴대폰 인증을 시작하지 못했습니다. 다시 시도해 주세요.",
            ),
          });
        },
      },
    );
  };

  const handleVerifyPhone = () => {
    handleStartVerification();
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="space-y-7">
        <FormField
          htmlFor="name"
          label="이름"
          required
          error={errors.name?.message}
          errorId={getSignupFieldErrorId("name")}
          labelClassName="mb-3 text-[15px] font-semibold leading-5"
        >
          <Input
            id="name"
            maxLength={20}
            placeholder="이름을 입력해 주세요"
            invalid={Boolean(errors.name)}
            aria-describedby={getSignupFieldDescribedBy(
              "name",
              Boolean(errors.name),
            )}
            {...register("name")}
          />
        </FormField>

        <fieldset>
          <legend className="mb-3 text-[15px] font-semibold leading-5 text-text">
            생년월일 / 성별 <span className="text-point-red">*</span>
          </legend>

          <div className="flex gap-3">
            <Controller
              control={control}
              name="birthDate"
              render={({ field }) => (
                <Input
                  id="birthDate"
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  inputMode="numeric"
                  autoComplete="bday"
                  placeholder="YYYY. MM. DD"
                  value={formatBirthDateInput(field.value)}
                  invalid={Boolean(errors.birthDate)}
                  aria-describedby={getSignupFieldDescribedBy(
                    "birthDate",
                    Boolean(errors.birthDate),
                  )}
                  onChange={(event) => {
                    const nextValue = normalizeBirthDate(event.target.value);

                    field.onChange(nextValue);
                    if (isAllowedBirthDate(nextValue)) {
                      clearErrors("birthDate");
                    }
                  }}
                />
              )}
            />

            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <div
                  role="radiogroup"
                  aria-label="성별"
                  className="grid h-12 w-38 shrink-0 grid-cols-2 overflow-hidden rounded-xl border border-button"
                >
                  {[
                    ["MALE", "남"],
                    ["FEMALE", "여"],
                  ].map(([value, label]) => {
                    const checked = field.value === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        className={cn(
                          "flex cursor-pointer items-center justify-center text-[15px] font-medium",
                          checked
                            ? "bg-[#DCECDF] text-text"
                            : "bg-white text-text-gray-100",
                        )}
                        onClick={() => field.onChange(value)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          {errors.birthDate?.message || errors.gender?.message ? (
            <p
              id={getSignupFieldErrorId("birthDate")}
              className="mt-1.5 text-xs leading-4.5 text-point-red"
            >
              {errors.birthDate?.message ?? errors.gender?.message}
            </p>
          ) : null}
        </fieldset>

        <FormField
          htmlFor="phoneNumber"
          label="전화번호"
          required
          error={errors.phoneNumber?.message}
          errorId={getSignupFieldErrorId("phoneNumber")}
          labelClassName="mb-3 text-[15px] font-semibold leading-5"
        >
          <div className="flex gap-3">
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field }) => (
                <Input
                  id="phoneNumber"
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="010-0000-0000"
                  value={formatPhoneNumber(field.value)}
                  invalid={Boolean(errors.phoneNumber)}
                  aria-describedby={getSignupFieldDescribedBy(
                    "phoneNumber",
                    Boolean(errors.phoneNumber),
                  )}
                  onChange={(event) => {
                    clearErrors("phoneNumber");
                    resetPhoneVerification();
                    startMutation.reset();
                    field.onChange(normalizePhoneNumber(event.target.value));
                  }}
                />
              )}
            />
            <Button
              type="button"
              size="medium"
              disabled={
                isVerificationActionPending ||
                !isPhoneNumberValid ||
                isPhoneVerified
              }
              onClick={handleVerifyPhone}
              className={cn(
                "h-12 shrink-0 rounded-xl px-5 text-[15px] font-medium",
                isPhoneNumberValid && !isPhoneVerified
                  ? "bg-button text-white"
                  : "bg-[#BFBFBF] text-text",
              )}
            >
              {isVerificationActionPending
                ? "확인 중"
                : isPhoneVerified
                  ? "인증 완료"
                  : "인증하기"}
            </Button>
          </div>
        </FormField>
      </div>

      <Dialog.Root open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-text/30" />
          <Dialog.Content
            aria-busy={qrMutation.isPending}
            className={cn(
              "fixed top-1/2 left-1/2 z-50 box-border flex aspect-square w-[calc(100%-2rem)] max-w-[26rem]",
              "-translate-x-1/2 -translate-y-1/2 items-center justify-center bg-white p-0",
              "shadow-2xl outline-none",
            )}
          >
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="닫기"
                className="absolute -top-11 right-0 z-10 flex size-9 items-center justify-center rounded-full border border-stroke bg-white/90 text-text-gray-400 shadow-sm transition hover:bg-stroke/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
              >
                <X className="size-5" />
              </button>
            </Dialog.Close>

            <Dialog.Title className="sr-only">휴대폰 인증 QR</Dialog.Title>
            <Dialog.Description className="sr-only">
              휴대폰 카메라로 QR을 스캔한 뒤 문자앱에서 메시지를 전송해 주세요.
            </Dialog.Description>

            <div className="flex size-full items-center justify-center bg-white">
              {qrMutation.data?.qrCode ? (
                <img
                  src={qrMutation.data.qrCode}
                  alt="휴대폰 인증 QR 코드"
                  className="size-full object-contain"
                />
              ) : qrMutation.isPending ? (
                <div
                  aria-label="QR 코드 로딩 중"
                  className="size-10 animate-spin rounded-full border-4 border-stroke border-t-button"
                />
              ) : null}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="mt-auto" />

      <SignupStepButton
        disabled={!isBasicInfoComplete || !isPhoneVerified || isPending}
      >
        다음
      </SignupStepButton>
    </div>
  );
}
