import type { Dispatch, SetStateAction } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { KakaoSignupStep } from "@/features/auth/constants/signupFlow.constants";
import type { KakaoSignupFormValues } from "@/features/auth/schemas/kakaoSignup.schema";
import { ApiError } from "@/shared/api/apiError";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";

type ApplyKakaoSignupErrorParams = {
  error: unknown;
  methods: UseFormReturn<KakaoSignupFormValues>;
  setStep: Dispatch<SetStateAction<KakaoSignupStep>>;
  setVerifiedPhoneNumber: Dispatch<SetStateAction<string | null>>;
  setSubmitError: Dispatch<SetStateAction<string | null>>;
  onDuplicatePhoneNumber: () => void;
};

export function applyKakaoSignupError({
  error,
  methods,
  setStep,
  setVerifiedPhoneNumber,
  setSubmitError,
  onDuplicatePhoneNumber,
}: ApplyKakaoSignupErrorParams) {
  const moveToFieldError = (
    step: KakaoSignupStep,
    field: keyof KakaoSignupFormValues,
    message: string,
  ) => {
    setSubmitError(null);
    setStep(step);
    methods.setError(field, { message });
  };

  if (!(error instanceof ApiError)) {
    setSubmitError(
      "회원가입을 완료하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.",
    );
    return "keep" as const;
  }

  switch (error.code) {
    case API_ERROR_CODE.SIGNUP_TOKEN_EXPIRED:
    case API_ERROR_CODE.SIGNUP_TOKEN_INVALID:
    case API_ERROR_CODE.ALREADY_REGISTERED:
      return "restart" as const;

    case API_ERROR_CODE.DUPLICATE_PHONE_NUMBER:
      setVerifiedPhoneNumber(null);
      moveToFieldError("basic", "phoneNumber", "이미 가입된 전화번호입니다.");
      onDuplicatePhoneNumber();
      return "keep" as const;

    case API_ERROR_CODE.DUPLICATE_NICKNAME:
      moveToFieldError("profile", "nickname", "이미 사용 중인 닉네임입니다.");
      return "keep" as const;

    case API_ERROR_CODE.INVALID_ACTIVITY_REGION:
    case API_ERROR_CODE.REGION_NOT_FOUND:
      moveToFieldError(
        "profile",
        "activityRegionId",
        "활동 지역을 다시 선택해 주세요.",
      );
      return "keep" as const;

    case API_ERROR_CODE.INVALID_INTEREST_CATEGORY_COUNT:
    case API_ERROR_CODE.CATEGORY_NOT_FOUND:
      moveToFieldError(
        "profile",
        "interestCategories",
        "관심 카테고리를 다시 선택해 주세요.",
      );
      return "keep" as const;

    case API_ERROR_CODE.REQUIRED_TERMS_NOT_AGREED:
      setStep("terms");
      setSubmitError("필수 약관 동의 상태를 다시 확인해 주세요.");
      return "keep" as const;

    case API_ERROR_CODE.VALIDATION_ERROR:
      setSubmitError("입력한 정보를 다시 확인해 주세요.");
      return "keep" as const;

    default:
      setSubmitError(
        "회원가입을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
      return "keep" as const;
  }
}
