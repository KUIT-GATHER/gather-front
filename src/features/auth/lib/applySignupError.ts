import type { Dispatch, SetStateAction } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { SignupStep } from "@/features/auth/constants/signupFlow.constants";
import type { SignupFormValues } from "@/features/auth/schemas/signup.schema";
import { ApiError } from "@/shared/api/apiError";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";

type ApplySignupErrorParams = {
  error: unknown;
  methods: UseFormReturn<SignupFormValues>;
  setStep: Dispatch<SetStateAction<SignupStep>>;
  setVerifiedEmail: Dispatch<SetStateAction<string | null>>;
  setVerifiedPhoneNumber: Dispatch<SetStateAction<string | null>>;
  setSubmitError: Dispatch<SetStateAction<string | null>>;
};

export function applySignupError({
  error,
  methods,
  setStep,
  setVerifiedEmail,
  setVerifiedPhoneNumber,
  setSubmitError,
}: ApplySignupErrorParams) {
  const moveToFieldError = (
    step: SignupStep,
    field: keyof SignupFormValues,
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
      setVerifiedEmail(null);
      moveToFieldError("account", "email", "이미 가입된 이메일입니다.");

      return;
    }

    case API_ERROR_CODE.DUPLICATE_PHONE_NUMBER: {
      setVerifiedPhoneNumber(null);
      moveToFieldError("basic", "phoneNumber", "이미 가입된 전화번호입니다.");

      return;
    }

    case API_ERROR_CODE.EMAIL_NOT_VERIFIED: {
      setVerifiedEmail(null);
      moveToFieldError("account", "email", "이메일 인증을 다시 완료해 주세요.");

      return;
    }

    case API_ERROR_CODE.INVALID_VERIFICATION_CODE:
    case API_ERROR_CODE.EXPIRED_VERIFICATION_CODE:
    case API_ERROR_CODE.EMAIL_VERIFICATION_NOT_FOUND: {
      setVerifiedEmail(null);
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
        "interestCategoryIds",
        "관심 카테고리를 1개 이상 선택해 주세요.",
      );

      return;
    }

    case API_ERROR_CODE.CATEGORY_NOT_FOUND: {
      moveToFieldError(
        "profile",
        "interestCategoryIds",
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
