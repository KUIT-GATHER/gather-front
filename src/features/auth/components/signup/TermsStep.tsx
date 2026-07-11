import { useFormContext, useWatch } from "react-hook-form";

import type { TermsDocumentType } from "@/features/auth/constants/signupFlow.constants";
import type { SignupFormValues } from "@/features/auth/schemas/signup.schema";
import { cn } from "@/shared/lib/cn";

import { SignupRootError, SignupStepButton } from "./SignupFormParts";

type TermsStepProps = {
  isPending: boolean;
  submitError: string | null;
  onClearSubmitError: () => void;
  onOpenDetail: (type: TermsDocumentType) => void;
};

export function TermsStep({
  isPending,
  submitError,
  onClearSubmitError,
  onOpenDetail,
}: TermsStepProps) {
  const {
    control,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  const serviceTermsAgreed = useWatch({
    control,
    name: "serviceTermsAgreed",
  });
  const privacyPolicyAgreed = useWatch({
    control,
    name: "privacyPolicyAgreed",
  });
  const marketingAgreed = useWatch({
    control,
    name: "marketingAgreed",
  });
  const allAgreed =
    serviceTermsAgreed && privacyPolicyAgreed && marketingAgreed;

  const setAgreement = (
    name:
      | "serviceTermsAgreed"
      | "privacyPolicyAgreed"
      | "marketingAgreed",
    checked: boolean,
  ) => {
    setValue(name, checked, {
      shouldDirty: true,
      shouldValidate: true,
    });
    clearErrors(name);
    onClearSubmitError();
  };

  const setAll = (checked: boolean) => {
    setValue("serviceTermsAgreed", checked, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("privacyPolicyAgreed", checked, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("marketingAgreed", checked, {
      shouldDirty: true,
      shouldValidate: true,
    });
    clearErrors(["serviceTermsAgreed", "privacyPolicyAgreed"]);
    onClearSubmitError();
  };

  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-xl font-semibold leading-7 text-text">
        Gather 이용을 시작해 볼까요? 🌿
      </h2>

      <div className="mt-12">
        <AgreementRow
          checked={allAgreed}
          label="전체 동의하기"
          strong
          onChange={setAll}
        />
      </div>

      <div className="mt-5 space-y-4 border-t border-stroke pt-5">
        <AgreementRow
          checked={serviceTermsAgreed}
          label="[필수] 서비스 이용약관 동의"
          onChange={(checked) =>
            setAgreement("serviceTermsAgreed", checked)
          }
          onView={() => onOpenDetail("service")}
        />
        <AgreementRow
          checked={privacyPolicyAgreed}
          label="[필수] 개인정보 수집 및 이용 동의"
          onChange={(checked) =>
            setAgreement("privacyPolicyAgreed", checked)
          }
          onView={() => onOpenDetail("privacy")}
        />
        <AgreementRow
          checked={marketingAgreed}
          label="[선택] 맞춤형 봉사 / 이벤트 알림 수신 동의"
          muted={!marketingAgreed}
          onChange={(checked) => setAgreement("marketingAgreed", checked)}
          onView={() => onOpenDetail("marketing")}
        />
      </div>

      <SignupRootError
        message={
          submitError ??
          errors.serviceTermsAgreed?.message ??
          errors.privacyPolicyAgreed?.message
        }
      />

      <div className="mt-auto" />

      <SignupStepButton
        disabled={!serviceTermsAgreed || !privacyPolicyAgreed}
        isPending={isPending}
      >
        {isPending ? "가입 중" : "완료"}
      </SignupStepButton>
    </div>
  );
}

type AgreementRowProps = {
  checked: boolean;
  label: string;
  strong?: boolean;
  muted?: boolean;
  onChange: (checked: boolean) => void;
  onView?: () => void;
};

function AgreementRow({
  checked,
  label,
  strong,
  muted,
  onChange,
  onView,
}: AgreementRowProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full transition",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
          checked ? "bg-button" : "bg-stroke",
        )}
        onClick={() => onChange(!checked)}
      >
        <span className="size-2 rounded-full bg-white" />
      </button>
      <button
        type="button"
        className={cn(
          "min-w-0 flex-1 text-left text-[15px] leading-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
          strong
            ? "font-semibold text-text"
            : "font-semibold text-text-gray-300",
          muted && "text-text-gray-100",
        )}
        onClick={() => onChange(!checked)}
      >
        {label}
      </button>
      {onView ? (
        <button
          type="button"
          className="shrink-0 text-[15px] font-medium text-text-gray-100 underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
          onClick={onView}
        >
          보기
        </button>
      ) : null}
    </div>
  );
}
