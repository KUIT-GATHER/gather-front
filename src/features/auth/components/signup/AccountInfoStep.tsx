import { useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import {
  useConfirmEmailVerificationMutation,
  useSendEmailVerificationMutation,
} from "@/features/auth/hooks/useEmailVerificationMutation";
import {
  getSignupFieldDescribedBy,
  getSignupFieldErrorId,
} from "@/features/auth/lib/signupFieldA11y";
import { normalizeEmail } from "@/features/auth/lib/signupFormatters";
import type { SignupFormValues } from "@/features/auth/schemas/signup.schema";
import { ApiError } from "@/shared/api/apiError";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";

import {
  PasswordField,
  SignupRootError,
  SignupStepButton,
} from "./SignupFormParts";

type AccountInfoStepProps = {
  verifiedEmail: string | null;
  onVerifiedEmailChange: (value: string | null) => void;
};

export function AccountInfoStep({
  verifiedEmail,
  onVerifiedEmailChange,
}: AccountInfoStepProps) {
  const {
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  const [showCodeField, setShowCodeField] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] =
    useState(false);
  const sendMutation = useSendEmailVerificationMutation();
  const confirmMutation = useConfirmEmailVerificationMutation();
  const watchedEmail = useWatch({ control, name: "email" });
  const emailVerificationCode = useWatch({
    control,
    name: "emailVerificationCode",
  });
  const email = normalizeEmail(watchedEmail);
  const isEmailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
  const isEmailVerified = email.length > 0 && email === verifiedEmail;

  const handleSend = () => {
    clearErrors(["email", "emailVerificationCode"]);
    setStepError(null);

    if (!isEmailValid) {
      setError("email", { message: "올바른 이메일 형식이 아닙니다." });
      return;
    }

    onVerifiedEmailChange(null);
    setValue("emailVerificationCode", "", { shouldDirty: true });

    sendMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setShowCodeField(true);
        },
        onError: (error) => {
          if (
            error instanceof ApiError &&
            error.status === 409 &&
            error.code === API_ERROR_CODE.DUPLICATE_EMAIL
          ) {
            setError("email", { message: "이미 가입된 이메일입니다." });
            return;
          }

          if (
            error instanceof ApiError &&
            error.status === 500 &&
            error.code === API_ERROR_CODE.EMAIL_SEND_FAILED
          ) {
            setStepError(
              "인증 메일을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.",
            );
            return;
          }

          setError("email", { message: "이메일 형식을 다시 확인해 주세요." });
        },
      },
    );
  };

  const handleConfirm = () => {
    clearErrors("emailVerificationCode");
    setStepError(null);

    confirmMutation.mutate(
      { email, code: emailVerificationCode },
      {
        onSuccess: (data) => {
          if (data.verified) {
            onVerifiedEmailChange(normalizeEmail(data.email));
          }
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            if (error.code === API_ERROR_CODE.INVALID_VERIFICATION_CODE) {
              setError("emailVerificationCode", {
                message: "인증번호가 올바르지 않습니다.",
              });
              return;
            }

            if (error.code === API_ERROR_CODE.EXPIRED_VERIFICATION_CODE) {
              setError("emailVerificationCode", {
                message: "인증번호가 만료되었습니다. 다시 발송해 주세요.",
              });
              return;
            }

            if (error.code === API_ERROR_CODE.EMAIL_VERIFICATION_NOT_FOUND) {
              setError("emailVerificationCode", {
                message:
                  "인증 요청을 찾을 수 없습니다. 인증번호를 다시 발송해 주세요.",
              });
              return;
            }
          }

          setError("emailVerificationCode", {
            message: "인증번호를 확인하지 못했습니다. 다시 시도해 주세요.",
          });
        },
      },
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="space-y-6">
        <FormField
          htmlFor="email"
          label="이메일"
          required
          error={errors.email?.message}
          errorId={getSignupFieldErrorId("email")}
          labelClassName="mb-3 text-[15px] font-semibold leading-5"
        >
          <div className="flex gap-3">
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  id="email"
                  ref={field.ref}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  placeholder="이메일을 입력해 주세요"
                  value={field.value}
                  invalid={Boolean(errors.email)}
                  aria-describedby={getSignupFieldDescribedBy(
                    "email",
                    Boolean(errors.email),
                  )}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(normalizeEmail(event.target.value));
                    setShowCodeField(false);
                    setStepError(null);
                  }}
                />
              )}
            />
            <Button
              type="button"
              size="medium"
              disabled={sendMutation.isPending || isEmailVerified || !isEmailValid}
              onClick={handleSend}
              className={cn(
                "h-12 shrink-0 rounded-xl px-5 text-[15px] font-medium",
                isEmailValid && !isEmailVerified
                  ? "bg-button text-white"
                  : "bg-[#BFBFBF] text-text",
              )}
            >
              {sendMutation.isPending
                ? "발송 중"
                : isEmailVerified
                  ? "인증 완료"
                  : showCodeField
                    ? "재전송"
                    : "메일 인증"}
            </Button>
          </div>
        </FormField>

        {showCodeField ? (
          <FormField
            htmlFor="emailVerificationCode"
            label="인증번호"
            required
            error={errors.emailVerificationCode?.message}
            errorId={getSignupFieldErrorId("emailVerificationCode")}
            labelClassName="mb-3 text-[15px] font-semibold leading-5"
          >
            <div className="flex gap-3">
              <Controller
                control={control}
                name="emailVerificationCode"
                render={({ field }) => (
                  <Input
                    id="emailVerificationCode"
                    ref={field.ref}
                    name={field.name}
                    onBlur={field.onBlur}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="인증번호 6자리"
                    value={field.value}
                    invalid={Boolean(errors.emailVerificationCode)}
                    aria-describedby={getSignupFieldDescribedBy(
                      "emailVerificationCode",
                      Boolean(errors.emailVerificationCode),
                    )}
                    onChange={(event) => {
                      field.onChange(
                        event.target.value.replace(/\D/g, "").slice(0, 6),
                      );
                    }}
                  />
                )}
              />
              <Button
                type="button"
                size="medium"
                disabled={
                  confirmMutation.isPending ||
                  isEmailVerified ||
                  !/^\d{6}$/.test(emailVerificationCode)
                }
                onClick={handleConfirm}
                className={cn(
                  "h-12 shrink-0 rounded-xl px-5 text-[15px] font-medium",
                  /^\d{6}$/.test(emailVerificationCode) && !isEmailVerified
                    ? "bg-button text-white"
                    : "bg-[#BFBFBF] text-text",
                )}
              >
                {confirmMutation.isPending ? "확인 중" : "인증하기"}
              </Button>
            </div>
          </FormField>
        ) : null}

        <PasswordField
          name="password"
          label="비밀번호"
          placeholder="6자 이상 입력해 주세요"
          visible={isPasswordVisible}
          onVisibleChange={setIsPasswordVisible}
        />

        <PasswordField
          name="passwordConfirm"
          label="비밀번호 확인"
          placeholder="비밀번호를 다시 입력해 주세요"
          visible={isPasswordConfirmVisible}
          onVisibleChange={setIsPasswordConfirmVisible}
        />
      </div>

      <SignupRootError message={stepError} />
      <div className="mt-auto" />

      <SignupStepButton
        disabled={
          !isEmailVerified ||
          sendMutation.isPending ||
          confirmMutation.isPending
        }
      >
        다음
      </SignupStepButton>
    </div>
  );
}
