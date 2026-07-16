import { FormProvider } from "react-hook-form";

import { useSignupFlow } from "@/features/auth/hooks/useSignupFlow";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";

import { SignupShell } from "./SignupShell";
import { SignupTermsDetail } from "./SignupTermsDetail";
import { AccountInfoStep } from "./steps/AccountInfoStep";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { ProfileStep } from "./steps/ProfileStep";
import { TermsStep } from "./steps/TermsStep";

export function SignupFlow() {
  const {
    methods,
    step,
    detailType,
    showExitDialog,
    verifiedPhoneNumber,
    verifiedEmail,
    isSignupPending,
    submitError,
    setDetailType,
    setShowExitDialog,
    setVerifiedPhoneNumber,
    setVerifiedEmail,
    clearSubmitError,
    handleBack,
    handleFormSubmit,
    confirmExit,
  } = useSignupFlow();

  if (detailType) {
    return <SignupTermsDetail type={detailType} onBack={handleBack} />;
  }

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={handleFormSubmit}>
        <SignupShell step={step} onBack={handleBack}>
          {step === "basic" ? (
            <BasicInfoStep
              verifiedPhoneNumber={verifiedPhoneNumber}
              onVerifiedPhoneNumberChange={setVerifiedPhoneNumber}
            />
          ) : null}

          {step === "account" ? (
            <AccountInfoStep
              verifiedEmail={verifiedEmail}
              onVerifiedEmailChange={setVerifiedEmail}
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

      <ConfirmDialog
        open={showExitDialog}
        title="뒤로 가면 작성 중인 내용이 사라집니다."
        cancelText="취소"
        confirmText="확인"
        onCancel={() => setShowExitDialog(false)}
        onConfirm={confirmExit}
      />
    </FormProvider>
  );
}
