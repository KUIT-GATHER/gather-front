import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router";

import { CategoryChipGroup } from "@/features/category/components/CategoryChipGroup";
import { RegionSelectionSheet } from "@/features/region/components/RegionSelectionSheet";
import { useRegionsQuery } from "@/features/region/hooks/useRegionsQuery";
import { getFullRegionSelectionLabel } from "@/features/region/lib/regionLabel";
import { teamQueries } from "@/features/team/api/team.queries";
import { MeetingDateTimeField } from "@/features/team/components/form/MeetingDateTimeField";
import { MeetingImageEditorCarousel } from "@/features/team/components/form/MeetingImageEditorCarousel";
import {
  useSaveMeetingImagesMutation,
  useUpdateMeetingMutation,
} from "@/features/team/hooks/useMeetingManagementMutations";
import type { EditableMeetingImage } from "@/features/team/lib/meetingImageEditor";
import {
  getMeetingImageSelectionErrorMessage,
  MAX_MEETING_IMAGE_COUNT,
  validateMeetingImageSelection,
} from "@/features/team/lib/meetingImageValidation";
import { buildMeetingUpdatePayload } from "@/features/team/lib/meetingUpdatePayload";
import {
  meetingUpdateSchema,
  type MeetingUpdateFormValues,
} from "@/features/team/schemas/meetingUpdate.schema";
import type {
  MeetingDetail,
  MeetingHome,
} from "@/features/team/types/team.types";
import Button from "@/shared/ui/Button";
import { ErrorState } from "@/shared/ui/ErrorState";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";
import LoadingState from "@/shared/ui/LoadingState";
import PageHeader from "@/shared/ui/PageHeader";
import Switch from "@/shared/ui/Switch";
import Textarea from "@/shared/ui/Textarea";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";

export function TeamInfoEditScreen({
  home,
  detail,
}: {
  home: MeetingHome;
  detail: MeetingDetail;
}) {
  const navigate = useNavigate();
  const basedOnPosting = detail.volunteerPostingId !== null;
  const regionsQuery = useRegionsQuery();
  const manageImagesQuery = useQuery(teamQueries.manageImages(home.meetingId));
  const updateMutation = useUpdateMeetingMutation(home.meetingId);
  const imagesMutation = useSaveMeetingImagesMutation(home.meetingId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const initializedRef = useRef(false);
  const [images, setImages] = useState<EditableMeetingImage[]>([]);
  const [regionOpen, setRegionOpen] = useState(false);
  const [imageSelectionError, setImageSelectionError] = useState<string | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MeetingUpdateFormValues>({
    resolver: zodResolver(meetingUpdateSchema),
    defaultValues: {
      name: detail.name,
      description: detail.description ?? "",
      maxMember: detail.maxMember,
      deadline: detail.deadline.slice(0, 16),
      categories: detail.categories,
      participationCondition: detail.participationCondition ?? "",
      regionId: detail.regionId,
      timeRecognized: detail.timeRecognized,
    },
  });
  const nameRegister = register("name");
  const descriptionRegister = register("description");
  const participationConditionRegister = register("participationCondition");
  const values = useWatch({ control });
  const pending = updateMutation.isPending || imagesMutation.isPending;
  const selectedRegion = regionsQuery.data?.find(
    (region) => region.id === values.regionId,
  );
  const selectedParent = selectedRegion?.parentId
    ? regionsQuery.data?.find((region) => region.id === selectedRegion.parentId)
    : undefined;

  useEffect(() => {
    if (initializedRef.current || !manageImagesQuery.data) return;
    setImages(
      [...manageImagesQuery.data]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((image) => ({
          ...image,
          id: `remote-${image.objectKey}`,
          source: "remote",
          previewUrl: image.imageUrl,
        })),
    );
    initializedRef.current = true;
  }, [manageImagesQuery.data]);
  useEffect(
    () => () => previewUrlsRef.current.forEach(URL.revokeObjectURL),
    [],
  );

  const addImages = (files: FileList | null) => {
    try {
      if (!files) return;

      const localImages = images.filter(
        (image): image is Extract<EditableMeetingImage, { source: "local" }> =>
          image.source === "local",
      );
      const { acceptedFiles, rejectedReasons } = validateMeetingImageSelection({
        existingImages: localImages,
        existingCount: images.length,
        files: Array.from(files),
      });
      const additions = acceptedFiles.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        previewUrlsRef.current.push(previewUrl);
        return {
          source: "local" as const,
          id: crypto.randomUUID(),
          file,
          previewUrl,
        };
      });

      if (additions.length > 0) {
        setImages((current) => [...current, ...additions]);
      }
      setImageSelectionError(
        rejectedReasons.length > 0
          ? getMeetingImageSelectionErrorMessage(rejectedReasons)
          : null,
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const removeImage = (index: number) => {
    setImages((current) => {
      const target = current[index];
      if (target?.source === "local") URL.revokeObjectURL(target.previewUrl);
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
    setImageSelectionError(null);
  };

  const submit = handleSubmit(async (formValues) => {
    if (formValues.maxMember < home.currentMemberCount) {
      setSubmitError(
        `현재 참여 인원 ${home.currentMemberCount}명보다 작게 설정할 수 없어요.`,
      );
      return;
    }
    setSubmitError(null);
    const payload = buildMeetingUpdatePayload(
      basedOnPosting
        ? {
            basedOnPosting: true,
            name: formValues.name.trim(),
            description: formValues.description.trim() || null,
            maxMember: formValues.maxMember,
            deadline: `${formValues.deadline}:00`,
            participationCondition:
              formValues.participationCondition.trim() || null,
            timeRecognized: formValues.timeRecognized,
          }
        : {
            basedOnPosting: false,
            name: formValues.name.trim(),
            description: formValues.description.trim() || null,
            maxMember: formValues.maxMember,
            deadline: `${formValues.deadline}:00`,
            participationCondition:
              formValues.participationCondition.trim() || null,
            categories: formValues.categories,
            regionId: formValues.regionId,
          },
    );
    try {
      await updateMutation.mutateAsync(payload);
      await imagesMutation.mutateAsync(images);
      navigate(`/teams/${home.meetingId}/settings`, { replace: true });
    } catch {
      setSubmitError(
        "모임 정보를 저장하지 못했어요. 입력 내용과 사진을 확인해 주세요.",
      );
    }
  });

  if (manageImagesQuery.isLoading)
    return (
      <LoadingState className="min-h-dvh" label="모임 정보를 불러오는 중" />
    );
  if (manageImagesQuery.isError)
    return (
      <ErrorState
        className="min-h-dvh"
        title="모임 사진 관리 정보를 불러오지 못했어요"
        primaryAction={{
          label: "다시 시도",
          onClick: () => void manageImagesQuery.refetch(),
        }}
      />
    );

  return (
    <main className="min-h-dvh bg-bg px-5.5">
      <PageHeader
        title="팀 정보 수정"
        onBack={() => setLeaveDialogOpen(true)}
        sticky
      />
      <form className="flex flex-col gap-6 pb-28" noValidate onSubmit={submit}>
        {basedOnPosting ? (
          <FormField label="연관 공고">
            <Input value={home.linkedPostingTitle ?? ""} disabled />
          </FormField>
        ) : null}

        {!basedOnPosting ? (
          <div className="rounded-xl border border-button bg-[#f8fbf8] px-3 py-2.5 text-[13px] leading-5 text-text-gray-400">
            <p>자유 모임은 여러 봉사활동을 함께하는 커뮤니티입니다.</p>
            <p>
              활동별 날짜와 장소는{" "}
              <strong className="font-semibold text-text-green-600">
                모임 생성 후 봉사 모집 글
              </strong>
              에서
            </p>
            <p> 등록할 수 있습니다.</p>
          </div>
        ) : null}

        <FormField
          label="모임 이름"
          required
          htmlFor="meeting-name"
          count={(values.name ?? "").length}
          maxLength={15}
          error={errors.name?.message}
        >
          <Input
            id="meeting-name"
            maxLength={15}
            invalid={Boolean(errors.name)}
            {...nameRegister}
            onChange={(event) => {
              event.target.value = event.target.value.slice(0, 15);
              nameRegister.onChange(event);
            }}
          />
        </FormField>
        <FormField
          label="모임 소개"
          required
          htmlFor="meeting-description"
          count={(values.description ?? "").length}
          maxLength={200}
          error={errors.description?.message}
        >
          <Textarea
            id="meeting-description"
            maxLength={200}
            className="h-36"
            invalid={Boolean(errors.description)}
            {...descriptionRegister}
            onChange={(event) => {
              event.target.value = event.target.value.slice(0, 200);
              descriptionRegister.onChange(event);
            }}
          />
        </FormField>
        <section>
          <button
            type="button"
            disabled={images.length >= MAX_MEETING_IMAGE_COUNT}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-point-green text-button disabled:opacity-40"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="size-5" />
            사진 첨부 (선택, 최대 {MAX_MEETING_IMAGE_COUNT}장)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={(event) => addImages(event.target.files)}
          />
          {imageSelectionError ? (
            <p role="alert" className="mt-2 text-sm text-point-red">
              {imageSelectionError}
            </p>
          ) : null}
          <MeetingImageEditorCarousel images={images} onRemove={removeImage} />
        </section>
        <FormField label="활동 지역" required error={errors.regionId?.message}>
          <button
            type="button"
            disabled={basedOnPosting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-stroke bg-white disabled:opacity-100"
            onClick={() => setRegionOpen(true)}
          >
            <MapPin className="size-4 text-icon" />
            {selectedRegion
              ? getFullRegionSelectionLabel(selectedRegion, selectedParent)
              : home.regionName}
          </button>
        </FormField>
        <FormField
          label="최대 인원 (30명)"
          htmlFor="meeting-max"
          error={errors.maxMember?.message}
        >
          <Input
            id="meeting-max"
            type="number"
            min={home.currentMemberCount}
            max={30}
            className="w-20"
            {...register("maxMember", { valueAsNumber: true })}
          />
        </FormField>
        {basedOnPosting ? (
          <div className="flex h-14 items-center justify-between rounded-xl border border-stroke bg-white px-4">
            <label htmlFor="meeting-time-recognized">봉사 시간 인정 여부</label>
            <Controller
              name="timeRecognized"
              control={control}
              render={({ field }) => (
                <Switch
                  id="meeting-time-recognized"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        ) : null}
        <FormField label="카테고리" required error={errors.categories?.message}>
          <Controller
            name="categories"
            control={control}
            render={({ field }) => (
              <CategoryChipGroup
                value={field.value}
                options={basedOnPosting ? field.value : undefined}
                maxSelected={3}
                disabled={basedOnPosting}
                onChange={field.onChange}
                selectedFirst
              />
            )}
          />
        </FormField>
        <FormField
          label="신청 마감일"
          htmlFor="meeting-deadline"
          error={errors.deadline?.message}
        >
          <Controller
            name="deadline"
            control={control}
            render={({ field }) => (
              <MeetingDateTimeField
                id="meeting-deadline"
                title="신청 마감일"
                value={field.value}
                invalid={Boolean(errors.deadline)}
                onChange={field.onChange}
              />
            )}
          />
        </FormField>
        <FormField
          label="활동 안내 및 참여 조건"
          htmlFor="meeting-condition"
          count={(values.participationCondition ?? "").length}
          maxLength={150}
        >
          <Textarea
            id="meeting-condition"
            maxLength={150}
            className="h-28"
            {...participationConditionRegister}
            onChange={(event) => {
              event.target.value = event.target.value.slice(0, 150);
              participationConditionRegister.onChange(event);
            }}
          />
        </FormField>
        {submitError ? (
          <p role="alert" className="text-sm text-point-red">
            {submitError}
          </p>
        ) : null}
        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "저장 중" : "저장하기"}
        </Button>
      </form>
      <RegionSelectionSheet
        open={regionOpen}
        onOpenChange={setRegionOpen}
        value={values.regionId}
        onApply={(value) =>
          setValue("regionId", value, { shouldValidate: true })
        }
        title="활동 지역"
      />
      <ConfirmDialog
        open={leaveDialogOpen}
        title="뒤로 가면 작성 중인 내용이 사라집니다."
        onCancel={() => setLeaveDialogOpen(false)}
        onConfirm={() => navigate(-1)}
      />
    </main>
  );
}
