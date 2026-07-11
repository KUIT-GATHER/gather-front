import { Camera, UserRound } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { useSignupOptionsQuery } from "@/features/auth/hooks/useSignupOptionsQuery";
import {
  getSignupFieldDescribedBy,
  getSignupFieldErrorId,
} from "@/features/auth/lib/signupFieldA11y";
import type { SignupFormValues } from "@/features/auth/schemas/signup.schema";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";

import { CategorySelector } from "./CategorySelector";
import { RegionSelector } from "./RegionSelector";
import { SignupStepButton } from "../SignupFormParts";

export function ProfileStep() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  const { regionsQuery, categoriesQuery } = useSignupOptionsQuery();
  const introduction = useWatch({ control, name: "introduction" });
  const isSignupOptionUnavailable =
    regionsQuery.isLoading ||
    regionsQuery.isError ||
    categoriesQuery.isLoading ||
    categoriesQuery.isError;

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
          errorId={getSignupFieldErrorId("nickname")}
          labelClassName="mb-3 text-[15px] font-semibold leading-5"
        >
          <Input
            id="nickname"
            maxLength={20}
            placeholder="활동하며 사용할 닉네임을 입력해 주세요"
            invalid={Boolean(errors.nickname)}
            aria-describedby={getSignupFieldDescribedBy(
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
          errorId={getSignupFieldErrorId("introduction")}
          labelClassName="mb-3 text-[15px] font-semibold leading-5"
        >
          <Input
            id="introduction"
            placeholder="소개를 입력해 주세요"
            maxLength={50}
            invalid={Boolean(errors.introduction)}
            aria-describedby={getSignupFieldDescribedBy(
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
        />

        <CategorySelector
          categories={categoriesQuery.data ?? []}
          isLoading={categoriesQuery.isLoading}
          isError={categoriesQuery.isError}
          onRetry={() => void categoriesQuery.refetch()}
        />
      </div>

      <div className="mt-8" />

      <SignupStepButton disabled={isSignupOptionUnavailable}>
        다음
      </SignupStepButton>
    </div>
  );
}
