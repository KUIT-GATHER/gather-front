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
import { applySignupError } from "@/features/auth/lib/applySignupError";
import { toEmailSignupRequest } from "@/features/auth/lib/signup.mapper";
import { normalizeEmail } from "@/features/auth/lib/signupFormatters";
import type { LegalDocumentType } from "@/features/legal";
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
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState<string | null>(
    null,
  );
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const watchedPhoneNumber = useWatch({
    control: methods.control,
    name: "phoneNumber",
  });
  const watchedEmail = useWatch({ control: methods.control, name: "email" });
  const previousPhoneNumberRef = useRef(watchedPhoneNumber);
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
    methods.reset(emailSignupDefaultValues);
    setStep("basic");
    setDetailType(null);
    setVerifiedEmail(null);
    setVerifiedPhoneNumber(null);
    setSubmitError(null);
    setPendingFocusField(null);
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

  const onValidSubmit = (values: EmailSignupFormValues) => {
    if (values.phoneNumber !== verifiedPhoneNumber) {
      moveToFieldError(
        "basic",
        "phoneNumber",
        "전화번호 중복 확인을 완료해 주세요.",
      );
      return;
    }

    if (normalizeEmail(values.email) !== verifiedEmail) {
      moveToFieldError("account", "email", "이메일 인증을 완료해 주세요.");
      return;
    }

    signupMutation.mutate(toEmailSignupRequest(values), {
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

  const onInvalidSubmit = (errors: FieldErrors<EmailSignupFormValues>) => {
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

    if (signupMutation.isPending) {
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
    handleFormSubmit,
    confirmExit,
  };
}
