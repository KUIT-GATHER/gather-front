import type { Dispatch, SetStateAction } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { EmailSignupStep } from "@/features/auth/constants/signupFlow.constants";
import type { EmailSignupFormValues } from "@/features/auth/schemas/emailSignup.schema";
import type { EmailVerificationProof } from "@/features/auth/types/auth.types";
import { ApiError } from "@/shared/api/apiError";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";

type ApplySignupErrorParams = {
  error: unknown;
  methods: UseFormReturn<EmailSignupFormValues>;
  setStep: Dispatch<SetStateAction<EmailSignupStep>>;
  setEmailVerificationProof: Dispatch<
    SetStateAction<EmailVerificationProof | null>
  >;
  setVerifiedPhoneNumber: Dispatch<SetStateAction<string | null>>;
  setPhoneVerificationId: Dispatch<SetStateAction<string | null>>;
  setSubmitError: Dispatch<SetStateAction<string | null>>;
};

export function applySignupError({
  error,
  methods,
  setStep,
  setEmailVerificationProof,
  setVerifiedPhoneNumber,
  setPhoneVerificationId,
  setSubmitError,
}: ApplySignupErrorParams) {
  const moveToFieldError = (
    step: EmailSignupStep,
    field: keyof EmailSignupFormValues,
    message: string,
  ) => {
    setSubmitError(null);
    setStep(step);
    methods.setError(field, { message });
  };

  if (!(error instanceof ApiError)) {
    setSubmitError(
      "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    );
    return;
  }

  switch (error.code) {
    case API_ERROR_CODE.DUPLICATE_EMAIL: {
      setEmailVerificationProof(null);
      moveToFieldError("account", "email", "이미 가입된 이메일입니다.");

      return;
    }

    case API_ERROR_CODE.DUPLICATE_PHONE_NUMBER: {
      setVerifiedPhoneNumber(null);
      setPhoneVerificationId(null);
      moveToFieldError("basic", "phoneNumber", "이미 가입된 전화번호입니다.");

      return;
    }

    case API_ERROR_CODE.ACCOUNT_REJOIN_BLOCKED:
    case API_ERROR_CODE.WITHDRAWN_ACCOUNT_COOLDOWN: {
      setVerifiedPhoneNumber(null);
      setPhoneVerificationId(null);
      moveToFieldError(
        "basic",
        "phoneNumber",
        "탈퇴 후 7일간 재가입할 수 없습니다.",
      );

      return;
    }

    case API_ERROR_CODE.PHONE_VERIFICATION_REQUIRED:
    case API_ERROR_CODE.PHONE_VERIFICATION_EXPIRED:
    case API_ERROR_CODE.PHONE_VERIFICATION_NOT_FOUND: {
      setVerifiedPhoneNumber(null);
      setPhoneVerificationId(null);
      moveToFieldError(
        "basic",
        "phoneNumber",
        "휴대폰 인증을 다시 완료해 주세요.",
      );

      return;
    }

    case API_ERROR_CODE.EMAIL_NOT_VERIFIED:
    case API_ERROR_CODE.EMAIL_VERIFICATION_REQUIRED: {
      setEmailVerificationProof(null);
      methods.setValue("emailVerificationCode", "", { shouldDirty: true });
      moveToFieldError("account", "email", "이메일 인증을 다시 완료해 주세요.");

      return;
    }

    case API_ERROR_CODE.INVALID_VERIFICATION_CODE:
    case API_ERROR_CODE.EXPIRED_VERIFICATION_CODE:
    case API_ERROR_CODE.EMAIL_VERIFICATION_NOT_FOUND: {
      setEmailVerificationProof(null);
      moveToFieldError(
        "account",
        "emailVerificationCode",
        "이메일 인증 상태를 다시 확인해 주세요.",
      );

      return;
    }

    case API_ERROR_CODE.PASSWORD_MISMATCH: {
      moveToFieldError(
        "account",
        "passwordConfirm",
        "비밀번호가 일치하지 않습니다.",
      );

      return;
    }

    case API_ERROR_CODE.DUPLICATE_NICKNAME: {
      moveToFieldError("profile", "nickname", "이미 사용 중인 닉네임입니다.");

      return;
    }

    case API_ERROR_CODE.INVALID_ACTIVITY_REGION:
    case API_ERROR_CODE.REGION_NOT_FOUND: {
      moveToFieldError(
        "profile",
        "activityRegionId",
        "활동 지역을 다시 선택해 주세요.",
      );

      return;
    }

    case API_ERROR_CODE.INVALID_INTEREST_CATEGORY_COUNT: {
      moveToFieldError(
        "profile",
        "interestCategories",
        "관심 카테고리를 1개 이상 선택해 주세요.",
      );

      return;
    }

    case API_ERROR_CODE.CATEGORY_NOT_FOUND: {
      moveToFieldError(
        "profile",
        "interestCategories",
        "관심 카테고리를 다시 선택해 주세요.",
      );

      return;
    }

    case API_ERROR_CODE.REQUIRED_TERMS_NOT_AGREED: {
      setStep("terms");
      setSubmitError("필수 약관 동의 상태를 다시 확인해 주세요.");

      return;
    }

    case API_ERROR_CODE.VALIDATION_ERROR: {
      setSubmitError(
        error.message ||
          "입력값이 올바르지 않습니다. 이전 단계의 입력 내용을 다시 확인해 주세요.",
      );

      return;
    }

    default: {
      setSubmitError(
        error.message ||
          "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    }
  }
}
