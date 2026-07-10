import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Eye, EyeOff, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { useNavigate } from "react-router";

import { getSignupCategoryIcon } from "@/features/auth/constants/signupCategoryIcons";
import {
  useConfirmEmailVerificationMutation,
  useSendEmailVerificationMutation,
} from "@/features/auth/hooks/useEmailVerificationMutation";
import { usePhoneAvailabilityMutation } from "@/features/auth/hooks/usePhoneAvailabilityMutation";
import { useSignupOptionsQuery } from "@/features/auth/hooks/useSignupOptionsQuery";
import { useSignupMutation } from "@/features/auth/hooks/useSignupMutation";
import { toSignupRequest } from "@/features/auth/lib/signup.mapper";
import {
  formatBirthDateInput,
  isRealPastOrTodayBirthDate,
  formatPhoneNumber,
  normalizeBirthDate,
  normalizeEmail,
  normalizePhoneNumber,
} from "@/features/auth/lib/signupFormatters";
import {
  accountInfoFields,
  basicInfoFields,
  profileFields,
  signupDefaultValues,
  signupSchema,
  termsFields,
  type SignupFormValues,
} from "@/features/auth/schemas/signup.schema";
import type {
  SignupCategory,
  SignupRegion,
} from "@/features/auth/types/auth.types";
import { ApiError } from "@/shared/api/apiError";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import { ErrorState } from "@/shared/ui/ErrorState";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";
import LoadingState from "@/shared/ui/LoadingState";
import Spinner from "@/shared/ui/Spinner";

import { SignupShell, type SignupStep } from "./SignupShell";

type TermsDocumentType = "service" | "privacy" | "marketing";

const termsDocuments: Record<
  TermsDocumentType,
  { title: string; placeholder: string }
> = {
  service: {
    title: "서비스 이용약관",
    placeholder: "승인된 서비스 이용약관 본문이 필요합니다.",
  },
  privacy: {
    title: "개인정보 수집 및 이용 동의",
    placeholder: "승인된 개인정보 수집 및 이용 동의 본문이 필요합니다.",
  },
  marketing: {
    title: "맞춤형 봉사/이벤트 알림 수신 동의",
    placeholder: "승인된 알림 수신 동의 본문이 필요합니다.",
  },
};

function getFieldErrorId(name: string) {
  return `${name}-error`;
}

function getDescribedBy(name: string, hasError: boolean) {
  return hasError ? getFieldErrorId(name) : undefined;
}

function useSignupForm() {
  return useFormContext<SignupFormValues>();
}

function StepButton({
  children,
  disabled,
  isPending,
  onClick,
}: {
  children: string;
  disabled?: boolean;
  isPending?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      fullWidth
      type="button"
      disabled={disabled || isPending}
      onClick={onClick}
      className="mx-auto h-12 max-w-[19.6875rem] text-base font-semibold"
      leftIcon={isPending ? <Spinner size="small" /> : undefined}
    >
      {children}
    </Button>
  );
}

function FieldErrorText({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p role="alert" className="mt-3 text-center text-sm text-point-red">
      {message}
    </p>
  );
}

function BasicInfoStep({
  verifiedPhoneNumber,
  setVerifiedPhoneNumber,
  onNext,
}: {
  verifiedPhoneNumber: string | null;
  setVerifiedPhoneNumber: (value: string | null) => void;
  onNext: () => void;
}) {
  const {
    control,
    register,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useSignupForm();
  const phoneMutation = usePhoneAvailabilityMutation();
  const gender = useWatch({ control, name: "gender" });
  const phoneNumber = useWatch({ control, name: "phoneNumber" });
  const isPhoneVerified =
    phoneNumber.length > 0 && phoneNumber === verifiedPhoneNumber;

  const handleCheckPhone = async () => {
    clearErrors("phoneNumber");

    if (!/^\d{10,11}$/.test(phoneNumber)) {
      setError("phoneNumber", {
        message: "전화번호는 10~11자리 숫자로 입력해 주세요.",
      });
      return;
    }

    phoneMutation.mutate(
      { phoneNumber },
      {
        onSuccess: (data) => {
          if (!data.available) {
            setVerifiedPhoneNumber(null);
            setError("phoneNumber", {
              message: "이미 가입에 사용된 전화번호입니다.",
            });
            return;
          }

          setVerifiedPhoneNumber(data.phoneNumber);
          clearErrors("phoneNumber");
        },
        onError: () => {
          setVerifiedPhoneNumber(null);
          setError("phoneNumber", {
            message: "전화번호를 확인하지 못했습니다. 다시 시도해 주세요.",
          });
        },
      },
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="space-y-7">
        <FormField
          htmlFor="name"
          label="이름"
          required
          error={errors.name?.message}
          errorId={getFieldErrorId("name")}
          labelClassName="mb-3 text-[15px] font-semibold leading-5"
        >
          <Input
            id="name"
            placeholder="이름을 입력해 주세요"
            invalid={Boolean(errors.name)}
            aria-describedby={getDescribedBy("name", Boolean(errors.name))}
            {...register("name")}
          />
        </FormField>

        <fieldset>
          <legend className="mb-3 text-[15px] font-semibold leading-5 text-text">
            생년월일 / 성별 <span className="text-point-red">*</span>
          </legend>

          <div className="flex gap-3">
            <Controller
              control={control}
              name="birthDate"
              render={({ field }) => (
                <Input
                  id="birthDate"
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  inputMode="numeric"
                  autoComplete="bday"
                  placeholder="YYYY. MM. DD"
                  value={formatBirthDateInput(field.value)}
                  invalid={Boolean(errors.birthDate)}
                  aria-describedby={getDescribedBy(
                    "birthDate",
                    Boolean(errors.birthDate),
                  )}
                  onChange={(event) => {
                    const nextValue = normalizeBirthDate(event.target.value);

                    field.onChange(nextValue);

                    if (isRealPastOrTodayBirthDate(nextValue)) {
                      clearErrors("birthDate");
                    }
                  }}
                />
              )}
            />

            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <div
                  role="radiogroup"
                  aria-label="성별"
                  className="grid h-12 w-38 shrink-0 grid-cols-2 overflow-hidden rounded-xl border border-button"
                >
                  {[
                    ["MALE", "남"],
                    ["FEMALE", "여"],
                  ].map(([value, label]) => {
                    const checked = gender === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        className={cn(
                          "flex cursor-pointer items-center justify-center text-[15px] font-medium",
                          checked
                            ? "bg-[#DCECDF] text-text"
                            : "bg-white text-text-gray-100",
                        )}
                        onClick={() => {
                          field.onChange(value);
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          {errors.birthDate?.message || errors.gender?.message ? (
            <p
              id={getFieldErrorId("birthDate")}
              className="mt-1.5 text-xs leading-4.5 text-point-red"
            >
              {errors.birthDate?.message ?? errors.gender?.message}
            </p>
          ) : null}
        </fieldset>

        <FormField
          htmlFor="phoneNumber"
          label="전화번호"
          required
          error={errors.phoneNumber?.message}
          errorId={getFieldErrorId("phoneNumber")}
          labelClassName="mb-3 text-[15px] font-semibold leading-5"
        >
          <div className="flex gap-3">
            <Input
              id="phoneNumber"
              inputMode="tel"
              autoComplete="tel"
              placeholder="010-0000-0000"
              value={formatPhoneNumber(phoneNumber)}
              invalid={Boolean(errors.phoneNumber)}
              aria-describedby={getDescribedBy(
                "phoneNumber",
                Boolean(errors.phoneNumber),
              )}
              onChange={(event) => {
                setVerifiedPhoneNumber(null);
                clearErrors("phoneNumber");
                setValue("phoneNumber", normalizePhoneNumber(event.target.value), {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />
            <Button
              type="button"
              size="medium"
              variant="dark"
              disabled={
                phoneMutation.isPending ||
                !/^\d{10,11}$/.test(phoneNumber) ||
                isPhoneVerified
              }
              onClick={handleCheckPhone}
              className="h-12 shrink-0 rounded-xl bg-[#BFBFBF] px-5 text-[15px] font-medium text-text"
            >
              {phoneMutation.isPending
                ? "확인 중"
                : isPhoneVerified
                  ? "확인 완료"
                  : "중복 확인"}
            </Button>
          </div>
        </FormField>
      </div>

      <FieldErrorText message={errors.root?.message} />

      <div className="mt-auto" />

      <StepButton
        disabled={!isPhoneVerified || phoneMutation.isPending}
        onClick={onNext}
      >
        다음
      </StepButton>
    </div>
  );
}

function AccountInfoStep({
  verifiedEmail,
  setVerifiedEmail,
  onNext,
}: {
  verifiedEmail: string | null;
  setVerifiedEmail: (value: string | null) => void;
  onNext: () => void;
}) {
  const {
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useSignupForm();
  const [showCodeField, setShowCodeField] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] =
    useState(false);
  const sendMutation = useSendEmailVerificationMutation();
  const confirmMutation = useConfirmEmailVerificationMutation();
  const watchedEmail = useWatch({ control, name: "email" });
  const emailVerificationCode = useWatch({
    control,
    name: "emailVerificationCode",
  });
  const email = normalizeEmail(watchedEmail);
  const isEmailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
  const isEmailVerified = email.length > 0 && email === verifiedEmail;

  const handleSend = () => {
    clearErrors();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      setError("email", { message: "올바른 이메일 형식이 아닙니다." });
      return;
    }

    setVerifiedEmail(null);
    setValue("emailVerificationCode", "", { shouldDirty: true });

    sendMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setShowCodeField(true);
        },
        onError: (error) => {
          if (
            error instanceof ApiError &&
            error.status === 409 &&
            error.code === API_ERROR_CODE.DUPLICATE_EMAIL
          ) {
            setError("email", { message: "이미 가입된 이메일입니다." });
            return;
          }

          if (
            error instanceof ApiError &&
            error.status === 500 &&
            error.code === API_ERROR_CODE.EMAIL_SEND_FAILED
          ) {
            setError("root", {
              message:
                "인증 메일을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.",
            });
            return;
          }

          setError("email", { message: "이메일 형식을 다시 확인해 주세요." });
        },
      },
    );
  };

  const handleConfirm = () => {
    clearErrors();

    confirmMutation.mutate(
      { email, code: emailVerificationCode },
      {
        onSuccess: (data) => {
          if (data.verified) {
            setVerifiedEmail(normalizeEmail(data.email));
          }
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            if (error.code === API_ERROR_CODE.INVALID_VERIFICATION_CODE) {
              setError("emailVerificationCode", {
                message: "인증번호가 올바르지 않습니다.",
              });
              return;
            }

            if (error.code === API_ERROR_CODE.EXPIRED_VERIFICATION_CODE) {
              setError("emailVerificationCode", {
                message: "인증번호가 만료되었습니다. 다시 발송해 주세요.",
              });
              return;
            }

            if (error.code === API_ERROR_CODE.EMAIL_VERIFICATION_NOT_FOUND) {
              setError("emailVerificationCode", {
                message:
                  "인증 요청을 찾을 수 없습니다. 인증번호를 다시 발송해 주세요.",
              });
              return;
            }
          }

          setError("emailVerificationCode", {
            message: "인증번호를 확인하지 못했습니다. 다시 시도해 주세요.",
          });
        },
      },
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="space-y-6">
        <FormField
          htmlFor="email"
          label="이메일"
          required
          error={errors.email?.message}
          errorId={getFieldErrorId("email")}
          labelClassName="mb-3 text-[15px] font-semibold leading-5"
        >
          <div className="flex gap-3">
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  id="email"
                  ref={field.ref}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  placeholder="이메일을 입력해 주세요"
                  value={field.value}
                  invalid={Boolean(errors.email)}
                  aria-describedby={getDescribedBy(
                    "email",
                    Boolean(errors.email),
                  )}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(normalizeEmail(event.target.value));
                    setVerifiedEmail(null);
                    setShowCodeField(false);
                    setValue("emailVerificationCode", "", {
                      shouldDirty: true,
                    });
                  }}
                />
              )}
            />
            <Button
              type="button"
              size="medium"
              disabled={sendMutation.isPending || isEmailVerified || !isEmailValid}
              onClick={handleSend}
              className={cn(
                "h-12 shrink-0 rounded-xl px-5 text-[15px] font-medium",
                isEmailValid && !isEmailVerified
                  ? "bg-button text-white"
                  : "bg-[#BFBFBF] text-text",
              )}
            >
              {sendMutation.isPending
                ? "발송 중"
                : isEmailVerified
                  ? "인증 완료"
                  : showCodeField
                    ? "재전송"
                    : "메일 인증"}
            </Button>
          </div>
        </FormField>

        {showCodeField ? (
          <FormField
            htmlFor="emailVerificationCode"
            label="인증번호"
            required
            error={errors.emailVerificationCode?.message}
            errorId={getFieldErrorId("emailVerificationCode")}
            labelClassName="mb-3 text-[15px] font-semibold leading-5"
          >
            <div className="flex gap-3">
              <Controller
                control={control}
                name="emailVerificationCode"
                render={({ field }) => (
                  <Input
                    id="emailVerificationCode"
                    ref={field.ref}
                    name={field.name}
                    onBlur={field.onBlur}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="인증번호 6자리"
                    value={field.value}
                    invalid={Boolean(errors.emailVerificationCode)}
                    aria-describedby={getDescribedBy(
                      "emailVerificationCode",
                      Boolean(errors.emailVerificationCode),
                    )}
                    onChange={(event) => {
                      field.onChange(
                        event.target.value.replace(/\D/g, "").slice(0, 6),
                      );
                    }}
                  />
                )}
              />
              <Button
                type="button"
                size="medium"
                disabled={
                  confirmMutation.isPending ||
                  isEmailVerified ||
                  !/^\d{6}$/.test(emailVerificationCode)
                }
                onClick={handleConfirm}
                className={cn(
                  "h-12 shrink-0 rounded-xl px-5 text-[15px] font-medium",
                  /^\d{6}$/.test(emailVerificationCode) && !isEmailVerified
                    ? "bg-button text-white"
                    : "bg-[#BFBFBF] text-text",
                )}
              >
                {confirmMutation.isPending ? "확인 중" : "인증하기"}
              </Button>
            </div>
          </FormField>
        ) : null}

        <PasswordField
          name="password"
          label="비밀번호"
          placeholder="6자 이상 입력해 주세요"
          visible={isPasswordVisible}
          setVisible={setIsPasswordVisible}
        />

        <PasswordField
          name="passwordConfirm"
          label="비밀번호 확인"
          placeholder="비밀번호를 다시 입력해 주세요"
          visible={isPasswordConfirmVisible}
          setVisible={setIsPasswordConfirmVisible}
        />
      </div>

      <FieldErrorText message={errors.root?.message} />

      <div className="mt-auto" />

      <StepButton
        disabled={
          !isEmailVerified ||
          sendMutation.isPending ||
          confirmMutation.isPending
        }
        onClick={onNext}
      >
        다음
      </StepButton>
    </div>
  );
}

function PasswordField({
  name,
  label,
  placeholder,
  visible,
  setVisible,
}: {
  name: "password" | "passwordConfirm";
  label: string;
  placeholder: string;
  visible: boolean;
  setVisible: (value: boolean) => void;
}) {
  const {
    register,
    formState: { errors },
  } = useSignupForm();
  const error = errors[name]?.message;

  return (
    <FormField
      htmlFor={name}
      label={label}
      required
      error={error}
      errorId={getFieldErrorId(name)}
      labelClassName="mb-3 text-[15px] font-semibold leading-5"
    >
      <div className="relative">
        <Input
          id={name}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          placeholder={placeholder}
          className="pr-12"
          invalid={Boolean(error)}
          aria-describedby={getDescribedBy(name, Boolean(error))}
          {...register(name)}
        />
        <button
          type="button"
          aria-label={visible ? `${label} 숨기기` : `${label} 보기`}
          className="absolute top-1/2 right-4 flex size-6 -translate-y-1/2 items-center justify-center text-text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
    </FormField>
  );
}

function ProfileStep({
  selectedLevel1RegionId,
  setSelectedLevel1RegionId,
  onNext,
}: {
  selectedLevel1RegionId: number | null;
  setSelectedLevel1RegionId: (value: number | null) => void;
  onNext: () => void;
}) {
  const {
    register,
    watch,
    formState: { errors },
  } = useSignupForm();
  const { regionsQuery, categoriesQuery } = useSignupOptionsQuery();
  const introduction = watch("introduction");

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-center">
        <div className="relative">
          <div className="flex size-29 items-center justify-center rounded-full border border-stroke bg-white text-text-gray-100">
            <UserRound className="size-18" strokeWidth={1.2} />
          </div>
          <span
            aria-hidden="true"
            className="absolute right-0 bottom-1 flex size-8 items-center justify-center rounded-full bg-white text-text-gray-300 shadow"
          >
            <Camera className="size-5" />
          </span>
        </div>
      </div>

      <div className="mt-7 space-y-6">
        <FormField
          htmlFor="nickname"
          label="닉네임"
          required
          error={errors.nickname?.message}
          errorId={getFieldErrorId("nickname")}
          labelClassName="mb-3 text-[15px] font-semibold leading-5"
        >
          <Input
            id="nickname"
            placeholder="활동하며 사용할 닉네임을 입력해 주세요"
            invalid={Boolean(errors.nickname)}
            aria-describedby={getDescribedBy(
              "nickname",
              Boolean(errors.nickname),
            )}
            {...register("nickname")}
          />
        </FormField>

        <FormField
          htmlFor="introduction"
          label="소개"
          count={introduction.length}
          maxLength={50}
          error={errors.introduction?.message}
          errorId={getFieldErrorId("introduction")}
          labelClassName="mb-3 text-[15px] font-semibold leading-5"
        >
          <Input
            id="introduction"
            placeholder="소개를 입력해 주세요"
            maxLength={50}
            invalid={Boolean(errors.introduction)}
            aria-describedby={getDescribedBy(
              "introduction",
              Boolean(errors.introduction),
            )}
            {...register("introduction")}
          />
        </FormField>

        <RegionSelector
          regions={regionsQuery.data ?? []}
          isLoading={regionsQuery.isLoading}
          isError={regionsQuery.isError}
          onRetry={() => void regionsQuery.refetch()}
          selectedLevel1RegionId={selectedLevel1RegionId}
          setSelectedLevel1RegionId={setSelectedLevel1RegionId}
        />

        <CategorySelector
          categories={categoriesQuery.data ?? []}
          isLoading={categoriesQuery.isLoading}
          isError={categoriesQuery.isError}
          onRetry={() => void categoriesQuery.refetch()}
        />
      </div>

      <FieldErrorText message={errors.root?.message} />

      <div className="mt-8" />

      <StepButton
        disabled={regionsQuery.isLoading || categoriesQuery.isLoading}
        onClick={onNext}
      >
        다음
      </StepButton>
    </div>
  );
}

function RegionSelector({
  regions,
  isLoading,
  isError,
  onRetry,
  selectedLevel1RegionId,
  setSelectedLevel1RegionId,
}: {
  regions: SignupRegion[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  selectedLevel1RegionId: number | null;
  setSelectedLevel1RegionId: (value: number | null) => void;
}) {
  const {
    control,
    setValue,
    clearErrors,
    formState: { errors },
  } = useSignupForm();
  const activityRegionId = useWatch({ control, name: "activityRegionId" });
  const level1Regions = regions.filter(
    (region) => region.level === 1 && region.parentId === null,
  );
  const level2Regions = regions.filter(
    (region) =>
      region.level === 2 && region.parentId === selectedLevel1RegionId,
  );

  if (isLoading) {
    return <LoadingState label="지역을 불러오는 중입니다." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="지역을 불러오지 못했습니다."
        primaryAction={{ label: "다시 시도", onClick: onRetry }}
      />
    );
  }

  return (
    <section>
      <h2 className="text-[15px] font-semibold leading-5 text-text">
        활동 지역 <span className="text-point-red">*</span>
      </h2>
      <p className="mt-1.5 text-xs font-medium text-text-gray-100">
        상위 지역 선택 후 세부 지역을 1개 선택해 주세요
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {level1Regions.map((region) => {
          const selected = selectedLevel1RegionId === region.id;

          return (
            <button
              key={region.id}
              type="button"
              aria-pressed={selected}
              className={cn(
                "h-12 rounded-xl border text-[15px] font-medium text-text-gray-400 transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                selected
                  ? "border-button bg-[#DCECDF]"
                  : "border-stroke bg-white",
              )}
              onClick={() => {
                setSelectedLevel1RegionId(region.id);
                setValue("activityRegionId", null, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            >
              {region.name}
            </button>
          );
        })}
      </div>

      {selectedLevel1RegionId ? (
        <div className="mt-4 max-h-43 overflow-y-auto rounded-xl border border-stroke bg-white p-3">
          {level2Regions.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {level2Regions.map((region) => {
                const selected = activityRegionId === region.id;

                return (
                  <button
                    key={region.id}
                    type="button"
                    aria-pressed={selected}
                    className={cn(
                      "min-h-10 rounded-lg border px-3 py-2 text-sm transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                      selected
                        ? "border-button bg-[#DCECDF] text-text"
                        : "border-stroke bg-white text-text-gray-400",
                    )}
                    onClick={() => {
                      clearErrors("activityRegionId");
                      setValue("activityRegionId", region.id, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  >
                    {region.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="py-3 text-center text-sm text-text-gray-100">
              선택 가능한 세부 지역이 없습니다.
            </p>
          )}
        </div>
      ) : null}

      {errors.activityRegionId?.message ? (
        <p
          id={getFieldErrorId("activityRegionId")}
          className="mt-1.5 text-xs text-point-red"
        >
          {errors.activityRegionId.message}
        </p>
      ) : null}
    </section>
  );
}

function CategorySelector({
  categories,
  isLoading,
  isError,
  onRetry,
}: {
  categories: SignupCategory[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const {
    control,
    setValue,
    clearErrors,
    formState: { errors },
  } = useSignupForm();
  const selectedIds = useWatch({ control, name: "interestCategoryIds" });
  const visibleCategories = categories.slice(0, 6);

  if (isLoading) {
    return <LoadingState label="카테고리를 불러오는 중입니다." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="카테고리를 불러오지 못했습니다."
        primaryAction={{ label: "다시 시도", onClick: onRetry }}
      />
    );
  }

  return (
    <section>
      <h2 className="text-[15px] font-semibold leading-5 text-text">
        관심 카테고리
      </h2>
      <p className="mt-1.5 text-xs font-medium text-text-gray-100">
        1개 이상 선택해 주세요
      </p>

      <div className="mt-4 grid grid-cols-3 gap-x-2 gap-y-4">
        {visibleCategories.map((category) => {
          const selected = selectedIds.includes(category.id);

          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={selected}
              className={cn(
                "relative flex min-h-28 flex-col items-center justify-center rounded-xl p-1 transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                selected && "bg-[#DCECDF]/70 ring-2 ring-button/60",
              )}
              onClick={() => {
                const nextIds = selected
                  ? selectedIds.filter((id) => id !== category.id)
                  : [...selectedIds, category.id];

                setValue("interestCategoryIds", nextIds, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                clearErrors("interestCategoryIds");
              }}
            >
              <img
                src={getSignupCategoryIcon(category.code)}
                alt=""
                className="h-20 w-20"
              />
              <span className="absolute inset-x-2 top-1/2 -translate-y-1/2 text-center text-[13px] font-medium leading-4 text-text">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>

      {errors.interestCategoryIds?.message ? (
        <p
          id={getFieldErrorId("interestCategoryIds")}
          className="mt-1.5 text-xs text-point-red"
        >
          {errors.interestCategoryIds.message}
        </p>
      ) : null}
    </section>
  );
}

function TermsStep({
  isPending,
  onSubmit,
  onOpenDetail,
}: {
  isPending: boolean;
  onSubmit: () => void;
  onOpenDetail: (type: TermsDocumentType) => void;
}) {
  const {
    control,
    setValue,
    clearErrors,
    formState: { errors },
  } = useSignupForm();
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

      <div className="mt-5 border-t border-stroke pt-5 space-y-4">
        <AgreementRow
          checked={serviceTermsAgreed}
          label="[필수] 서비스 이용약관 동의"
          onChange={(checked) =>
            {
              setValue("serviceTermsAgreed", checked, {
                shouldDirty: true,
                shouldValidate: true,
              });
              clearErrors("serviceTermsAgreed");
            }
          }
          onView={() => onOpenDetail("service")}
        />
        <AgreementRow
          checked={privacyPolicyAgreed}
          label="[필수] 개인정보 수집 및 이용 동의"
          onChange={(checked) =>
            {
              setValue("privacyPolicyAgreed", checked, {
                shouldDirty: true,
                shouldValidate: true,
              });
              clearErrors("privacyPolicyAgreed");
            }
          }
          onView={() => onOpenDetail("privacy")}
        />
        <AgreementRow
          checked={marketingAgreed}
          label="[선택] 맞춤형 봉사 / 이벤트 알림 수신 동의"
          muted={!marketingAgreed}
          onChange={(checked) =>
            {
              setValue("marketingAgreed", checked, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }
          }
          onView={() => onOpenDetail("marketing")}
        />
      </div>

      <FieldErrorText
        message={
          errors.root?.message ??
          errors.serviceTermsAgreed?.message ??
          errors.privacyPolicyAgreed?.message
        }
      />

      <div className="mt-auto" />

      <StepButton
        disabled={!serviceTermsAgreed || !privacyPolicyAgreed}
        isPending={isPending}
        onClick={onSubmit}
      >
        {isPending ? "가입 중" : "완료"}
      </StepButton>
    </div>
  );
}

function AgreementRow({
  checked,
  label,
  strong,
  muted,
  onChange,
  onView,
}: {
  checked: boolean;
  label: string;
  strong?: boolean;
  muted?: boolean;
  onChange: (checked: boolean) => void;
  onView?: () => void;
}) {
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
          strong ? "font-semibold text-text" : "font-semibold text-text-gray-300",
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

function TermsDetail({
  type,
  onBack,
}: {
  type: TermsDocumentType;
  onBack: () => void;
}) {
  const document = termsDocuments[type];

  return (
    <div className="min-h-dvh bg-bg">
      <SignupShell step="terms" onBack={onBack} footer={null}>
        <article className="pb-8">
          <h2 className="text-xl font-semibold text-text">{document.title}</h2>
          <div className="mt-4 h-1.25 rounded-full bg-button" />
          <section className="mt-6 space-y-4 text-base leading-7 text-text">
            <p>{document.placeholder}</p>
            <p className="text-sm text-text-gray-100">
              TODO: 승인된 약관 원문을 이 위치에 연결해 주세요.
            </p>
          </section>
        </article>
      </SignupShell>
    </div>
  );
}

function getSignupErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return "회원가입 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (error.code === API_ERROR_CODE.VALIDATION_ERROR) {
    return "입력한 정보를 다시 확인해 주세요.";
  }

  return "회원가입 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}

export function SignupFlow() {
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
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState<string | null>(
    null,
  );
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [selectedLevel1RegionId, setSelectedLevel1RegionId] = useState<
    number | null
  >(null);
  const watchedPhoneNumber = useWatch({
    control: methods.control,
    name: "phoneNumber",
  });
  const watchedEmail = useWatch({
    control: methods.control,
    name: "email",
  });
  const prevPhoneRef = useRef(watchedPhoneNumber);
  const prevEmailRef = useRef(watchedEmail);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, detailType]);

  useEffect(() => {
    if (prevPhoneRef.current !== watchedPhoneNumber) {
      prevPhoneRef.current = watchedPhoneNumber;
      setVerifiedPhoneNumber(null);
    }
  }, [watchedPhoneNumber]);

  useEffect(() => {
    if (prevEmailRef.current !== watchedEmail) {
      prevEmailRef.current = watchedEmail;
      setVerifiedEmail(null);
      methods.setValue("emailVerificationCode", "", { shouldDirty: true });
    }
  }, [methods, watchedEmail]);

  const handleBack = () => {
    if (detailType) {
      setDetailType(null);
      return;
    }

    if (step === "basic") {
      setShowExitDialog(true);
      return;
    }

    setStep((current) => {
      if (current === "account") {
        return "basic";
      }
      if (current === "profile") {
        return "account";
      }
      return "profile";
    });
  };

  const goNextFromBasic = async () => {
    methods.clearErrors("root");
    const valid = await methods.trigger([...basicInfoFields], {
      shouldFocus: true,
    });

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
    methods.clearErrors("root");
    const valid = await methods.trigger([...accountInfoFields], {
      shouldFocus: true,
    });

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
    methods.clearErrors("root");
    const valid = await methods.trigger([...profileFields], {
      shouldFocus: true,
    });

    if (valid) {
      setStep("terms");
    }
  };

  const submitSignup = async () => {
    methods.clearErrors("root");
    const valid = await methods.trigger(
      [
        ...basicInfoFields,
        ...accountInfoFields,
        ...profileFields,
        ...termsFields,
      ],
      { shouldFocus: true },
    );

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
      methods.setError("email", { message: "이메일 인증을 완료해 주세요." });
      return;
    }

    signupMutation.mutate(toSignupRequest(methods.getValues()), {
      onSuccess: (data) => {
        methods.reset(signupDefaultValues);
        setVerifiedEmail(null);
        setVerifiedPhoneNumber(null);
        setSelectedLevel1RegionId(null);
        navigate("/login/email", {
          replace: true,
          state: { email: data.email },
        });
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          if (error.code === API_ERROR_CODE.PASSWORD_MISMATCH) {
            setStep("account");
            methods.setError("passwordConfirm", {
              message: "비밀번호가 일치하지 않습니다.",
            });
            return;
          }
          if (
            error.code === API_ERROR_CODE.EMAIL_NOT_VERIFIED ||
            error.code === API_ERROR_CODE.DUPLICATE_EMAIL
          ) {
            setStep("account");
            setVerifiedEmail(null);
            methods.setError("email", {
              message:
                error.code === API_ERROR_CODE.DUPLICATE_EMAIL
                  ? "이미 가입된 이메일입니다."
                  : "이메일 인증을 완료해 주세요.",
            });
            return;
          }
          if (error.code === API_ERROR_CODE.DUPLICATE_PHONE_NUMBER) {
            setStep("basic");
            setVerifiedPhoneNumber(null);
            methods.setError("phoneNumber", {
              message: "이미 가입에 사용된 전화번호입니다.",
            });
            return;
          }
          if (error.code === API_ERROR_CODE.DUPLICATE_NICKNAME) {
            setStep("profile");
            methods.setError("nickname", {
              message: "이미 사용 중인 닉네임입니다.",
            });
            return;
          }
          if (
            error.code === API_ERROR_CODE.INVALID_ACTIVITY_REGION ||
            error.code === API_ERROR_CODE.REGION_NOT_FOUND
          ) {
            setStep("profile");
            methods.setError("activityRegionId", {
              message: "활동 지역을 다시 선택해 주세요.",
            });
            return;
          }
          if (
            error.code === API_ERROR_CODE.INVALID_INTEREST_CATEGORY_COUNT ||
            error.code === API_ERROR_CODE.CATEGORY_NOT_FOUND
          ) {
            setStep("profile");
            methods.setError("interestCategoryIds", {
              message: "관심 카테고리를 다시 선택해 주세요.",
            });
            return;
          }
          if (error.code === API_ERROR_CODE.REQUIRED_TERMS_NOT_AGREED) {
            setStep("terms");
            methods.setError("root", {
              message: "필수 약관에 동의해 주세요.",
            });
            return;
          }
        }

        methods.setError("root", {
          message: getSignupErrorMessage(error),
        });
      },
    });
  };

  if (detailType) {
    return <TermsDetail type={detailType} onBack={handleBack} />;
  }

  return (
    <FormProvider {...methods}>
      <SignupShell step={step} onBack={handleBack}>
        {step === "basic" ? (
          <BasicInfoStep
            verifiedPhoneNumber={verifiedPhoneNumber}
            setVerifiedPhoneNumber={setVerifiedPhoneNumber}
            onNext={goNextFromBasic}
          />
        ) : null}
        {step === "account" ? (
          <AccountInfoStep
            verifiedEmail={verifiedEmail}
            setVerifiedEmail={setVerifiedEmail}
            onNext={goNextFromAccount}
          />
        ) : null}
        {step === "profile" ? (
          <ProfileStep
            selectedLevel1RegionId={selectedLevel1RegionId}
            setSelectedLevel1RegionId={setSelectedLevel1RegionId}
            onNext={goNextFromProfile}
          />
        ) : null}
        {step === "terms" ? (
          <TermsStep
            isPending={signupMutation.isPending}
            onSubmit={submitSignup}
            onOpenDetail={setDetailType}
          />
        ) : null}
      </SignupShell>

      <ConfirmDialog
        open={showExitDialog}
        title="뒤로 가면 작성 중인 내용이 사라집니다."
        cancelText="취소"
        confirmText="확인"
        onCancel={() => setShowExitDialog(false)}
        onConfirm={() => {
          methods.reset(signupDefaultValues);
          setVerifiedEmail(null);
          setVerifiedPhoneNumber(null);
          setSelectedLevel1RegionId(null);
          navigate("/login");
        }}
      />
    </FormProvider>
  );
}
