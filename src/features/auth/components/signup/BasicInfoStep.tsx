import { Controller, useFormContext, useWatch } from "react-hook-form";

import { usePhoneAvailabilityMutation } from "@/features/auth/hooks/usePhoneAvailabilityMutation";
import {
  getSignupFieldDescribedBy,
  getSignupFieldErrorId,
} from "@/features/auth/lib/signupFieldA11y";
import {
  formatBirthDateInput,
  formatPhoneNumber,
  isRealPastOrTodayBirthDate,
  normalizeBirthDate,
  normalizePhoneNumber,
} from "@/features/auth/lib/signupFormatters";
import type { SignupFormValues } from "@/features/auth/schemas/signup.schema";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";

import { SignupStepButton } from "./SignupFormParts";

type BasicInfoStepProps = {
  verifiedPhoneNumber: string | null;
  onVerifiedPhoneNumberChange: (value: string | null) => void;
  onNext: () => void;
};

export function BasicInfoStep({
  verifiedPhoneNumber,
  onVerifiedPhoneNumberChange,
  onNext,
}: BasicInfoStepProps) {
  const {
    control,
    register,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  const phoneMutation = usePhoneAvailabilityMutation();
  const gender = useWatch({ control, name: "gender" });
  const phoneNumber = useWatch({ control, name: "phoneNumber" });
  const isPhoneVerified =
    phoneNumber.length > 0 && phoneNumber === verifiedPhoneNumber;

  const handleCheckPhone = () => {
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
            onVerifiedPhoneNumberChange(null);
            setError("phoneNumber", {
              message: "이미 가입에 사용된 전화번호입니다.",
            });
            return;
          }

          onVerifiedPhoneNumberChange(data.phoneNumber);
          clearErrors("phoneNumber");
        },
        onError: () => {
          onVerifiedPhoneNumberChange(null);
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
          errorId={getSignupFieldErrorId("name")}
          labelClassName="mb-3 text-[15px] font-semibold leading-5"
        >
          <Input
            id="name"
            placeholder="이름을 입력해 주세요"
            invalid={Boolean(errors.name)}
            aria-describedby={getSignupFieldDescribedBy(
              "name",
              Boolean(errors.name),
            )}
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
                  aria-describedby={getSignupFieldDescribedBy(
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
                        onClick={() => field.onChange(value)}
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
              id={getSignupFieldErrorId("birthDate")}
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
          errorId={getSignupFieldErrorId("phoneNumber")}
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
              aria-describedby={getSignupFieldDescribedBy(
                "phoneNumber",
                Boolean(errors.phoneNumber),
              )}
              onChange={(event) => {
                clearErrors("phoneNumber");
                setValue(
                  "phoneNumber",
                  normalizePhoneNumber(event.target.value),
                  {
                    shouldDirty: true,
                    shouldValidate: true,
                  },
                );
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

      <div className="mt-auto" />

      <SignupStepButton
        disabled={!isPhoneVerified || phoneMutation.isPending}
        onClick={onNext}
      >
        다음
      </SignupStepButton>
    </div>
  );
}
