import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState, type FormEventHandler } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { useNavigate } from "react-router";

import {
  KAKAO_SIGNUP_STEP_FIELDS,
  KAKAO_SIGNUP_STEP_ORDER,
  type KakaoSignupStep,
  type KakaoSignupStepField,
} from "@/features/auth/constants/signupFlow.constants";
import { useKakaoSignupMutation } from "@/features/auth/hooks/useKakaoSignupMutation";
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
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState<string | null>(
    null,
  );
  const watchedPhoneNumber = useWatch({
    control: methods.control,
    name: "phoneNumber",
  });
  const previousPhoneNumberRef = useRef(watchedPhoneNumber);
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

  useEffect(() => {
    if (previousPhoneNumberRef.current === watchedPhoneNumber) {
      return;
    }

    previousPhoneNumberRef.current = watchedPhoneNumber;
    setVerifiedPhoneNumber(null);
  }, [watchedPhoneNumber]);

  const resetSignupFlow = () => {
    methods.reset(defaultValues);
    setStep("basic");
    setDetailType(null);
    setVerifiedPhoneNumber(null);
    setSubmitError(null);
    setPendingFocusField(null);
    setShowDuplicatePhoneDialog(false);
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

    if (methods.getValues("phoneNumber") !== verifiedPhoneNumber) {
      methods.setError("phoneNumber", {
        message: "전화번호 중복 확인을 완료해 주세요.",
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

  const onValidSubmit = (values: KakaoSignupFormValues) => {
    if (values.phoneNumber !== verifiedPhoneNumber) {
      moveToFieldError(
        "basic",
        "phoneNumber",
        "전화번호 중복 확인을 완료해 주세요.",
      );
      return;
    }

    signupMutation.mutate(
      { payload: toKakaoSignupRequest(values), signupToken },
      {
        onSuccess: (tokens) => {
          setAccessToken(tokens.accessToken);
          clearKakaoSignup();
          navigate(returnPath ?? "/home", { replace: true });
        },
        onError: (error) => {
          const action = applyKakaoSignupError({
            error,
            methods,
            setStep,
            setVerifiedPhoneNumber,
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
        },
        onSettled: () => {
          setIsSubmitLocked(false);
        },
      },
    );
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
    verifiedPhoneNumber,
    isSignupPending: signupMutation.isPending || isSubmitLocked,
    submitError,
    setDetailType,
    setShowExitDialog,
    setShowDuplicatePhoneDialog,
    setVerifiedPhoneNumber,
    clearSubmitError: () => setSubmitError(null),
    handleBack,
    handleFormSubmit,
    confirmExit,
    chooseEmailLogin,
  };
}
