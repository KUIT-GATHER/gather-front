import { useFormContext, useWatch } from "react-hook-form";

import CameraIcon from "@/assets/icons/Camera.svg";
import ProfileIcon from "@/assets/icons/Profile.svg";
import {
  getSignupFieldDescribedBy,
  getSignupFieldErrorId,
} from "@/features/auth/lib/signupFieldA11y";
import type { SignupFormValues } from "@/features/auth/schemas/signup.schema";
import { useRegionGroupsQuery } from "@/features/region/hooks/useRegionGroupsQuery";
import { useRegionsQuery } from "@/features/region/hooks/useRegionsQuery";
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
  const regionsQuery = useRegionsQuery();
  const regionGroupsQuery = useRegionGroupsQuery();
  const introduction = useWatch({ control, name: "introduction" });
  const isSignupOptionUnavailable =
    regionsQuery.isLoading ||
    regionsQuery.isError ||
    regionGroupsQuery.isLoading ||
    regionGroupsQuery.isError;
  const isRegionLoading = regionsQuery.isLoading || regionGroupsQuery.isLoading;
  const isRegionError = regionsQuery.isError || regionGroupsQuery.isError;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-center">
        <div className="relative size-29">
          <img src={ProfileIcon} alt="" className="size-full" />
          <span
            aria-hidden="true"
            className="absolute right-0 bottom-1 flex size-8 items-center justify-center rounded-full bg-white text-text-gray-300 shadow"
          >
            <img src={CameraIcon} alt="" className="size-6" />
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
          regionGroups={regionGroupsQuery.data ?? []}
          isLoading={isRegionLoading}
          isError={isRegionError}
          onRetry={() => {
            void Promise.all([
              regionsQuery.refetch(),
              regionGroupsQuery.refetch(),
            ]);
          }}
        />

        <CategorySelector />
      </div>

      <div className="mt-8" />

      <SignupStepButton disabled={isSignupOptionUnavailable}>
        다음
      </SignupStepButton>
    </div>
  );
}
