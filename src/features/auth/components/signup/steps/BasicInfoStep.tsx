import { Controller, useFormContext, useWatch } from "react-hook-form";

import type { PhoneVerificationFlow } from "@/features/auth/hooks/usePhoneVerificationFlow";
import { PhoneVerificationQrDialog } from "@/features/auth/components/phone/PhoneVerificationQrDialog";
import {
  getSignupFieldDescribedBy,
  getSignupFieldErrorId,
} from "@/features/auth/lib/signupFieldA11y";
import {
  formatBirthDateInput,
  formatPhoneNumber,
  isAllowedBirthDate,
  normalizeBirthDate,
  normalizePhoneNumber,
} from "@/features/auth/lib/signupFormatters";
import {
  signupCommonSchema,
  signupPhoneNumberSchema,
  type SignupCommonFormValues,
} from "@/features/auth/schemas/signupCommon.schema";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";

import { SignupStepButton } from "../SignupFormParts";

type BasicInfoStepProps = {
  phoneVerification: PhoneVerificationFlow;
};
const PHONE_VERIFICATION_GUIDE_ID = "phoneNumber-description";
const basicInfoCompletionSchema = signupCommonSchema.pick({
  name: true,
  birthDate: true,
  gender: true,
  phoneNumber: true,
});

export function BasicInfoStep({ phoneVerification }: BasicInfoStepProps) {
  const {
    control,
    register,
    clearErrors,
    formState: { errors },
  } = useFormContext<SignupCommonFormValues>();
  const name = useWatch({ control, name: "name" });
  const birthDate = useWatch({ control, name: "birthDate" });
  const gender = useWatch({ control, name: "gender" });
  const phoneNumber = useWatch({ control, name: "phoneNumber" });
  const isPhoneNumberValid =
    signupPhoneNumberSchema.safeParse(phoneNumber).success;
  const isBasicInfoComplete = basicInfoCompletionSchema.safeParse({
    name,
    birthDate,
    gender,
    phoneNumber,
  }).success;
  const isPhoneVerified = phoneVerification.isPhoneVerified;
  const isVerificationButtonDisabled =
    !isPhoneNumberValid ||
    isPhoneVerified ||
    phoneVerification.isVerificationActionPending ||
    (phoneVerification.isVerificationInProgress &&
      !phoneVerification.canReopenQr);
  const showInitialPhoneVerificationGuide =
    isPhoneNumberValid &&
    !isPhoneVerified &&
    !phoneVerification.isVerificationInProgress &&
    !phoneVerification.isVerificationActionPending &&
    !errors.phoneNumber;
  const showQrClosedGuide =
    isPhoneNumberValid &&
    !isPhoneVerified &&
    phoneVerification.canReopenQr &&
    !phoneVerification.isQrDialogOpen &&
    !phoneVerification.isVerificationActionPending &&
    !errors.phoneNumber;
  const hasPhoneVerificationGuide =
    showInitialPhoneVerificationGuide || showQrClosedGuide;

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
                    if (isAllowedBirthDate(nextValue)) {
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
          descriptionId={PHONE_VERIFICATION_GUIDE_ID}
          description={
            showQrClosedGuide ? (
              <span className="text-button">
                기본 카메라로 QR 인식 후 뒤 화면에 나오는 인증코드를 문자로
                발송해주세요
              </span>
            ) : showInitialPhoneVerificationGuide ? (
              <span className="text-button">
                인증하기를 누른 뒤 안내에 따라 문자 메시지를 전송해 주세요.
                <br />
                화면에 표기된 인증코드를 그대로 전송하면 인증이 자동으로
                완료됩니다.
              </span>
            ) : undefined
          }
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
                  aria-describedby={
                    getSignupFieldDescribedBy(
                      "phoneNumber",
                      Boolean(errors.phoneNumber),
                    ) ??
                    (hasPhoneVerificationGuide
                      ? PHONE_VERIFICATION_GUIDE_ID
                      : undefined)
                  }
                  onChange={(event) => {
                    const nextPhoneNumber = normalizePhoneNumber(
                      event.target.value,
                    );

                    clearErrors("phoneNumber");

                    field.onChange(nextPhoneNumber);
                  }}
                />
              )}
            />
            <Button
              type="button"
              size="medium"
              disabled={isVerificationButtonDisabled}
              onClick={phoneVerification.handleVerifyPhone}
              className={cn(
                "h-12 shrink-0 rounded-xl px-5 text-[15px] font-medium",
                !isVerificationButtonDisabled
                  ? "bg-button text-white"
                  : "bg-[#BFBFBF] text-text",
              )}
            >
              {isPhoneVerified
                ? "인증 완료"
                : phoneVerification.isVerificationActionPending
                  ? "확인 중"
                  : phoneVerification.canReopenQr
                    ? "QR 다시 보기"
                    : phoneVerification.isVerificationInProgress
                      ? "인증 중"
                      : "인증하기"}
            </Button>
          </div>
        </FormField>
      </div>

      <PhoneVerificationQrDialog flow={phoneVerification} />

      <div className="mt-auto" />

      <SignupStepButton
        disabled={
          !isBasicInfoComplete ||
          !isPhoneVerified ||
          phoneVerification.isPending
        }
      >
        다음
      </SignupStepButton>
    </div>
  );
}
