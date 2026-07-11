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
import {
  signupPhoneNumberSchema,
  type SignupFormValues,
} from "@/features/auth/schemas/signup.schema";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";

import { SignupStepButton } from "../SignupFormParts";

type BasicInfoStepProps = {
  verifiedPhoneNumber: string | null;
  onVerifiedPhoneNumberChange: (value: string | null) => void;
};

export function BasicInfoStep({
  verifiedPhoneNumber,
  onVerifiedPhoneNumberChange,
}: BasicInfoStepProps) {
  const {
    control,
    register,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  const phoneMutation = usePhoneAvailabilityMutation();
  const phoneNumber = useWatch({ control, name: "phoneNumber" });
  const isPhoneNumberValid =
    signupPhoneNumberSchema.safeParse(phoneNumber).success;
  const isPhoneVerified =
    phoneNumber.length > 0 && phoneNumber === verifiedPhoneNumber;

  const handleCheckPhone = () => { // 전화번호 중복 확인 버튼 클릭 시 실행되는 함수
    clearErrors("phoneNumber");

    if (!isPhoneNumberValid) {
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
            maxLength={20}
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
                    const checked = field.value === value;

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
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field }) => (
                <Input
                  id="phoneNumber"
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="010-0000-0000"
                  value={formatPhoneNumber(field.value)}
                  invalid={Boolean(errors.phoneNumber)}
                  aria-describedby={getSignupFieldDescribedBy(
                    "phoneNumber",
                    Boolean(errors.phoneNumber),
                  )}
                  onChange={(event) => {
                    clearErrors("phoneNumber");
                    field.onChange(normalizePhoneNumber(event.target.value));
                  }}
                />
              )}
            />
            <Button
              type="button"
              size="medium"
              disabled={
                phoneMutation.isPending ||
                !isPhoneNumberValid ||
                isPhoneVerified
              }
              onClick={handleCheckPhone}
              className={cn(
                "h-12 shrink-0 rounded-xl px-5 text-[15px] font-medium",
                isPhoneNumberValid && !isPhoneVerified
                  ? "bg-button text-white"
                  : "bg-[#BFBFBF] text-text",
              )}
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

      <SignupStepButton disabled={!isPhoneVerified || phoneMutation.isPending}>
        다음
      </SignupStepButton>
    </div>
  );
}
