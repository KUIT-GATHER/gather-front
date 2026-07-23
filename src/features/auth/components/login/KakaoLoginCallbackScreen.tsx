import { useEffect, useRef, useState } from "react";
import { CircleAlert } from "lucide-react";
import { useNavigate } from "react-router";

import { useKakaoLoginMutation } from "@/features/auth/hooks/useKakaoLoginMutation";
import {
  consumeKakaoLoginReturnPath,
  consumeKakaoOAuthState,
  getKakaoRedirectUri,
  startKakaoLogin,
} from "@/features/auth/lib/kakaoOAuth";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useKakaoSignupStore } from "@/features/auth/store/kakaoSignup.store";
import { ApiError } from "@/shared/api/apiError";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import PageContainer from "@/shared/ui/PageContainer";

type CallbackError =
  | "invalid"
  | "cancelled"
  | "retry"
  | "suspended"
  | "withdrawn";

function getCallbackError(error: unknown): CallbackError {
  if (!(error instanceof ApiError)) {
    return "retry";
  }

  if (error.code === API_ERROR_CODE.SUSPENDED_USER) {
    return "suspended";
  }

  if (error.code === API_ERROR_CODE.WITHDRAWN_USER) {
    return "withdrawn";
  }

  return "retry";
}

const callbackErrorContent: Record<
  CallbackError,
  { title: string; description: string; action: "restart" | "login" }
> = {
  invalid: {
    title: "카카오 로그인 정보를 확인할 수 없어요.",
    description: "보안을 위해 카카오 로그인부터 다시 진행해 주세요.",
    action: "restart",
  },
  cancelled: {
    title: "카카오 로그인 동의가 취소되었어요.",
    description: "계속하려면 카카오 로그인을 다시 시작해 주세요.",
    action: "restart",
  },
  retry: {
    title: "카카오 로그인을 완료하지 못했어요.",
    description: "잠시 후 카카오 로그인을 다시 시작해 주세요.",
    action: "restart",
  },
  suspended: {
    title: "이용이 정지된 계정입니다.",
    description: "계정 상태에 대한 문의는 관리자에게 연락해 주세요.",
    action: "login",
  },
  withdrawn: {
    title: "탈퇴한 계정입니다.",
    description: "탈퇴한 계정은 카카오 로그인으로 이용할 수 없습니다.",
    action: "login",
  },
};

export function KakaoLoginCallbackScreen() {
  const navigate = useNavigate();
  const callbackHandledRef = useRef(false);
  const [callbackError, setCallbackError] = useState<CallbackError | null>(
    null,
  );
  const { mutateAsync: loginWithKakao } = useKakaoLoginMutation();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setKakaoSignupSession = useKakaoSignupStore(
    (state) => state.setKakaoSignupSession,
  );
  const clearKakaoSignupSession = useKakaoSignupStore(
    (state) => state.clearKakaoSignupSession,
  );

  useEffect(() => {
    if (callbackHandledRef.current) {
      return;
    }

    callbackHandledRef.current = true;

    const query = new URLSearchParams(window.location.search);
    const authorizationCode = query.get("code");
    const state = query.get("state");
    const kakaoError = query.get("error");
    const returnPath = consumeKakaoLoginReturnPath();

    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.hash}`,
    );

    if (kakaoError) {
      const nextCallbackError = consumeKakaoOAuthState(state)
        ? "cancelled"
        : "invalid";

      window.setTimeout(() => {
        setCallbackError(nextCallbackError);
      });
      return;
    }

    if (!consumeKakaoOAuthState(state) || !authorizationCode) {
      window.setTimeout(() => {
        setCallbackError("invalid");
      });
      return;
    }

    const redirectUri = getKakaoRedirectUri();
    const validAuthorizationCode = authorizationCode;

    async function completeKakaoLogin() {
      try {
        const response = await loginWithKakao({
          authorizationCode: validAuthorizationCode,
          redirectUri,
        });

        if (response.signupStatus === "LOGIN_COMPLETED") {
          setAccessToken(response.accessToken);
          clearKakaoSignupSession();
          navigate(returnPath ?? "/home", { replace: true });
          return;
        }

        setKakaoSignupSession({
          signupToken: response.signupToken,
          initialNickname: response.profile.nickname,
        });
        navigate("/signup/kakao", {
          replace: true,
          state: { from: returnPath },
        });
      } catch (error) {
        setCallbackError(getCallbackError(error));
      }
    }

    void completeKakaoLogin();
  }, [
    clearKakaoSignupSession,
    loginWithKakao,
    navigate,
    setAccessToken,
    setKakaoSignupSession,
  ]);

  const handleRestart = () => {
    try {
      startKakaoLogin();
    } catch {
      setCallbackError("retry");
    }
  };

  if (!callbackError) {
    return (
      <PageContainer size="narrow" className="min-h-dvh">
        <LoadingState
          className="min-h-dvh"
          label="카카오 로그인 정보를 확인하고 있습니다."
        />
      </PageContainer>
    );
  }

  const content = callbackErrorContent[callbackError];

  return (
    <PageContainer size="narrow" className="flex min-h-dvh items-center">
      <ErrorState
        headingLevel="h1"
        icon={<CircleAlert className="size-7" />}
        title={content.title}
        description={content.description}
        primaryAction={{
          label:
            content.action === "restart"
              ? "카카오 로그인 다시 시작"
              : "로그인 화면으로",
          onClick:
            content.action === "restart"
              ? handleRestart
              : () => navigate("/login", { replace: true }),
        }}
      />
    </PageContainer>
  );
}
