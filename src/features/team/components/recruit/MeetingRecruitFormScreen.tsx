import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router";

import { MobileBottomNavigation } from "@/app/navigation/MobileBottomNavigation";
import { CategoryChipGroup } from "@/features/category/components/CategoryChipGroup";
import { RegionSelectionSheet } from "@/features/region/components/RegionSelectionSheet";
import { useRegionsQuery } from "@/features/region/hooks/useRegionsQuery";
import { getFullRegionSelectionLabel } from "@/features/region/lib/regionLabel";
import { MeetingDateTimeField } from "@/features/team/components/form/MeetingDateTimeField";
import {
  useCreateMeetingRecruitMutation,
  useUpdateMeetingRecruitMutation,
} from "@/features/team/hooks/useMeetingRecruitMutations";
import {
  meetingRecruitSchema,
  type MeetingRecruitFormValues,
} from "@/features/team/schemas/meetingRecruit.schema";
import type {
  MeetingRecruitDetail,
  MeetingRecruitRequest,
} from "@/features/team/types/meetingRecruit.types";
import {
  formatLocalDateTimeForApi,
  parseLocalDateTimeInput,
} from "@/shared/lib/localDateTime";
import Button from "@/shared/ui/Button";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";
import Switch from "@/shared/ui/Switch";
import Textarea from "@/shared/ui/Textarea";

type MeetingRecruitFormScreenProps = {
  meetingId: number;
  recruit?: MeetingRecruitDetail;
};

function toApiDateTime(value: string) {
  const date = parseLocalDateTimeInput(value);
  if (!date) throw new Error("Invalid local datetime");
  return formatLocalDateTimeForApi(date)!;
}

export function MeetingRecruitFormScreen({
  meetingId,
  recruit,
}: MeetingRecruitFormScreenProps) {
  const navigate = useNavigate();
  const regionsQuery = useRegionsQuery();
  const createMutation = useCreateMeetingRecruitMutation(meetingId);
  const updateMutation = useUpdateMeetingRecruitMutation(
    meetingId,
    recruit?.postId ?? 0,
  );
  const [regionOpen, setRegionOpen] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MeetingRecruitFormValues>({
    resolver: zodResolver(meetingRecruitSchema),
    defaultValues: {
      title: recruit?.title ?? "",
      content: recruit?.content ?? "",
      participationCondition: recruit?.participationCondition ?? "",
      regionId: recruit?.regionId ?? 0,
      place: recruit?.place ?? "",
      activityStartAt: recruit?.activityStartAt.slice(0, 16) ?? "",
      activityEndAt: recruit?.activityEndAt.slice(0, 16) ?? "",
      maxParticipants: recruit?.maxParticipants ?? 10,
      categories: recruit?.categories ?? [],
      timeRecognized: recruit?.timeRecognized ?? false,
      recognizedMinutes: recruit?.recognizedMinutes ?? null,
      applyDeadlineAt: recruit?.applyDeadlineAt.slice(0, 16) ?? "",
      external: recruit?.external ?? false,
    },
  });
  const values = useWatch({ control });
  const region = regionsQuery.data?.find((item) => item.id === values.regionId);
  const parent = region?.parentId
    ? regionsQuery.data?.find((item) => item.id === region.parentId)
    : undefined;
  const pending = createMutation.isPending || updateMutation.isPending;

  const submit = handleSubmit(async (formValues) => {
    const request: MeetingRecruitRequest = {
      ...formValues,
      title: formValues.title.trim(),
      content: formValues.content.trim(),
      participationCondition: formValues.participationCondition.trim() || null,
      place: formValues.place.trim(),
      activityStartAt: toApiDateTime(formValues.activityStartAt),
      activityEndAt: toApiDateTime(formValues.activityEndAt),
      applyDeadlineAt: toApiDateTime(formValues.applyDeadlineAt),
      recognizedMinutes: formValues.timeRecognized
        ? formValues.recognizedMinutes
        : null,
    };
    try {
      const result = recruit
        ? await updateMutation.mutateAsync(request)
        : await createMutation.mutateAsync(request);
      navigate(`/teams/${meetingId}/posts/${result.postId}`, { replace: true });
    } catch {
      return;
    }
  });

  return (
    <PageContainer className="min-h-dvh pb-32">
      <PageHeader
        title={recruit ? "모집 공고 수정" : "모집 공고"}
        onBack={() => navigate(-1)}
      />
      <form className="flex flex-col gap-6 pt-5" noValidate onSubmit={submit}>
        <div className="flex min-h-20 items-center gap-3 rounded-xl border border-stroke bg-white px-4">
          <Controller
            name="external"
            control={control}
            render={({ field }) => (
              <input
                id="external"
                type="checkbox"
                className="size-5 accent-button"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <label htmlFor="external">
            <span className="block text-sm font-semibold">
              외부 공고로 등록하기
            </span>
            <span className="mt-1 block text-xs text-text-gray-300">
              팀 외부 사용자에게도 이 활동을 공개해요
            </span>
          </label>
        </div>
        <FormField
          label="활동 제목"
          required
          htmlFor="recruit-title"
          count={(values.title ?? "").length}
          maxLength={15}
          error={errors.title?.message}
        >
          <Input
            id="recruit-title"
            maxLength={15}
            placeholder="활동 제목을 입력하세요"
            invalid={Boolean(errors.title)}
            {...register("title")}
          />
        </FormField>
        <FormField
          label="활동 소개"
          required
          htmlFor="recruit-content"
          count={(values.content ?? "").length}
          maxLength={1000}
          error={errors.content?.message}
        >
          <Textarea
            id="recruit-content"
            maxLength={1000}
            className="h-40"
            placeholder="활동에 대해 자세히 설명해 주세요"
            invalid={Boolean(errors.content)}
            {...register("content")}
          />
        </FormField>
        <FormField label="지역" required error={errors.regionId?.message}>
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-stroke bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
            onClick={() => setRegionOpen(true)}
          >
            <MapPin className="size-4 text-icon" />{" "}
            {region
              ? getFullRegionSelectionLabel(region, parent)
              : "지역을 선택해 주세요"}
          </button>
        </FormField>
        <FormField
          label="상세 장소"
          required
          htmlFor="recruit-place"
          error={errors.place?.message}
        >
          <Input
            id="recruit-place"
            placeholder="활동 장소를 입력하세요"
            invalid={Boolean(errors.place)}
            {...register("place")}
          />
        </FormField>
        <div className="grid gap-4">
          {(["activityStartAt", "activityEndAt"] as const).map((name) => (
            <FormField
              key={name}
              label={name === "activityStartAt" ? "시작일시" : "종료일시"}
              required
              htmlFor={name}
              error={errors[name]?.message}
            >
              <Controller
                name={name}
                control={control}
                render={({ field }) => (
                  <MeetingDateTimeField
                    id={name}
                    title={name === "activityStartAt" ? "시작일시" : "종료일시"}
                    value={field.value}
                    invalid={Boolean(errors[name])}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>
          ))}
        </div>
        <FormField
          label="최대 인원 (50명)"
          required
          htmlFor="max-participants"
          error={errors.maxParticipants?.message}
        >
          <Input
            id="max-participants"
            type="number"
            min={1}
            max={50}
            invalid={Boolean(errors.maxParticipants)}
            {...register("maxParticipants", { valueAsNumber: true })}
          />
        </FormField>
        <FormField
          label="카테고리"
          required
          error={errors.categories?.message}
          description="최대 3개까지 선택할 수 있습니다."
        >
          <Controller
            name="categories"
            control={control}
            render={({ field }) => (
              <CategoryChipGroup
                value={field.value}
                onChange={field.onChange}
                maxSelected={3}
              />
            )}
          />
        </FormField>
        <div className="flex h-14 items-center justify-between rounded-xl border border-stroke bg-white px-4">
          <label htmlFor="time-recognized" className="text-sm font-semibold">
            봉사 시간 인정 여부
          </label>
          <Controller
            name="timeRecognized"
            control={control}
            render={({ field }) => (
              <Switch
                id="time-recognized"
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  if (!checked) setValue("recognizedMinutes", null);
                }}
              />
            )}
          />
        </div>
        {values.timeRecognized ? (
          <FormField
            label="인정 시간(분)"
            required
            htmlFor="recognized-minutes"
            error={errors.recognizedMinutes?.message}
          >
            <Input
              id="recognized-minutes"
              type="number"
              min={1}
              invalid={Boolean(errors.recognizedMinutes)}
              {...register("recognizedMinutes", {
                setValueAs: (value) => (value === "" ? null : Number(value)),
              })}
            />
          </FormField>
        ) : null}
        <FormField
          label="신청 마감일"
          required
          htmlFor="applyDeadlineAt"
          error={errors.applyDeadlineAt?.message}
        >
          <Controller
            name="applyDeadlineAt"
            control={control}
            render={({ field }) => (
              <MeetingDateTimeField
                id="applyDeadlineAt"
                title="신청 마감일"
                value={field.value}
                invalid={Boolean(errors.applyDeadlineAt)}
                onChange={field.onChange}
              />
            )}
          />
        </FormField>
        <FormField
          label="참여 조건"
          htmlFor="participation-condition"
          error={errors.participationCondition?.message}
        >
          <Input
            id="participation-condition"
            maxLength={255}
            placeholder="예: 만 14세 이상, 편한 복장 필수"
            invalid={Boolean(errors.participationCondition)}
            {...register("participationCondition")}
          />
        </FormField>
        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "저장 중" : recruit ? "저장하기" : "등록하기"}
        </Button>
      </form>
      <RegionSelectionSheet
        open={regionOpen}
        onOpenChange={setRegionOpen}
        value={values.regionId || undefined}
        onApply={(regionId) =>
          setValue("regionId", regionId, { shouldValidate: true })
        }
        title="활동 지역"
      />
      <MobileBottomNavigation />
    </PageContainer>
  );
}
