import { useEffect } from "react";
import { FormProvider } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";

import { useKakaoSignupFlow } from "@/features/auth/hooks/useKakaoSignupFlow";
import { useKakaoSignupStore } from "@/features/auth/store/kakaoSignup.store";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import LoadingState from "@/shared/ui/LoadingState";

import { SignupShell } from "./SignupShell";
import { SignupTermsDetail } from "./SignupTermsDetail";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { ProfileStep } from "./steps/ProfileStep";
import { TermsStep } from "./steps/TermsStep";

function getReturnPath(value: unknown) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : null;
}

export function KakaoSignupFlow() {
  const navigate = useNavigate();
  const signupToken = useKakaoSignupStore((state) => state.signupToken);
  const initialNickname = useKakaoSignupStore((state) => state.initialNickname);

  useEffect(() => {
    if (signupToken) {
      return;
    }

    navigate("/login", {
      replace: true,
      state: {
        kakaoSignupNotice:
          "카카오 회원가입을 계속하려면 카카오 로그인부터 다시 진행해 주세요.",
      },
    });
  }, [navigate, signupToken]);

  if (!signupToken) {
    return (
      <LoadingState
        className="min-h-dvh"
        label="카카오 로그인 화면으로 이동하고 있습니다."
      />
    );
  }

  return (
    <KakaoSignupFlowContent
      signupToken={signupToken}
      initialNickname={initialNickname}
    />
  );
}

function KakaoSignupFlowContent({
  signupToken,
  initialNickname,
}: {
  signupToken: string;
  initialNickname: string | null;
}) {
  const location = useLocation();
  const {
    methods,
    step,
    detailType,
    showExitDialog,
    showDuplicatePhoneDialog,
    verifiedPhoneNumber,
    isSignupPending,
    submitError,
    setDetailType,
    setShowExitDialog,
    setShowDuplicatePhoneDialog,
    setVerifiedPhoneNumber,
    clearSubmitError,
    handleBack,
    handleFormSubmit,
    confirmExit,
    chooseEmailLogin,
  } = useKakaoSignupFlow({
    signupToken,
    initialNickname,
    returnPath: getReturnPath(
      (location.state as { from?: unknown } | null)?.from,
    ),
  });

  if (detailType) {
    return <SignupTermsDetail type={detailType} onBack={handleBack} />;
  }

  return (
    <>
      <FormProvider {...methods}>
        <form noValidate onSubmit={handleFormSubmit}>
          <SignupShell step={step} flow="kakao" onBack={handleBack}>
            {step === "basic" ? (
              <BasicInfoStep
                verifiedPhoneNumber={verifiedPhoneNumber}
                onVerifiedPhoneNumberChange={setVerifiedPhoneNumber}
              />
            ) : null}

            {step === "profile" ? <ProfileStep /> : null}

            {step === "terms" ? (
              <TermsStep
                isPending={isSignupPending}
                submitError={submitError}
                onClearSubmitError={clearSubmitError}
                onOpenDetail={setDetailType}
              />
            ) : null}
          </SignupShell>
        </form>
      </FormProvider>

      <ConfirmDialog
        open={showExitDialog}
        title="가입을 취소할까요?"
        description="작성 중인 정보와 카카오 가입 정보가 사라집니다."
        cancelText="계속 작성"
        confirmText="가입 취소"
        confirmVariant="danger"
        onCancel={() => setShowExitDialog(false)}
        onConfirm={confirmExit}
      />

      <ConfirmDialog
        open={showDuplicatePhoneDialog}
        title="이미 가입된 전화번호입니다."
        description="기존 이메일 계정으로 로그인하거나 다른 전화번호를 입력해 주세요."
        cancelText="다른 번호 입력"
        confirmText="이메일 로그인"
        onCancel={() => setShowDuplicatePhoneDialog(false)}
        onConfirm={chooseEmailLogin}
      />
    </>
  );
}
