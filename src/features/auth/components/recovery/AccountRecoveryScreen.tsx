import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Mail } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { z } from "zod";

import KakaoIcon from "@/assets/icons/Kakao.svg";
import { PhoneVerificationQrDialog } from "@/features/auth/components/phone/PhoneVerificationQrDialog";
import {
  useFindAccountMutation,
  useIssuePasswordResetTokenMutation,
} from "@/features/auth/hooks/usePhoneVerificationMutation";
import { usePhoneVerificationFlow } from "@/features/auth/hooks/usePhoneVerificationFlow";
import {
  formatPhoneNumber,
  normalizePhoneNumber,
} from "@/features/auth/lib/signupFormatters";
import { signupPhoneNumberSchema } from "@/features/auth/schemas/signupCommon.schema";
import type {
  AccountRecoveryEmailResponse,
  PhoneVerificationPurpose,
} from "@/features/auth/types/auth.types";
import { ApiError } from "@/shared/api/apiError";
import { cn } from "@/shared/lib/cn";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";
import Button from "@/shared/ui/Button";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";

type RecoveryTab = "ID" | "PASSWORD";

export type AccountRecoveryLocationState = {
  tab?: RecoveryTab;
};

type RecoveryFormValues = {
  phoneNumber: string;
};

const recoveryPhoneSchema = z.object({
  phoneNumber: signupPhoneNumberSchema,
});

function getInitialTab(value: unknown): RecoveryTab {
  return value === "PASSWORD" ? "PASSWORD" : "ID";
}

function getRecoveryErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof ApiError)) {
    return fallback;
  }

  switch (error.code) {
    case API_ERROR_CODE.ACCOUNT_NOT_FOUND:
      return "가입된 계정을 찾을 수 없어요. 전화번호를 다시 확인해 주세요.";
    case API_ERROR_CODE.PASSWORD_RESET_NOT_AVAILABLE:
      return "카카오로 가입한 계정이에요. 카카오 로그인을 이용해 주세요.";
    case API_ERROR_CODE.PHONE_VERIFICATION_EXPIRED:
    case API_ERROR_CODE.PHONE_VERIFICATION_NOT_FOUND:
    case API_ERROR_CODE.PHONE_VERIFICATION_PURPOSE_MISMATCH:
      return "휴대폰 인증이 만료되었어요. 다시 인증해 주세요.";
    default:
      return error.message || fallback;
  }
}

function isConsumedRecoveryError(error: unknown) {
  return (
    error instanceof ApiError &&
    (error.code === API_ERROR_CODE.ACCOUNT_NOT_FOUND ||
      error.code === API_ERROR_CODE.PASSWORD_RESET_NOT_AVAILABLE)
  );
}

export function AccountRecoveryScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as AccountRecoveryLocationState | null;
  const [tab, setTab] = useState<RecoveryTab>(
    getInitialTab(locationState?.tab),
  );
  const [result, setResult] = useState<AccountRecoveryEmailResponse | null>(
    null,
  );
  const tabRefs = useRef<Record<RecoveryTab, HTMLButtonElement | null>>({
    ID: null,
    PASSWORD: null,
  });
  const [rootError, setRootError] = useState<string | null>(null);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const methods = useForm<RecoveryFormValues>({
    resolver: zodResolver(recoveryPhoneSchema),
    mode: "onChange",
    defaultValues: { phoneNumber: "" },
  });
  const phoneNumber = useWatch({
    control: methods.control,
    name: "phoneNumber",
  });
  const purpose: PhoneVerificationPurpose =
    tab === "ID" ? "FIND_ACCOUNT" : "RESET_PASSWORD";
  const phoneVerification = usePhoneVerificationFlow({
    phoneNumber,
    purpose,
    onError: (message) => methods.setError("phoneNumber", { message }),
    onClearError: () => methods.clearErrors("phoneNumber"),
  });
  const findAccountMutation = useFindAccountMutation();
  const issuePasswordResetTokenMutation = useIssuePasswordResetTokenMutation();

  const selectTab = (nextTab: RecoveryTab) => {
    if (nextTab === tab) {
      return;
    }

    phoneVerification.reset();
    methods.clearErrors();
    setRootError(null);
    setResult(null);
    setTab(nextTab);
    tabRefs.current[nextTab]?.focus();
  };

  const handleRecoveryError = (error: unknown, fallback: string) => {
    if (isConsumedRecoveryError(error)) {
      phoneVerification.reset();
    }

    if (
      error instanceof ApiError &&
      (error.code === API_ERROR_CODE.PHONE_VERIFICATION_EXPIRED ||
        error.code === API_ERROR_CODE.PHONE_VERIFICATION_NOT_FOUND ||
        error.code === API_ERROR_CODE.PHONE_VERIFICATION_PURPOSE_MISMATCH)
    ) {
      phoneVerification.reset();
      methods.setError("phoneNumber", {
        message: getRecoveryErrorMessage(error, fallback),
      });
      return;
    }

    setRootError(getRecoveryErrorMessage(error, fallback));
  };

  const handleFindAccount = () => {
    if (!phoneVerification.phoneVerificationId) {
      return;
    }

    setRootError(null);
    findAccountMutation.mutate(
      { phoneVerificationId: phoneVerification.phoneVerificationId },
      {
        onSuccess: (data) => {
          phoneVerification.reset();
          setResult(data);
        },
        onError: (error) =>
          handleRecoveryError(
            error,
            "아이디를 찾지 못했습니다. 잠시 후 다시 시도해 주세요.",
          ),
      },
    );
  };

  const handleIssuePasswordResetToken = () => {
    if (!phoneVerification.phoneVerificationId) {
      return;
    }

    setRootError(null);
    issuePasswordResetTokenMutation.mutate(
      { phoneVerificationId: phoneVerification.phoneVerificationId },
      {
        onSuccess: ({ passwordResetToken }) => {
          phoneVerification.reset();
          navigate("/account-recovery/password", {
            state: { passwordResetToken },
          });
        },
        onError: (error) =>
          handleRecoveryError(
            error,
            "비밀번호 재설정을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.",
          ),
      },
    );
  };

  const isRecoveryPending =
    findAccountMutation.isPending || issuePasswordResetTokenMutation.isPending;
  const isVerificationButtonDisabled =
    !phoneVerification.isPhoneNumberValid ||
    phoneVerification.isPhoneVerified ||
    phoneVerification.isVerificationActionPending ||
    (phoneVerification.isVerificationInProgress &&
      !phoneVerification.canReopenQr);
  const isIdResult = result?.loginType === "EMAIL";

  return (
    <PageContainer
      size="narrow"
      className="flex min-h-dvh flex-col overflow-y-auto bg-bg pb-[calc(env(safe-area-inset-bottom)+2.5rem)]"
    >
      <PageHeader
        title={
          isIdResult || result?.loginType === "KAKAO"
            ? "아이디 찾기"
            : "아이디/비밀번호 찾기"
        }
        onBack={() => navigate("/login/email")}
        className="shrink-0 bg-bg"
      />

      <div
        role="tablist"
        aria-label="계정 찾기 유형"
        className="-mx-5.5 flex w-[calc(100%+2.75rem)] shrink-0 border-b border-stroke bg-bg"
      >
        <button
          id="recovery-tab-id"
          ref={(element) => {
            tabRefs.current.ID = element;
          }}
          type="button"
          role="tab"
          aria-selected={tab === "ID"}
          aria-controls="recovery-panel"
          tabIndex={tab === "ID" ? 0 : -1}
          className={cn(
            "h-12 flex-1 border-b-2 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
            tab === "ID"
              ? "border-button font-semibold text-text"
              : "border-transparent font-medium text-text-gray-400",
          )}
          onClick={() => selectTab("ID")}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              selectTab("PASSWORD");
            }
          }}
        >
          아이디 찾기
        </button>
        <button
          id="recovery-tab-password"
          ref={(element) => {
            tabRefs.current.PASSWORD = element;
          }}
          type="button"
          role="tab"
          aria-selected={tab === "PASSWORD"}
          aria-controls="recovery-panel"
          tabIndex={tab === "PASSWORD" ? 0 : -1}
          className={cn(
            "h-12 flex-1 border-b-2 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
            tab === "PASSWORD"
              ? "border-button font-semibold text-text"
              : "border-transparent font-medium text-text-gray-400",
          )}
          onClick={() => selectTab("PASSWORD")}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              selectTab("ID");
            }
          }}
        >
          비밀번호 찾기
        </button>
      </div>

      <main
        id="recovery-panel"
        role="tabpanel"
        aria-labelledby={
          tab === "ID" ? "recovery-tab-id" : "recovery-tab-password"
        }
        className="flex min-h-0 flex-1 flex-col pt-6"
      >
        {result ? (
          <RecoveryResult
            result={result}
            onEmailLogin={() => setIsLoginDialogOpen(true)}
            onKakaoLogin={() => navigate("/login")}
          />
        ) : (
          <form
            noValidate
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              if (tab === "ID") {
                handleFindAccount();
                return;
              }

              handleIssuePasswordResetToken();
            }}
          >
            <FormField
              htmlFor="recovery-phone-number"
              label="전화번호"
              required
              error={methods.formState.errors.phoneNumber?.message}
              errorId="recovery-phone-number-error"
              labelClassName="mb-3 text-[15px] font-semibold leading-5"
            >
              <div className="flex gap-3">
                <Controller
                  control={methods.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <Input
                      id="recovery-phone-number"
                      ref={field.ref}
                      name={field.name}
                      onBlur={field.onBlur}
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="010-0000-0000"
                      aria-describedby={
                        methods.formState.errors.phoneNumber
                          ? "recovery-phone-number-error"
                          : undefined
                      }
                      value={formatPhoneNumber(field.value)}
                      invalid={Boolean(methods.formState.errors.phoneNumber)}
                      onChange={(event) => {
                        setRootError(null);
                        methods.clearErrors("phoneNumber");
                        field.onChange(
                          normalizePhoneNumber(event.target.value),
                        );
                      }}
                    />
                  )}
                />
                <Button
                  type="button"
                  size="medium"
                  disabled={isVerificationButtonDisabled}
                  className="h-12 shrink-0 rounded-xl px-5 text-[15px] font-medium"
                  onClick={() => {
                    setRootError(null);
                    phoneVerification.handleVerifyPhone();
                  }}
                >
                  {phoneVerification.isPhoneVerified
                    ? "인증완료"
                    : phoneVerification.isVerificationActionPending
                      ? "확인 중"
                      : phoneVerification.canReopenQr
                        ? "QR 다시 보기"
                        : phoneVerification.isVerificationInProgress
                          ? "인증 중"
                          : "인증하기"}
                </Button>
              </div>
            </FormField>

            {phoneVerification.isPhoneVerified ? (
              <p className="mt-1.5 text-xs leading-4.5 text-point-red">
                전화번호 인증이 완료되었습니다.
              </p>
            ) : null}

            {rootError ? (
              <p role="alert" className="mt-3 text-sm leading-5 text-point-red">
                {rootError}
              </p>
            ) : null}

            <div className="mt-auto flex justify-center pt-10">
              <Button
                fullWidth
                type="submit"
                disabled={
                  !phoneVerification.isPhoneVerified ||
                  isRecoveryPending ||
                  phoneVerification.isPending
                }
                className="h-12 max-w-[19.6875rem] text-lg font-semibold"
              >
                {isRecoveryPending
                  ? "확인 중"
                  : tab === "ID"
                    ? "확인"
                    : "비밀번호 재설정"}
              </Button>
            </div>
          </form>
        )}
      </main>

      <PhoneVerificationQrDialog flow={phoneVerification} />

      <ConfirmDialog
        open={isLoginDialogOpen}
        title="로그인 화면으로 이동하시겠어요?"
        onCancel={() => setIsLoginDialogOpen(false)}
        onConfirm={() => {
          if (result?.loginType !== "EMAIL") {
            return;
          }

          navigate("/login/email", { state: { email: result.email } });
        }}
      />
    </PageContainer>
  );
}

function RecoveryResult({
  result,
  onEmailLogin,
  onKakaoLogin,
}: {
  result: AccountRecoveryEmailResponse;
  onEmailLogin: () => void;
  onKakaoLogin: () => void;
}) {
  if (result.loginType === "KAKAO") {
    return (
      <section className="flex flex-1 flex-col">
        <h2 className="text-[18px] font-semibold leading-7 text-text">
          카카오로 가입한 계정이에요.
        </h2>
        <p className="mt-1 text-body-15 text-text-gray-100">
          카카오 로그인을 이용해 주세요.
        </p>
        <button
          type="button"
          className="mt-6 flex w-full items-center gap-4 rounded-xl border border-stroke bg-white p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
          onClick={onKakaoLogin}
        >
          <span className="flex size-12 items-center justify-center rounded-xl bg-[#FEE84D]">
            <img src={KakaoIcon} alt="" aria-hidden="true" />
          </span>
          <span className="flex-1 text-base font-medium text-text">
            카카오로 로그인
          </span>
          <ChevronRight
            className="size-6 text-text-gray-400"
            aria-hidden="true"
          />
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col">
      <h2 className="text-[18px] font-semibold leading-7 text-text">
        이메일/아이디를 찾았어요!
      </h2>
      <p className="text-body-15 text-text-gray-100">
        아래 계정으로 로그인해주세요
      </p>
      <button
        type="button"
        className="mt-6 flex w-full items-center gap-4 rounded-xl border border-stroke bg-white p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
        onClick={onEmailLogin}
      >
        <span className="flex size-12 items-center justify-center rounded-xl bg-[#F0F6F0]">
          <Mail className="size-5 text-icon" aria-hidden="true" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-base font-medium text-text">
            이메일로 로그인
          </span>
          <span className="truncate text-body-15 text-text-gray-400">
            {result.email}
          </span>
        </span>
        <ChevronRight
          className="size-6 shrink-0 text-text-gray-400"
          aria-hidden="true"
        />
      </button>
      <p className="mt-auto pb-1 text-center text-body-15 text-text-gray-100">
        로그인에 문제가 있나요?
      </p>
    </section>
  );
}
