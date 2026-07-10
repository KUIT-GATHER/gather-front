import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router";

import {
  ALL_SIGNUP_FIELDS,
  SIGNUP_STEP_FIELDS,
  SIGNUP_STEP_ORDER,
  type SignupStep,
  type TermsDocumentType,
} from "@/features/auth/constants/signupFlow.constants";
import { useSignupMutation } from "@/features/auth/hooks/useSignupMutation";
import { applySignupError } from "@/features/auth/lib/applySignupError";
import { toSignupRequest } from "@/features/auth/lib/signup.mapper";
import { normalizeEmail } from "@/features/auth/lib/signupFormatters";
import {
  signupDefaultValues,
  signupSchema,
  type SignupFormValues,
} from "@/features/auth/schemas/signup.schema";

export function useSignupFlow() {
  const navigate = useNavigate();
  const methods = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    shouldUnregister: false,
    defaultValues: signupDefaultValues,
  });
  const signupMutation = useSignupMutation();
  const [step, setStep] = useState<SignupStep>("basic");
  const [detailType, setDetailType] = useState<TermsDocumentType | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState<string | null>(
    null,
  );
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const watchedPhoneNumber = useWatch({
    control: methods.control,
    name: "phoneNumber",
  });
  const watchedEmail = useWatch({
    control: methods.control,
    name: "email",
  });
  const previousPhoneNumberRef = useRef(watchedPhoneNumber);
  const previousEmailRef = useRef(watchedEmail);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, detailType]);

  useEffect(() => {
    if (previousPhoneNumberRef.current === watchedPhoneNumber) {
      return;
    }

    previousPhoneNumberRef.current = watchedPhoneNumber;
    setVerifiedPhoneNumber(null);
  }, [watchedPhoneNumber]);

  useEffect(() => {
    if (previousEmailRef.current === watchedEmail) {
      return;
    }

    previousEmailRef.current = watchedEmail;
    setVerifiedEmail(null);
    methods.setValue("emailVerificationCode", "", { shouldDirty: true });
  }, [methods, watchedEmail]);

  const resetSignupFlow = () => {
    methods.reset(signupDefaultValues);
    setStep("basic");
    setDetailType(null);
    setVerifiedEmail(null);
    setVerifiedPhoneNumber(null);
    setSubmitError(null);
  };

  const handleBack = () => {
    if (detailType) {
      setDetailType(null);
      return;
    }

    const currentIndex = SIGNUP_STEP_ORDER.indexOf(step);
    if (currentIndex <= 0) {
      setShowExitDialog(true);
      return;
    }

    setStep(SIGNUP_STEP_ORDER[currentIndex - 1]);
  };

  const validateStep = async (targetStep: SignupStep) => {
    return methods.trigger([...SIGNUP_STEP_FIELDS[targetStep]], {
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

    setStep("account");
  };

  const goNextFromAccount = async () => {
    const valid = await validateStep("account");
    if (!valid) {
      return;
    }

    if (normalizeEmail(methods.getValues("email")) !== verifiedEmail) {
      methods.setError("email", {
        message: "이메일 인증을 완료해 주세요.",
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

  const submitSignup = async () => {
    setSubmitError(null);
    const valid = await methods.trigger([...ALL_SIGNUP_FIELDS], {
      shouldFocus: true,
    });

    if (!valid) {
      return;
    }

    if (methods.getValues("phoneNumber") !== verifiedPhoneNumber) {
      setStep("basic");
      methods.setError("phoneNumber", {
        message: "전화번호 중복 확인을 완료해 주세요.",
      });
      return;
    }

    if (normalizeEmail(methods.getValues("email")) !== verifiedEmail) {
      setStep("account");
      methods.setError("email", {
        message: "이메일 인증을 완료해 주세요.",
      });
      return;
    }

    signupMutation.mutate(toSignupRequest(methods.getValues()), {
      onSuccess: (data) => {
        resetSignupFlow();
        navigate("/login/email", {
          replace: true,
          state: { email: data.email },
        });
      },
      onError: (error) => {
        applySignupError({
          error,
          methods,
          setStep,
          setVerifiedEmail,
          setVerifiedPhoneNumber,
          setSubmitError,
        });
      },
    });
  };

  const confirmExit = () => {
    resetSignupFlow();
    setShowExitDialog(false);
    navigate("/login");
  };

  return {
    methods,
    step,
    detailType,
    showExitDialog,
    verifiedPhoneNumber,
    verifiedEmail,
    isSignupPending: signupMutation.isPending,
    submitError,
    setDetailType,
    setShowExitDialog,
    setVerifiedPhoneNumber,
    setVerifiedEmail,
    clearSubmitError: () => setSubmitError(null),
    handleBack,
    goNextFromBasic,
    goNextFromAccount,
    goNextFromProfile,
    submitSignup,
    confirmExit,
  };
}
