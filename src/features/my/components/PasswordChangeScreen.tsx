import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import { clearAuthSession } from "@/features/auth/lib/clearAuthSession";
import { useChangeMyPasswordMutation } from "@/features/my/hooks/useChangeMyPasswordMutation";
import { useMyProfileQuery } from "@/features/my/hooks/useMyProfileQuery";
import {
  passwordChangeSchema,
  type PasswordChangeFormValues,
} from "@/features/my/schemas/passwordChange.schema";
import { ApiError } from "@/shared/api/apiError";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";
import Button from "@/shared/ui/Button";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";
import PasswordField from "@/shared/ui/PasswordField";

const PROFILE_EDIT_PATH = "/my/profile/edit";

function getMutationErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  return "비밀번호를 변경하지 못했습니다. 다시 시도해 주세요.";
}

export function PasswordChangeScreen() {
  const navigate = useNavigate();
  const profileQuery = useMyProfileQuery();
  const changePasswordMutation = useChangeMyPasswordMutation();
  const [rootError, setRootError] = useState<string | null>(null);
  const methods = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      password: "",
      passwordConfirm: "",
    },
  });

  useEffect(() => {
    if (profileQuery.data?.loginType === "KAKAO") {
      navigate(PROFILE_EDIT_PATH, { replace: true });
    }
  }, [navigate, profileQuery.data?.loginType]);

  const handleSubmit = methods.handleSubmit((values) => {
    setRootError(null);
    changePasswordMutation.mutate(values, {
      onSuccess: () => {
        methods.reset();
        clearAuthSession();
        navigate("/login/email", {
          replace: true,
          state: { from: "/home" },
        });
      },
      onError: (error) => {
        if (
          error instanceof ApiError &&
          error.code === API_ERROR_CODE.CURRENT_PASSWORD_MISMATCH
        ) {
          methods.setError("currentPassword", {
            type: "server",
            message: "현재 비밀번호가 일치하지 않습니다.",
          });
          return;
        }

        if (
          error instanceof ApiError &&
          error.code === API_ERROR_CODE.PASSWORD_MISMATCH
        ) {
          methods.setError("passwordConfirm", {
            type: "server",
            message: "비밀번호가 일치하지 않습니다.",
          });
          return;
        }

        setRootError(getMutationErrorMessage(error));
      },
    });
  });

  if (profileQuery.isLoading) {
    return (
      <PageContainer className="flex min-h-dvh items-center justify-center">
        <LoadingState label="프로필을 불러오는 중이에요." />
      </PageContainer>
    );
  }

  if (profileQuery.isError) {
    return (
      <PageContainer className="flex min-h-dvh items-center justify-center">
        <ErrorState
          title="프로필을 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요."
          primaryAction={{
            label: "다시 시도",
            onClick: () => {
              void profileQuery.refetch();
            },
          }}
          secondaryAction={{
            label: "돌아가기",
            onClick: () => navigate(PROFILE_EDIT_PATH),
          }}
        />
      </PageContainer>
    );
  }

  if (!profileQuery.data || profileQuery.data.loginType === "KAKAO") {
    return null;
  }

  if (profileQuery.data.loginType !== "EMAIL") {
    return (
      <PageContainer className="flex min-h-dvh items-center justify-center">
        <ErrorState
          title="비밀번호 변경을 이용할 수 없어요"
          description="프로필 편집으로 돌아가 다시 시도해 주세요."
          primaryAction={{
            label: "프로필 편집으로 돌아가기",
            onClick: () => navigate(PROFILE_EDIT_PATH, { replace: true }),
          }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      size="narrow"
      className="flex min-h-dvh flex-col overflow-y-auto bg-bg pb-[calc(env(safe-area-inset-bottom)+2.5rem)]"
    >
      <PageHeader
        title="비밀번호 변경"
        onBack={() => navigate(PROFILE_EDIT_PATH)}
        className="shrink-0 bg-bg"
      />

      <form
        noValidate
        className="flex min-h-0 flex-1 flex-col gap-6 pt-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!changePasswordMutation.isPending) {
            void handleSubmit();
          }
        }}
      >
        <Controller
          control={methods.control}
          name="currentPassword"
          render={({ field }) => (
            <PasswordField
              id="current-password"
              label="현재 비밀번호"
              required
              placeholder="현재 비밀번호를 입력해 주세요"
              autoComplete="current-password"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              inputRef={field.ref}
              error={methods.formState.errors.currentPassword?.message}
            />
          )}
        />

        <Controller
          control={methods.control}
          name="password"
          render={({ field }) => (
            <PasswordField
              id="new-password"
              label="새 비밀번호"
              required
              placeholder="6자 이상 입력해 주세요"
              autoComplete="new-password"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              inputRef={field.ref}
              error={methods.formState.errors.password?.message}
            />
          )}
        />

        <Controller
          control={methods.control}
          name="passwordConfirm"
          render={({ field }) => (
            <PasswordField
              id="new-password-confirm"
              label="새 비밀번호 확인"
              required
              placeholder="비밀번호를 다시 입력해 주세요"
              autoComplete="new-password"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              inputRef={field.ref}
              error={methods.formState.errors.passwordConfirm?.message}
            />
          )}
        />

        {rootError ? (
          <p role="alert" className="text-sm leading-5 text-point-red">
            {rootError}
          </p>
        ) : null}

        <div className="mt-auto flex justify-center pt-10">
          <Button
            fullWidth
            type="submit"
            disabled={
              !methods.formState.isValid || changePasswordMutation.isPending
            }
            className="h-12 max-w-[19.6875rem] text-lg font-semibold"
          >
            {changePasswordMutation.isPending ? "변경 중..." : "비밀번호 변경"}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
