import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useLoginMutation } from "@/features/auth/hooks/useLoginMutation";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";
import { ApiError } from "@/shared/api/apiError";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";

type EmailLoginFormProps = {
  className?: string;
  onSuccess: () => void;
  onSignupClick: () => void;
};

function getLoginErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return "로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (error.code === API_ERROR_CODE.INVALID_LOGIN) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }

  if (error.code === API_ERROR_CODE.SUSPENDED_USER) {
    return "정지된 계정입니다. 관리자에게 문의해 주세요.";
  }

  if (error.code === API_ERROR_CODE.WITHDRAWN_USER) {
    return "탈퇴한 계정입니다.";
  }

  if (error.code === API_ERROR_CODE.VALIDATION_ERROR) {
    return "입력한 정보를 다시 확인해 주세요.";
  }

  return error.message;
}

export function EmailLoginForm({
  className,
  onSuccess,
  onSignupClick,
}: EmailLoginFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleValidSubmit = (values: LoginFormValues) => {
    clearErrors("root");

    loginMutation.mutate(values, {
      onSuccess,
      onError: (error) => {
        setError("root", {
          message: getLoginErrorMessage(error),
        });
      },
    });
  };

  const onSubmit = handleSubmit(handleValidSubmit);

  return (
    <form noValidate className={cn("w-full", className)} onSubmit={onSubmit}>
      <div className="space-y-5">
        <FormField
          htmlFor="email"
          label="이메일"
          error={errors.email?.message}
          labelClassName="mb-2 text-[16px] font-semibold leading-[22px]"
        >
          <Input
            id="email"
            type="email"
            placeholder="이메일을 입력해 주세요."
            autoComplete="email"
            invalid={Boolean(errors.email)}
            aria-invalid={Boolean(errors.email)}
            {...register("email", {
              onChange: () => clearErrors("root"),
            })}
          />
        </FormField>

        <FormField
          htmlFor="password"
          label="비밀번호"
          error={errors.password?.message}
          labelClassName="mb-2 text-[16px] font-semibold leading-[22px]"
        >
          <div className="relative">
            <Input
              id="password"
              type={isPasswordVisible ? "text" : "password"}
              placeholder="비밀번호를 입력해 주세요."
              autoComplete="current-password"
              className="pr-12"
              invalid={Boolean(errors.password)}
              aria-invalid={Boolean(errors.password)}
              {...register("password", {
                onChange: () => clearErrors("root"),
              })}
            />

            <button
              type="button"
              aria-label={
                isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"
              }
              className="absolute top-1/2 right-4 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-text-gray-100"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
            >
              {isPasswordVisible ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </FormField>
      </div>

      {errors.root?.message ? (
        <p className="mt-3 text-center text-[13px] leading-[18px] text-point-red">
          {errors.root.message}
        </p>
      ) : null}

      <Button
        fullWidth
        type="submit"
        disabled={!isValid || loginMutation.isPending}
        className="mt-[42px] h-[54px] text-[18px] font-semibold"
      >
        {loginMutation.isPending ? "로그인 중..." : "로그인"}
      </Button>

      <p className="mt-[28px] text-center text-[14px] leading-[20px] text-text-gray-100">
        계정이 없으신가요?{" "}
        <button
          type="button"
          className="font-semibold text-button"
          onClick={onSignupClick}
        >
          회원가입
        </button>
      </p>
    </form>
  );
}