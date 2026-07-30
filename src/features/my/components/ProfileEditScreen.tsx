import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router";

import CameraIcon from "@/assets/icons/Camera.svg";
import defaultProfileImage from "@/features/my/assets/profile.png";
import { CategoryPuzzle } from "@/features/category/components/CategoryPuzzle";
import { POSTING_CATEGORY_LABEL } from "@/features/category/constants/postingCategory.constants";
import {
  POSTING_CATEGORIES,
  type PostingCategory,
} from "@/features/category/types/postingCategory.types";
import {
  formatBirthDateInput,
  isAllowedBirthDate,
  normalizeBirthDate,
} from "@/features/auth/lib/signupFormatters";
import {
  useMyProfileImageQuery,
  useMyProfileQuery,
} from "@/features/my/hooks/useMyProfileQuery";
import { useUpdateMyProfileMutation } from "@/features/my/hooks/useUpdateMyProfileMutation";
import { useUploadProfileImageMutation } from "@/features/my/hooks/useUploadProfileImageMutation";
import { getProfileImageValidationError } from "@/features/my/lib/profileImageUpload";
import {
  profileEditSchema,
  type ProfileEditFormValues,
} from "@/features/my/schemas/profileEdit.schema";
import { RegionSelectionSheet } from "@/features/region/components/RegionSelectionSheet";
import { useRegionsQuery } from "@/features/region/hooks/useRegionsQuery";
import { getFullRegionSelectionLabel } from "@/features/region/lib/regionLabel";
import { ApiError } from "@/shared/api/apiError";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";
import { ErrorState } from "@/shared/ui/ErrorState";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";
import LoadingState from "@/shared/ui/LoadingState";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";

const categoryLabelPosition: Partial<Record<PostingCategory, string>> = {
  COMMUNITY: "-translate-x-1 translate-y-1",
  CULTURE: "-translate-x-1 -translate-y-1",
};

export function ProfileEditScreen() {
  const navigate = useNavigate();
  const profileQuery = useMyProfileQuery();
  const profileImageQuery = useMyProfileImageQuery();
  const regionsQuery = useRegionsQuery();
  const updateProfileMutation = useUpdateMyProfileMutation();
  const uploadImageMutation = useUploadProfileImageMutation();
  const [isRegionSheetOpen, setIsRegionSheetOpen] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null,
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      name: "",
      nickname: "",
      introduction: "",
      birthDate: "",
      gender: "MALE",
      activityRegionId: 0,
      interestCategories: [],
    },
  });

  const {
    control,
    register,
    reset,
    setError,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = form;

  const introduction = useWatch({ control, name: "introduction" });
  const activityRegionId = useWatch({ control, name: "activityRegionId" });
  const selectedCategories = useWatch({
    control,
    name: "interestCategories",
  });

  useEffect(() => {
    if (!profileQuery.data) return;

    reset({
      name: profileQuery.data.name,
      nickname: profileQuery.data.nickname,
      introduction: profileQuery.data.introduction ?? "",
      birthDate: profileQuery.data.birthDate,
      gender: profileQuery.data.gender,
      activityRegionId: profileQuery.data.activityRegion.id,
      interestCategories: profileQuery.data.interestCategories,
    });
  }, [profileQuery.data, reset]);

  useEffect(() => {
    if (!profileImageFile) {
      setProfileImagePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(profileImageFile);
    setProfileImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [profileImageFile]);

  const regionById = useMemo(
    () =>
      new Map((regionsQuery.data ?? []).map((region) => [region.id, region])),
    [regionsQuery.data],
  );
  const selectedRegion = regionById.get(activityRegionId);
  const selectedRegionParent = selectedRegion?.parentId
    ? regionById.get(selectedRegion.parentId)
    : undefined;
  const regionLabel = selectedRegion
    ? getFullRegionSelectionLabel(selectedRegion, selectedRegionParent)
    : profileQuery.data?.activityRegion.id === activityRegionId
      ? profileQuery.data.activityRegion.name
      : "활동 지역을 선택해 주세요";
  const displayedProfileImage =
    profileImagePreview ||
    profileImageQuery.data?.profileImageUrl ||
    defaultProfileImage;
  const isSaving =
    updateProfileMutation.isPending || uploadImageMutation.isPending;

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await updateProfileMutation.mutateAsync(values);
      if (profileImageFile) {
        await uploadImageMutation.mutateAsync(profileImageFile);
      }
      navigate("/my", { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.code === "DUPLICATE_NICKNAME") {
        setError("nickname", {
          type: "server",
          message: "이미 사용 중인 닉네임입니다.",
        });
        return;
      }

      setSubmitError(
        error instanceof Error
          ? error.message
          : "프로필을 저장하지 못했어요. 다시 시도해 주세요.",
      );
    }
  });

  if (profileQuery.isLoading || profileImageQuery.isLoading) {
    return (
      <PageContainer className="flex min-h-dvh items-center justify-center">
        <LoadingState label="프로필을 불러오는 중이에요." />
      </PageContainer>
    );
  }

  if (profileQuery.isError || profileImageQuery.isError) {
    return (
      <PageContainer className="flex min-h-dvh items-center justify-center">
        <ErrorState
          title="프로필을 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요."
          primaryAction={{
            label: "다시 시도",
            onClick: () => {
              void profileQuery.refetch();
              void profileImageQuery.refetch();
            },
          }}
          secondaryAction={{ label: "돌아가기", onClick: () => navigate(-1) }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="min-h-dvh bg-bg pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
      <PageHeader title="프로필 편집" onBack={() => navigate(-1)} sticky />

      <form noValidate onSubmit={submit} className="pt-2">
        <div className="flex justify-center">
          <label className="relative block size-[95px] cursor-pointer rounded-full focus-within:ring-2 focus-within:ring-button/40">
            <img
              src={displayedProfileImage}
              alt="프로필 이미지"
              className="size-full rounded-full object-cover"
            />
            <span className="absolute -bottom-0.5 -right-0.5 grid size-8 place-items-center rounded-full bg-white shadow">
              <img src={CameraIcon} alt="" className="size-5" />
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;

                const validationError = getProfileImageValidationError(file);
                setImageError(validationError);
                if (!validationError) setProfileImageFile(file);
                event.target.value = "";
              }}
            />
          </label>
        </div>
        {imageError ? (
          <p className="mt-2 text-center text-xs text-point-red">
            {imageError}
          </p>
        ) : null}

        <div className="mt-7 space-y-6">
          <FormField
            htmlFor="nickname"
            label="닉네임"
            error={errors.nickname?.message}
            labelClassName="mb-3 text-[15px] font-semibold leading-5"
          >
            <Input
              id="nickname"
              maxLength={20}
              invalid={Boolean(errors.nickname)}
              {...register("nickname")}
            />
          </FormField>

          <FormField
            htmlFor="name"
            label="이름"
            error={errors.name?.message}
            labelClassName="mb-3 text-[15px] font-semibold leading-5"
          >
            <Input
              id="name"
              maxLength={20}
              invalid={Boolean(errors.name)}
              {...register("name")}
            />
          </FormField>

          <FormField
            htmlFor="introduction"
            label="소개"
            count={introduction.length}
            maxLength={50}
            error={errors.introduction?.message}
            labelClassName="mb-3 text-[15px] font-semibold leading-5"
          >
            <Input
              id="introduction"
              placeholder="소개를 입력해 주세요"
              maxLength={50}
              invalid={Boolean(errors.introduction)}
              {...register("introduction")}
            />
          </FormField>

          <fieldset>
            <legend className="mb-3 text-[15px] font-semibold leading-5 text-text">
              생년월일 / 성별
            </legend>
            <div className="flex gap-3">
              <Controller
                control={control}
                name="birthDate"
                render={({ field }) => (
                  <Input
                    ref={field.ref}
                    name={field.name}
                    onBlur={field.onBlur}
                    inputMode="numeric"
                    autoComplete="bday"
                    value={formatBirthDateInput(field.value)}
                    invalid={Boolean(errors.birthDate)}
                    onChange={(event) => {
                      const value = normalizeBirthDate(event.target.value);
                      field.onChange(value);
                      if (isAllowedBirthDate(value)) clearErrors("birthDate");
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
                    className="grid h-12 w-26 shrink-0 grid-cols-2 overflow-hidden rounded-xl border border-button"
                  >
                    {(
                      [
                        ["MALE", "남"],
                        ["FEMALE", "여"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={field.value === value}
                        className={cn(
                          "grid place-items-center text-[15px] font-medium",
                          field.value === value
                            ? "bg-button/15 text-text"
                            : "bg-white text-text-gray-100",
                        )}
                        onClick={() => field.onChange(value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>
            {errors.birthDate?.message || errors.gender?.message ? (
              <p className="mt-1.5 text-xs text-point-red">
                {errors.birthDate?.message ?? errors.gender?.message}
              </p>
            ) : null}
          </fieldset>

          <section>
            <h2 className="text-[15px] font-semibold leading-5 text-text">
              활동 지역 <span className="text-point-red">*</span>
            </h2>
            <button
              type="button"
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-stroke bg-white px-4 text-sm font-medium text-text focus:border-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
              onClick={() => setIsRegionSheetOpen(true)}
            >
              <MapPin className="size-4 text-icon" aria-hidden="true" />
              {regionLabel}
            </button>
            {errors.activityRegionId?.message ? (
              <p className="mt-1.5 text-xs text-point-red">
                {errors.activityRegionId.message}
              </p>
            ) : null}
          </section>

          <section>
            <h2 className="text-[15px] font-semibold leading-5 text-text">
              관심 카테고리
            </h2>
            <div className="mt-3 grid grid-cols-3 gap-x-2 gap-y-3">
              {POSTING_CATEGORIES.map((category) => {
                const selected = selectedCategories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={selected}
                    className="relative grid min-h-24 place-items-center rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                    onClick={() => {
                      const next = selected
                        ? selectedCategories.filter(
                            (value) => value !== category,
                          )
                        : [...selectedCategories, category];
                      setValue("interestCategories", next, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  >
                    <CategoryPuzzle
                      category={category}
                      selected={selected}
                      className="size-[92px]"
                    />
                    <span
                      className={cn(
                        "pointer-events-none absolute inset-0 grid place-items-center px-2 text-center text-[15px] font-medium text-text",
                        categoryLabelPosition[category],
                      )}
                    >
                      {POSTING_CATEGORY_LABEL[category]}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.interestCategories?.message ? (
              <p className="mt-1.5 text-xs text-point-red">
                {errors.interestCategories.message}
              </p>
            ) : null}
          </section>
        </div>

        {submitError ? (
          <p role="alert" className="mt-6 text-center text-sm text-point-red">
            {submitError}
          </p>
        ) : null}

        <Button
          type="submit"
          fullWidth
          disabled={isSaving}
          className="mt-8 h-12"
        >
          {isSaving ? "저장 중..." : "저장하기"}
        </Button>
      </form>

      <RegionSelectionSheet
        open={isRegionSheetOpen}
        onOpenChange={setIsRegionSheetOpen}
        title="활동 지역"
        value={activityRegionId || undefined}
        onApply={(regionId) => {
          setValue("activityRegionId", regionId, {
            shouldDirty: true,
            shouldValidate: true,
          });
          clearErrors("activityRegionId");
        }}
      />
    </PageContainer>
  );
}
