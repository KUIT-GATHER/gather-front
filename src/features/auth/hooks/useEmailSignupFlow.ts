import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState, type FormEventHandler } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { useNavigate } from "react-router";

import {
  EMAIL_SIGNUP_STEP_FIELDS,
  EMAIL_SIGNUP_STEP_ORDER,
  type EmailSignupStep,
  type EmailSignupStepField,
} from "@/features/auth/constants/signupFlow.constants";
import { useSignupMutation } from "@/features/auth/hooks/useSignupMutation";
import { usePhoneVerificationFlow } from "@/features/auth/hooks/usePhoneVerificationFlow";
import { applySignupError } from "@/features/auth/lib/applySignupError";
import { toEmailSignupRequest } from "@/features/auth/lib/signup.mapper";
import { normalizeEmail } from "@/features/auth/lib/signupFormatters";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { uploadProfileImage } from "@/features/profile/lib/profileImageUpload";
import type { LegalDocumentType } from "@/features/legal";
import type { EmailVerificationProof } from "@/features/auth/types/auth.types";
import {
  emailSignupDefaultValues,
  signupEmailSchema,
  type EmailSignupFormValues,
} from "@/features/auth/schemas/emailSignup.schema";

const FOCUSABLE_SIGNUP_FIELDS = new Set<EmailSignupStepField>([
  "name",
  "birthDate",
  "phoneNumber",
  "email",
  "emailVerificationCode",
  "password",
  "passwordConfirm",
  "nickname",
  "introduction",
]);

function findFirstErrorStep(
  errors: FieldErrors<EmailSignupFormValues>,
): EmailSignupStep | null {
  return (
    EMAIL_SIGNUP_STEP_ORDER.find((targetStep) =>
      EMAIL_SIGNUP_STEP_FIELDS[targetStep].some((field) =>
        Boolean(errors[field]),
      ),
    ) ?? null
  );
}

function findFirstErrorField(
  errors: FieldErrors<EmailSignupFormValues>,
  targetStep: EmailSignupStep,
) {
  return EMAIL_SIGNUP_STEP_FIELDS[targetStep].find((field) =>
    Boolean(errors[field]),
  );
}

function getFocusableSignupField(field: EmailSignupStepField | undefined) {
  return field && FOCUSABLE_SIGNUP_FIELDS.has(field) ? field : null;
}

export function useEmailSignupFlow() {
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const methods = useForm<EmailSignupFormValues>({
    resolver: zodResolver(signupEmailSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldUnregister: false,
    defaultValues: emailSignupDefaultValues,
  });

  const signupMutation = useSignupMutation();
  const [step, setStep] = useState<EmailSignupStep>("basic");
  const [detailType, setDetailType] = useState<LegalDocumentType | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isCompletingSignup, setIsCompletingSignup] = useState(false);
  const [emailVerificationProof, setEmailVerificationProof] =
    useState<EmailVerificationProof | null>(null);
  const watchedPhoneNumber = useWatch({
    control: methods.control,
    name: "phoneNumber",
  });
  const watchedEmail = useWatch({ control: methods.control, name: "email" });
  const previousEmailRef = useRef(watchedEmail);
  const [pendingFocusField, setPendingFocusField] =
    useState<EmailSignupStepField | null>(null);

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

  const phoneVerification = usePhoneVerificationFlow({
    phoneNumber: watchedPhoneNumber,
    purpose: "SIGNUP",
    onError: (message) => methods.setError("phoneNumber", { message }),
    onClearError: () => methods.clearErrors("phoneNumber"),
  });

  useEffect(() => {
    if (previousEmailRef.current === watchedEmail) {
      return;
    }

    previousEmailRef.current = watchedEmail;
    setEmailVerificationProof(null);
    methods.setValue("emailVerificationCode", "", { shouldDirty: true });
  }, [methods, watchedEmail]);

  const resetSignupFlow = () => {
    methods.reset(emailSignupDefaultValues);
    setStep("basic");
    setDetailType(null);
    setEmailVerificationProof(null);
    phoneVerification.reset();
    setSubmitError(null);
    setPendingFocusField(null);
    setProfileImageFile(null);
  };

  const moveToFieldError = (
    targetStep: EmailSignupStep,
    field: EmailSignupStepField,
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

    const currentIndex = EMAIL_SIGNUP_STEP_ORDER.indexOf(step);
    if (currentIndex <= 0) {
      setShowExitDialog(true);
      return;
    }

    setStep(EMAIL_SIGNUP_STEP_ORDER[currentIndex - 1]);
  };

  const validateStep = async (targetStep: EmailSignupStep) => {
    return methods.trigger([...EMAIL_SIGNUP_STEP_FIELDS[targetStep]], {
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

    setStep("account");
  };

  const goNextFromAccount = async () => {
    const valid = await validateStep("account");
    if (!valid) {
      return;
    }

    if (
      !emailVerificationProof ||
      normalizeEmail(methods.getValues("email")) !==
        emailVerificationProof.email
    ) {
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

  const onValidSubmit = async (values: EmailSignupFormValues) => {
    if (
      values.phoneNumber !== phoneVerification.verifiedPhoneNumber ||
      !phoneVerification.phoneVerificationId
    ) {
      setIsCompletingSignup(false);
      moveToFieldError("basic", "phoneNumber", "휴대폰 인증을 완료해 주세요.");
      return;
    }

    if (
      !emailVerificationProof ||
      normalizeEmail(values.email) !== emailVerificationProof.email
    ) {
      setIsCompletingSignup(false);
      moveToFieldError("account", "email", "이메일 인증을 완료해 주세요.");
      return;
    }

    try {
      const signupResult = await signupMutation.mutateAsync(
        toEmailSignupRequest(
          values,
          phoneVerification.phoneVerificationId,
          emailVerificationProof.emailVerificationId,
        ),
      );

      setAccessToken(signupResult.accessToken);

      if (profileImageFile) {
        try {
          await uploadProfileImage(profileImageFile);
        } catch {
          // 회원가입은 이미 완료되었으므로 이미지 실패가 인증 상태를 되돌리지 않게 한다.
          setAccessToken(signupResult.accessToken);
        }
      }

      resetSignupFlow();
      navigate("/home", { replace: true });
    } catch (error) {
      applySignupError({
        error,
        methods,
        setStep,
        setEmailVerificationProof,
        resetPhoneVerification: phoneVerification.reset,
        setSubmitError,
      });
    } finally {
      setIsCompletingSignup(false);
    }
  };

  const onInvalidSubmit = (errors: FieldErrors<EmailSignupFormValues>) => {
    setIsCompletingSignup(false);
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

    if (signupMutation.isPending || isCompletingSignup) {
      return;
    }

    switch (step) {
      case "basic":
        void goNextFromBasic();
        return;
      case "account":
        void goNextFromAccount();
        return;
      case "profile":
        void goNextFromProfile();
        return;
      case "terms":
        setSubmitError(null);
        setIsCompletingSignup(true);
        void submitSignup();
    }
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
    phoneVerification,
    setVerifiedPhoneNumber: phoneVerification.setVerifiedPhoneNumber,
    setPhoneVerificationId: phoneVerification.setPhoneVerificationId,
    emailVerificationProof,
    profileImageFile,
    isSignupPending: signupMutation.isPending || isCompletingSignup,
    submitError,
    setDetailType,
    setShowExitDialog,
    setEmailVerificationProof,
    setProfileImageFile,
    clearSubmitError: () => setSubmitError(null),
    handleBack,
    handleFormSubmit,
    confirmExit,
  };
}
