import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";

import { useResetPasswordMutation } from "@/features/auth/hooks/usePhoneVerificationMutation";
import {
  passwordResetSchema,
  type PasswordResetFormValues,
} from "@/features/auth/schemas/password.schema";
import { ApiError } from "@/shared/api/apiError";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";
import Button from "@/shared/ui/Button";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";

export type PasswordResetLocationState = {
  passwordResetToken?: string;
};

function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  name,
  inputRef,
  error,
  visible,
  onVisibleChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  name: string;
  inputRef: (element: HTMLInputElement | null) => void;
  error?: string;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
}) {
  return (
    <FormField
      htmlFor={id}
      label={label}
      required
      error={error}
      errorId={`${id}-error`}
      labelClassName="mb-3 text-[15px] font-semibold leading-5"
    >
      <div className="relative">
        <Input
          id={id}
          ref={inputRef}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          placeholder={placeholder}
          aria-describedby={error ? `${id}-error` : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          className="pr-12"
          invalid={Boolean(error)}
        />
        <button
          type="button"
          aria-label={visible ? `${label} 숨기기` : `${label} 보기`}
          className="absolute top-1/2 right-4 flex size-6 -translate-y-1/2 items-center justify-center text-text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
          onClick={() => onVisibleChange(!visible)}
        >
          {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
    </FormField>
  );
}

export function PasswordResetScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as PasswordResetLocationState | null;
  const [passwordResetToken] = useState<string | undefined>(
    () => locationState?.passwordResetToken,
  );
  const hasScrubbedLocationStateRef = useRef(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] =
    useState(false);
  const [rootError, setRootError] = useState<string | null>(null);
  const [canRetryVerification, setCanRetryVerification] = useState(false);
  const resetPasswordMutation = useResetPasswordMutation();
  const methods = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    mode: "onChange",
    defaultValues: { password: "", passwordConfirm: "" },
  });

  useEffect(() => {
    if (!passwordResetToken) {
      navigate("/account-recovery", {
        replace: true,
        state: { tab: "PASSWORD" },
      });
      return;
    }

    if (hasScrubbedLocationStateRef.current) {
      return;
    }

    hasScrubbedLocationStateRef.current = true;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, navigate, passwordResetToken]);

  if (!passwordResetToken) {
    return null;
  }

  const handleSubmit = methods.handleSubmit((values) => {
    setRootError(null);
    setCanRetryVerification(false);
    resetPasswordMutation.mutate(
      { ...values, passwordResetToken },
      {
        onSuccess: () => {
          methods.reset();
          navigate("/login/email", { replace: true });
        },
        onError: (error) => {
          if (
            error instanceof ApiError &&
            error.code === API_ERROR_CODE.PASSWORD_MISMATCH
          ) {
            methods.setError("passwordConfirm", {
              message: "비밀번호가 일치하지 않습니다.",
            });
            return;
          }

          setRootError(
            error instanceof ApiError
              ? error.message ||
                  "비밀번호를 변경하지 못했습니다. 다시 시도해 주세요."
              : "비밀번호를 변경하지 못했습니다. 다시 시도해 주세요.",
          );
          setCanRetryVerification(true);
        },
      },
    );
  });

  return (
    <PageContainer
      size="narrow"
      className="flex min-h-dvh flex-col overflow-y-auto bg-bg pb-[calc(env(safe-area-inset-bottom)+2.5rem)]"
    >
      <PageHeader
        title="비밀번호 재설정"
        onBack={() =>
          navigate("/account-recovery", {
            state: { tab: "PASSWORD" },
          })
        }
        className="shrink-0 bg-bg"
      />

      <form
        noValidate
        className="flex min-h-0 flex-1 flex-col gap-6 pt-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!resetPasswordMutation.isPending) {
            void handleSubmit();
          }
        }}
      >
        <Controller
          control={methods.control}
          name="password"
          render={({ field }) => (
            <PasswordField
              id="password-reset-password"
              label="비밀번호"
              placeholder="6자 이상 입력해 주세요"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              inputRef={field.ref}
              error={methods.formState.errors.password?.message}
              visible={isPasswordVisible}
              onVisibleChange={setIsPasswordVisible}
            />
          )}
        />
        <Controller
          control={methods.control}
          name="passwordConfirm"
          render={({ field }) => (
            <PasswordField
              id="password-reset-confirm"
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력해 주세요"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              inputRef={field.ref}
              error={methods.formState.errors.passwordConfirm?.message}
              visible={isPasswordConfirmVisible}
              onVisibleChange={setIsPasswordConfirmVisible}
            />
          )}
        />

        {rootError ? (
          <div className="space-y-2">
            <p role="alert" className="text-sm leading-5 text-point-red">
              {rootError}
            </p>
            {canRetryVerification ? (
              <button
                type="button"
                className="text-sm font-semibold text-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                onClick={() =>
                  navigate("/account-recovery", {
                    replace: true,
                    state: { tab: "PASSWORD" },
                  })
                }
              >
                다시 전화번호 인증하기
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex justify-center pt-10">
          <Button
            fullWidth
            type="submit"
            disabled={
              !methods.formState.isValid || resetPasswordMutation.isPending
            }
            className="h-12 max-w-[19.6875rem] text-lg font-semibold"
          >
            {resetPasswordMutation.isPending ? "변경 중" : "로그인하러 가기"}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
