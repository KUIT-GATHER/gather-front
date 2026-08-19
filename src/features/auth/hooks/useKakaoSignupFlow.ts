import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type FormEventHandler } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { useNavigate } from "react-router";

import {
  KAKAO_SIGNUP_STEP_FIELDS,
  KAKAO_SIGNUP_STEP_ORDER,
  type KakaoSignupStep,
  type KakaoSignupStepField,
} from "@/features/auth/constants/signupFlow.constants";
import { useKakaoSignupMutation } from "@/features/auth/hooks/useKakaoSignupMutation";
import { usePhoneVerificationFlow } from "@/features/auth/hooks/usePhoneVerificationFlow";
import { applyKakaoSignupError } from "@/features/auth/lib/applyKakaoSignupError";
import { toKakaoSignupRequest } from "@/features/auth/lib/signup.mapper";
import type { LegalDocumentType } from "@/features/legal";
import {
  createKakaoSignupDefaultValues,
  kakaoSignupSchema,
  type KakaoSignupFormValues,
} from "@/features/auth/schemas/kakaoSignup.schema";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useKakaoSignupStore } from "@/features/auth/store/kakaoSignup.store";
import { uploadProfileImage } from "@/features/profile/lib/profileImageUpload";

const FOCUSABLE_SIGNUP_FIELDS = new Set<KakaoSignupStepField>([
  "name",
  "birthDate",
  "phoneNumber",
  "nickname",
  "introduction",
]);

type UseKakaoSignupFlowParams = {
  signupToken: string;
  initialNickname: string | null;
  returnPath: string | null;
};

function findFirstErrorStep(
  errors: FieldErrors<KakaoSignupFormValues>,
): KakaoSignupStep | null {
  return (
    KAKAO_SIGNUP_STEP_ORDER.find((targetStep) =>
      KAKAO_SIGNUP_STEP_FIELDS[targetStep].some((field) =>
        Boolean(errors[field]),
      ),
    ) ?? null
  );
}

function findFirstErrorField(
  errors: FieldErrors<KakaoSignupFormValues>,
  targetStep: KakaoSignupStep,
) {
  return KAKAO_SIGNUP_STEP_FIELDS[targetStep].find((field) =>
    Boolean(errors[field]),
  );
}

function getFocusableSignupField(field: KakaoSignupStepField | undefined) {
  return field && FOCUSABLE_SIGNUP_FIELDS.has(field) ? field : null;
}

export function useKakaoSignupFlow({
  signupToken,
  initialNickname,
  returnPath,
}: UseKakaoSignupFlowParams) {
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const clearKakaoSignupSession = useKakaoSignupStore(
    (state) => state.clearKakaoSignupSession,
  );
  const defaultValues = createKakaoSignupDefaultValues(initialNickname);
  const methods = useForm<KakaoSignupFormValues>({
    resolver: zodResolver(kakaoSignupSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldUnregister: false,
    defaultValues,
  });
  const signupMutation = useKakaoSignupMutation();
  const [step, setStep] = useState<KakaoSignupStep>("basic");
  const [detailType, setDetailType] = useState<LegalDocumentType | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showDuplicatePhoneDialog, setShowDuplicatePhoneDialog] =
    useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitLocked, setIsSubmitLocked] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const watchedPhoneNumber = useWatch({
    control: methods.control,
    name: "phoneNumber",
  });
  const phoneVerification = usePhoneVerificationFlow({
    phoneNumber: watchedPhoneNumber,
    purpose: "SIGNUP",
    onError: (message) => methods.setError("phoneNumber", { message }),
    onClearError: () => methods.clearErrors("phoneNumber"),
    onDuplicatePhoneNumber: () => setShowDuplicatePhoneDialog(true),
  });
  const [pendingFocusField, setPendingFocusField] =
    useState<KakaoSignupStepField | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, detailType]);

  useEffect(() => {
    if (!pendingFocusField) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      methods.setFocus(pendingFocusField);
      setPendingFocusField(null);
    });

    return () => window.clearTimeout(timeoutId);
  }, [methods, pendingFocusField, step]);

  const resetSignupFlow = () => {
    methods.reset(defaultValues);
    setStep("basic");
    setDetailType(null);
    phoneVerification.reset();
    setSubmitError(null);
    setPendingFocusField(null);
    setShowDuplicatePhoneDialog(false);
    setProfileImageFile(null);
  };

  const clearKakaoSignup = () => {
    resetSignupFlow();
    clearKakaoSignupSession();
  };

  const moveToFieldError = (
    targetStep: KakaoSignupStep,
    field: KakaoSignupStepField,
    message: string,
  ) => {
    setSubmitError(null);
    methods.setError(field, { message });
    setPendingFocusField(getFocusableSignupField(field));
    setStep(targetStep);
  };

  const handleBack = () => {
    if (detailType) {
      setDetailType(null);
      return;
    }

    const currentIndex = KAKAO_SIGNUP_STEP_ORDER.indexOf(step);
    if (currentIndex <= 0) {
      setShowExitDialog(true);
      return;
    }

    setStep(KAKAO_SIGNUP_STEP_ORDER[currentIndex - 1]);
  };

  const validateStep = async (targetStep: KakaoSignupStep) => {
    return methods.trigger([...KAKAO_SIGNUP_STEP_FIELDS[targetStep]], {
      shouldFocus: true,
    });
  };

  const goNextFromBasic = async () => {
    const valid = await validateStep("basic");
    if (!valid) {
      return;
    }

    if (
      methods.getValues("phoneNumber") !==
        phoneVerification.verifiedPhoneNumber ||
      !phoneVerification.phoneVerificationId
    ) {
      methods.setError("phoneNumber", {
        message: "휴대폰 인증을 완료해 주세요.",
      });
      return;
    }

    setStep("profile");
  };

  const goNextFromProfile = async () => {
    const valid = await validateStep("profile");
    if (valid) {
      setStep("terms");
    }
  };

  const onValidSubmit = async (values: KakaoSignupFormValues) => {
    if (
      values.phoneNumber !== phoneVerification.verifiedPhoneNumber ||
      !phoneVerification.phoneVerificationId
    ) {
      setIsSubmitLocked(false);
      moveToFieldError("basic", "phoneNumber", "휴대폰 인증을 완료해 주세요.");
      return;
    }

    try {
      const tokens = await signupMutation.mutateAsync({
        payload: toKakaoSignupRequest(
          values,
          phoneVerification.phoneVerificationId,
        ),
        signupToken,
      });

      setAccessToken(tokens.accessToken);

      if (profileImageFile) {
        try {
          await uploadProfileImage(profileImageFile);
        } catch {
          // 가입 완료 후 선택 기능이므로 이미지 실패만 무시하고 인증은 유지한다.
          setAccessToken(tokens.accessToken);
        }
      }

      clearKakaoSignup();
      navigate(returnPath ?? "/home", { replace: true });
    } catch (error) {
      const action = applyKakaoSignupError({
        error,
        methods,
        setStep,
        resetPhoneVerification: phoneVerification.reset,
        setSubmitError,
        onDuplicatePhoneNumber: () => setShowDuplicatePhoneDialog(true),
      });

      if (action === "restart") {
        clearKakaoSignup();
        navigate("/login", {
          replace: true,
          state: {
            kakaoSignupNotice:
              "카카오 가입 정보가 만료되었거나 이미 사용되었습니다. 카카오 로그인부터 다시 진행해 주세요.",
          },
        });
      }
    } finally {
      setIsSubmitLocked(false);
    }
  };

  const onInvalidSubmit = (errors: FieldErrors<KakaoSignupFormValues>) => {
    setIsSubmitLocked(false);
    const errorStep = findFirstErrorStep(errors);

    if (!errorStep) {
      return;
    }

    setPendingFocusField(
      getFocusableSignupField(findFirstErrorField(errors, errorStep)),
    );
    setStep(errorStep);
  };

  const submitSignup = methods.handleSubmit(onValidSubmit, onInvalidSubmit);

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (signupMutation.isPending || isSubmitLocked) {
      return;
    }

    switch (step) {
      case "basic":
        void goNextFromBasic();
        return;
      case "profile":
        void goNextFromProfile();
        return;
      case "terms":
        setSubmitError(null);
        setIsSubmitLocked(true);
        void submitSignup();
    }
  };

  const confirmExit = () => {
    clearKakaoSignup();
    setShowExitDialog(false);
    navigate("/login", { replace: true });
  };

  const chooseEmailLogin = () => {
    clearKakaoSignup();
    navigate("/login/email", { replace: true });
  };

  return {
    methods,
    step,
    detailType,
    showExitDialog,
    showDuplicatePhoneDialog,
    phoneVerification,
    setVerifiedPhoneNumber: phoneVerification.setVerifiedPhoneNumber,
    setPhoneVerificationId: phoneVerification.setPhoneVerificationId,
    profileImageFile,
    isSignupPending: signupMutation.isPending || isSubmitLocked,
    submitError,
    setDetailType,
    setShowExitDialog,
    setShowDuplicatePhoneDialog,
    setProfileImageFile,
    clearSubmitError: () => setSubmitError(null),
    handleBack,
    handleFormSubmit,
    confirmExit,
    chooseEmailLogin,
  };
}
