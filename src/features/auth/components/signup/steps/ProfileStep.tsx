import { useFormContext, useWatch } from "react-hook-form";

import {
  getSignupFieldDescribedBy,
  getSignupFieldErrorId,
} from "@/features/auth/lib/signupFieldA11y";
import type { SignupCommonFormValues } from "@/features/auth/schemas/signupCommon.schema";
import { ProfileImagePicker } from "@/features/profile/components/ProfileImagePicker";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";

import { CategorySelector } from "./CategorySelector";
import { RegionSelector } from "./RegionSelector";
import { SignupStepButton } from "../SignupFormParts";

type ProfileStepProps = {
  profileImageFile: File | null;
  onProfileImageFileChange: (file: File | null) => void;
};

export function ProfileStep({
  profileImageFile,
  onProfileImageFileChange,
}: ProfileStepProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<SignupCommonFormValues>();
  const introduction = useWatch({ control, name: "introduction" });

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-center">
        <ProfileImagePicker
          file={profileImageFile}
          onFileChange={onProfileImageFileChange}
          className="size-29"
          alt={
            profileImageFile
              ? "선택한 프로필 이미지 미리보기"
              : "기본 프로필 이미지"
          }
        />
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

        <RegionSelector />

        <CategorySelector />
      </div>

      <div className="mt-8" />

      <SignupStepButton>다음</SignupStepButton>
    </div>
  );
}
