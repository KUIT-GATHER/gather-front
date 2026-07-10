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
  if (!(error instanceof ApiError)) {
    setSubmitError(
      "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    );
    return;
  }

  switch (error.code) {
    case API_ERROR_CODE.DUPLICATE_EMAIL: {
      setStep("account");
      setVerifiedEmail(null);

      methods.setError("email", {
        message: "이미 가입된 이메일입니다.",
      });

      return;
    }

    case API_ERROR_CODE.DUPLICATE_PHONE_NUMBER: {
      setStep("basic");
      setVerifiedPhoneNumber(null);

      methods.setError("phoneNumber", {
        message: "이미 가입된 전화번호입니다.",
      });

      return;
    }

    case API_ERROR_CODE.INVALID_VERIFICATION_CODE:
    case API_ERROR_CODE.EXPIRED_VERIFICATION_CODE:
    case API_ERROR_CODE.EMAIL_VERIFICATION_NOT_FOUND: {
      setStep("account");
      setVerifiedEmail(null);

      methods.setError("emailVerificationCode", {
        message: "이메일 인증 상태를 다시 확인해 주세요.",
      });

      return;
    }

    default: {
      setSubmitError(
        error.message ||
          "회원가입 중 오류가 발생했습니다. 입력 내용을 확인해 주세요.",
      );
    }
  }
}