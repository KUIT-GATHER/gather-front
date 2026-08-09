import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { MobileBottomNavigation } from "@/app/navigation/MobileBottomNavigation";

import locationIcon from "@/shared/assets/icons/info/location.svg";
import { CategoryChipGroup } from "@/features/category/components/CategoryChipGroup";
import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import { RegionSelectionSheet } from "@/features/region/components/RegionSelectionSheet";
import { useRegionsQuery } from "@/features/region/hooks/useRegionsQuery";
import { getFullRegionSelectionLabel } from "@/features/region/lib/regionLabel";
import { MeetingDateTimeField } from "@/features/team/components/form/MeetingDateTimeField";
import { MeetingImageEditorCarousel } from "@/features/team/components/form/MeetingImageEditorCarousel";
import { useCreateMeetingMutation } from "@/features/team/hooks/useCreateMeetingMutation";
import { useUploadMeetingImagesMutation } from "@/features/team/hooks/useUploadMeetingImagesMutation";
import { ensureMeetingCreated } from "@/features/team/lib/meetingCreateWorkflow";
import { buildMeetingCreateDateTimePayload } from "@/features/team/lib/meetingCreatePayload";
import { getMeetingImageUploadErrorMessage } from "@/features/team/lib/meetingImageUpload";
import {
  getMeetingImageSelectionErrorMessage,
  validateMeetingImageSelection,
} from "@/features/team/lib/meetingImageValidation";
import type { LocalMeetingImage } from "@/features/team/types/meetingImage.types";
import { useVolunteerPostingDetail } from "@/features/volunteer/hooks/detail/useVolunteerPostingDetail";
import {
  combineLocalDateAndTime,
  formatLocalDateTimeForInput,
  parseLocalDateTimeInput,
} from "@/shared/lib/localDateTime";
import Button from "@/shared/ui/Button";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";
import Switch from "@/shared/ui/Switch";
import Textarea from "@/shared/ui/Textarea";

const NAME_MAX_LENGTH = 15;
const DESCRIPTION_MAX_LENGTH = 200;
const MAX_MEMBER = 30;
const PARTICIPATION_CONDITION_MAX_LENGTH = 150;
const TEAM_CREATE_MAX_IMAGE_COUNT = 1;
const TEAM_CREATE_IMAGE_COUNT_ERROR_MESSAGE = `사진은 최대 ${TEAM_CREATE_MAX_IMAGE_COUNT}장까지 첨부할 수 있어요.`;

type MeetingCreatePhase =
  | "editing"
  | "creating"
  | "uploading"
  | "applying"
  | "uploadFailed";

type FormErrors = Partial<
  Record<
    "name" | "description" | "region" | "categories" | "deadline" | "activity",
    string
  >
>;

export function TeamCreateScreen() {
  const navigate = useNavigate();
  const { volunteerId } = useParams();
  const postingId = Number(volunteerId);
  const isPostingBased = Number.isInteger(postingId) && postingId > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUrlsRef = useRef(new Set<string>());
  const workflowInFlightRef = useRef(false);
  const regionsQuery = useRegionsQuery();
  const createMeetingMutation = useCreateMeetingMutation();
  const uploadMeetingImagesMutation = useUploadMeetingImagesMutation();
  const postingQuery = useVolunteerPostingDetail(
    isPostingBased ? postingId : undefined,
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [regionId, setRegionId] = useState("");
  const [maxMember, setMaxMember] = useState("30");
  const [categories, setCategories] = useState<PostingCategory[]>([]);
  const [deadline, setDeadline] = useState("");
  const [participationCondition, setParticipationCondition] = useState("");
  const [isTimeRecognized, setIsTimeRecognized] = useState(true);
  const [images, setImages] = useState<LocalMeetingImage[]>([]);
  const [createdMeetingId, setCreatedMeetingId] = useState<number | null>(null);
  const [createPhase, setCreatePhase] = useState<MeetingCreatePhase>("editing");
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(
    null,
  );
  const [imageSelectionError, setImageSelectionError] = useState<string | null>(
    null,
  );
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isRegionSheetOpen, setIsRegionSheetOpen] = useState(false);

  const postingNoticeDeadline = postingQuery.data?.noticeEndDate
    ? parseLocalDateTimeInput(`${postingQuery.data.noticeEndDate}T23:59`)
    : undefined;
  const postingActivityStartAt = combineLocalDateAndTime(
    postingQuery.data?.actStartDate ?? null,
    postingQuery.data?.actStartTime ?? null,
  );
  const postingActivityStart = postingActivityStartAt
    ? parseLocalDateTimeInput(postingActivityStartAt.slice(0, 16))
    : undefined;
  const postingMaxDeadline =
    postingNoticeDeadline && postingActivityStart
      ? new Date(
          Math.min(
            postingNoticeDeadline.getTime(),
            postingActivityStart.getTime(),
          ),
        )
      : (postingNoticeDeadline ?? postingActivityStart);
  const postingDefaultDeadline = postingMaxDeadline
    ? formatLocalDateTimeForInput(postingMaxDeadline)
    : undefined;
  const resolvedRegionId =
    regionId ||
    (isPostingBased && postingQuery.data?.regionId
      ? String(postingQuery.data.regionId)
      : "");
  const resolvedCategories = categories;
  const resolvedDeadline = deadline || (postingDefaultDeadline ?? "");
  const regions = useMemo(() => regionsQuery.data ?? [], [regionsQuery.data]);
  const regionById = useMemo(
    () => new Map(regions.map((region) => [region.id, region])),
    [regions],
  );
  const selectedRegion = resolvedRegionId
    ? regionById.get(Number(resolvedRegionId))
    : undefined;
  const maxMemberLimit = MAX_MEMBER;
  const selectedRegionParent = selectedRegion?.parentId
    ? regionById.get(selectedRegion.parentId)
    : undefined;
  const isFormLocked = createPhase !== "editing";
  const areImageControlsDisabled =
    createPhase === "creating" ||
    createPhase === "uploading" ||
    createPhase === "applying";

  useEffect(
    () => () => {
      imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      imageUrlsRef.current.clear();
    },
    [],
  );

  const clearError = (field: keyof FormErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleImageChange = (files: FileList | null) => {
    try {
      if (!files) return;

      const selectedFiles = Array.from(files);
      const remainingCount = Math.max(
        0,
        TEAM_CREATE_MAX_IMAGE_COUNT - images.length,
      );
      const filesWithinLimit = selectedFiles.slice(0, remainingCount);
      const { acceptedFiles, rejectedReasons } = validateMeetingImageSelection({
        existingImages: images,
        files: filesWithinLimit,
      });
      const nextImages = acceptedFiles.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        imageUrlsRef.current.add(previewUrl);

        return {
          id: crypto.randomUUID(),
          file,
          previewUrl,
        };
      });

      if (nextImages.length > 0) {
        setImages((current) => [...current, ...nextImages]);
      }

      setImageSelectionError(
        rejectedReasons.length > 0
          ? getMeetingImageSelectionErrorMessage(rejectedReasons)
          : selectedFiles.length > filesWithinLimit.length
            ? TEAM_CREATE_IMAGE_COUNT_ERROR_MESSAGE
            : null,
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((current) => {
      const target = current[index];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        imageUrlsRef.current.delete(target.previewUrl);
      }
      return current.filter((_, imageIndex) => imageIndex !== index);
    });
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = "모임 이름을 입력해 주세요.";
    if (!description.trim())
      nextErrors.description = "모임 소개를 입력해 주세요.";
    if (!resolvedRegionId) nextErrors.region = "활동 지역을 선택해 주세요.";
    if (resolvedCategories.length === 0)
      nextErrors.categories = "카테고리를 1개 이상 선택해 주세요.";
    else if (resolvedCategories.length > 3)
      nextErrors.categories = "카테고리는 최대 3개까지 선택할 수 있습니다.";
    if (!resolvedDeadline) nextErrors.deadline = "신청 마감일을 선택해 주세요.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const navigateToCompletePage = (meetingId: number) => {
    const completeSearchParams = new URLSearchParams({
      meetingId: String(meetingId),
    });
    if (isPostingBased) {
      completeSearchParams.set("volunteerPostingId", String(postingId));
    }
    navigate(`/teams/new/complete?${completeSearchParams.toString()}`, {
      replace: true,
    });
  };

  const uploadImagesForMeeting = async (
    meetingId: number,
    imagesToUpload: LocalMeetingImage[],
  ) => {
    if (imagesToUpload.length === 0) {
      navigateToCompletePage(meetingId);
      return;
    }

    setCreatePhase("uploading");
    setUploadingImageIndex(null);
    setImageUploadError(null);

    try {
      await uploadMeetingImagesMutation.mutateAsync({
        meetingId,
        images: imagesToUpload,
        onUploadStart: (index) => {
          setCreatePhase("uploading");
          setUploadingImageIndex(index);
        },
        onImageUploaded: (imageId, objectKey) => {
          setImages((current) =>
            current.map((image) =>
              image.id === imageId
                ? { ...image, uploadedObjectKey: objectKey }
                : image,
            ),
          );
        },
        onApplying: () => {
          setCreatePhase("applying");
          setUploadingImageIndex(null);
        },
      });
      navigateToCompletePage(meetingId);
    } catch (error) {
      setCreatePhase("uploadFailed");
      setUploadingImageIndex(null);
      setImageUploadError(getMeetingImageUploadErrorMessage(error));
    }
  };

  const retryImageUpload = async () => {
    if (createdMeetingId === null || workflowInFlightRef.current) return;

    workflowInFlightRef.current = true;
    try {
      await uploadImagesForMeeting(createdMeetingId, images);
    } finally {
      workflowInFlightRef.current = false;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (createdMeetingId !== null) {
      await retryImageUpload();
      return;
    }

    if (
      workflowInFlightRef.current ||
      !validate() ||
      resolvedCategories.length === 0
    ) {
      return;
    }

    const deadlineDate = parseLocalDateTimeInput(resolvedDeadline);
    if (
      deadlineDate &&
      postingActivityStart &&
      deadlineDate > postingActivityStart
    ) {
      setErrors((current) => ({
        ...current,
        deadline: "모집 마감일은 활동 시작 시간 이전으로 선택해 주세요.",
      }));
      return;
    }

    const dateTimePayload = deadlineDate
      ? buildMeetingCreateDateTimePayload({
          deadline: deadlineDate,
          volunteerPostingId: isPostingBased ? postingId : null,
          activityStartDate: postingQuery.data?.actStartDate ?? null,
          activityStartTime: postingQuery.data?.actStartTime ?? null,
          activityEndDate: postingQuery.data?.actEndDate ?? null,
          activityEndTime: postingQuery.data?.actEndTime ?? null,
        })
      : undefined;

    if (!dateTimePayload) {
      const errorKey: keyof FormErrors = deadlineDate ? "activity" : "deadline";
      setErrors((current) => ({
        ...current,
        [errorKey]:
          errorKey === "deadline"
            ? "신청 마감일을 다시 선택해 주세요."
            : "연관 공고의 활동 날짜와 시간을 확인해 주세요.",
      }));
      return;
    }

    workflowInFlightRef.current = true;
    setCreatePhase("creating");

    try {
      const meetingId = await ensureMeetingCreated({
        createdMeetingId,
        createMeeting: () =>
          createMeetingMutation.mutateAsync({
            name: name.trim(),
            description: description.trim(),
            maxMember: Math.min(
              maxMemberLimit,
              Math.max(2, Number.parseInt(maxMember, 10) || 2),
            ),
            regionId: Number(resolvedRegionId),
            categories: resolvedCategories,
            participationCondition: participationCondition.trim() || null,
            volunteerPostingId: isPostingBased ? postingId : null,
            timeRecognized: isPostingBased ? isTimeRecognized : false,
            ...dateTimePayload,
          }),
      });

      setCreatedMeetingId(meetingId);
      await uploadImagesForMeeting(meetingId, images);
    } catch {
      setCreatePhase("editing");
      // Mutation state renders the request error below the form.
    } finally {
      workflowInFlightRef.current = false;
    }
  };

  return (
    <PageContainer size="narrow" className="min-h-dvh pb-48">
      <PageHeader
        title={isPostingBased ? "공고 기반 모임 만들기" : "자유 모임 만들기"}
        onBack={() => navigate(-1)}
      />

      {isPostingBased ? null : (
        <div className="rounded-xl border border-button bg-[#f8fbf8] px-3 py-2.5 text-[13px] leading-5 text-text-gray-400">
          <p>자유 모임은 여러 봉사활동을 함께하는 커뮤니티입니다.</p>
          <p>
            활동별 날짜와 장소는{" "}
            <strong className="font-semibold text-text-green-600">
              모임 생성 후 봉사 모집 글
            </strong>
            에서 등록할 수 있습니다.
          </p>
        </div>
      )}

      {createdMeetingId !== null ? (
        <p className="mt-4 rounded-xl border border-button bg-[#f8fbf8] px-3 py-2.5 text-sm leading-5 text-text-gray-400">
          모임이 생성되어 입력 내용을 수정할 수 없어요. 사진 등록을 완료하거나
          사진 없이 완료해 주세요.
        </p>
      ) : null}

      <form className="mt-5 flex flex-col gap-6" onSubmit={handleSubmit}>
        {isPostingBased ? (
          <FormField
            label="연관 공고"
            labelClassName="mb-2 font-medium"
            error={errors.activity}
          >
            <div className="flex h-12 items-center rounded-xl border border-stroke bg-white px-4 text-[15px] text-text">
              {postingQuery.isLoading
                ? "공고 정보를 불러오는 중이에요."
                : postingQuery.isError
                  ? "공고 정보를 불러오지 못했어요."
                  : postingQuery.data?.title || "연관 공고"}
            </div>
          </FormField>
        ) : null}
        <FormField
          label="모임 이름"
          labelClassName="mb-2 font-medium"
          required
          htmlFor="meeting-name"
          count={name.length}
          maxLength={NAME_MAX_LENGTH}
          error={errors.name}
        >
          <Input
            id="meeting-name"
            value={name}
            disabled={isFormLocked}
            maxLength={NAME_MAX_LENGTH}
            invalid={Boolean(errors.name)}
            placeholder="모임 이름을 입력해 주세요."
            onChange={(event) => {
              setName(event.target.value);
              clearError("name");
            }}
          />
        </FormField>
        <FormField
          label="모임 소개"
          labelClassName="mb-2 font-medium"
          required
          htmlFor="meeting-description"
          count={description.length}
          maxLength={DESCRIPTION_MAX_LENGTH}
          error={errors.description}
        >
          <Textarea
            id="meeting-description"
            value={description}
            disabled={isFormLocked}
            maxLength={DESCRIPTION_MAX_LENGTH}
            invalid={Boolean(errors.description)}
            placeholder="모임을 소개해주세요."
            className="h-36"
            onChange={(event) => {
              setDescription(event.target.value);
              clearError("description");
            }}
          />
        </FormField>
        <section aria-labelledby="meeting-image-label">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl border border-dashed border-point-green bg-[#f8fbf8] px-4 py-3 text-left text-base font-semibold text-text-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              areImageControlsDisabled ||
              images.length >= TEAM_CREATE_MAX_IMAGE_COUNT
            }
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus aria-hidden="true" className="size-6" />
            <span id="meeting-image-label">
              사진 첨부 (선택, 최대 {TEAM_CREATE_MAX_IMAGE_COUNT}장)
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={areImageControlsDisabled}
            className="sr-only"
            onChange={(event) => handleImageChange(event.target.files)}
          />
          {imageSelectionError ? (
            <p role="alert" className="mt-2 text-sm text-point-red">
              {imageSelectionError}
            </p>
          ) : null}
          {createPhase === "uploadFailed" ? (
            <p role="alert" className="mt-2 text-sm text-point-red">
              모임은 생성됐지만 사진 업로드에 실패했어요. {imageUploadError}
            </p>
          ) : null}
          <MeetingImageEditorCarousel
            images={images}
            disabled={areImageControlsDisabled}
            onRemove={removeImage}
          />
        </section>
        <FormField
          label="활동 지역"
          labelClassName="mb-2 font-medium"
          required
          error={errors.region}
        >
          <button
            type="button"
            disabled={isPostingBased || isFormLocked}
            className="relative flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-stroke bg-white px-4 text-sm font-medium text-text focus:border-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40 disabled:opacity-100"
            onClick={() => setIsRegionSheetOpen(true)}
          >
            <img
              src={locationIcon}
              alt=""
              aria-hidden="true"
              className="h-4 w-3"
            />
            {isPostingBased
              ? postingQuery.data?.actPlace ||
                postingQuery.data?.regionName ||
                "공고 장소 정보가 없어요"
              : selectedRegion
                ? getFullRegionSelectionLabel(
                    selectedRegion,
                    selectedRegionParent,
                  )
                : "활동 지역을 선택해 주세요"}
          </button>
        </FormField>{" "}
        <FormField
          label={
            <>
              최대 인원{" "}
              <span className="text-[15px]">({maxMemberLimit}명)</span>
            </>
          }
          labelClassName="mb-2 font-medium"
          htmlFor="max-member"
        >
          <div className="relative w-18">
            <Input
              id="max-member"
              type="number"
              inputMode="numeric"
              min={2}
              max={maxMemberLimit}
              value={maxMember}
              disabled={isFormLocked}
              className="w-18 pr-7 text-text-gray-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              onChange={(event) => setMaxMember(event.target.value)}
            />
            <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[15px] text-text-gray-100">
              명
            </span>
          </div>
        </FormField>
        {isPostingBased ? (
          <div className="flex h-[50px] items-center justify-between rounded-xl border border-stroke bg-white px-4">
            <label
              htmlFor="meeting-time-recognized"
              className="text-base font-medium text-text"
            >
              봉사 시간 인정 여부
            </label>
            <Switch
              id="meeting-time-recognized"
              checked={isTimeRecognized}
              disabled={isFormLocked}
              onCheckedChange={setIsTimeRecognized}
            />
          </div>
        ) : null}
        <FormField
          label="카테고리"
          labelClassName="mb-2 font-medium"
          required
          error={errors.categories}
        >
          <CategoryChipGroup
            value={resolvedCategories}
            maxSelected={3}
            disabled={isFormLocked}
            onChange={(nextCategories) => {
              setCategories(nextCategories);
              clearError("categories");
            }}
          />
        </FormField>
        <FormField
          label="신청 마감일"
          labelClassName="mb-2 font-medium"
          htmlFor="meeting-deadline"
          error={errors.deadline}
        >
          <MeetingDateTimeField
            id="meeting-deadline"
            title="신청 마감일"
            value={resolvedDeadline}
            disabled={isFormLocked}
            invalid={Boolean(errors.deadline)}
            maxDate={isPostingBased ? postingMaxDeadline : undefined}
            validate={(date) => {
              if (postingMaxDeadline && date > postingMaxDeadline) {
                return "모집 마감일은 활동 시작 시간 이전으로 선택해 주세요.";
              }
              return undefined;
            }}
            onChange={(nextDeadline) => {
              setDeadline(nextDeadline);
              clearError("deadline");
            }}
          />
        </FormField>
        <FormField
          label="활동 안내 및 참여 조건"
          labelClassName="mb-2 font-medium"
          htmlFor="participation-condition"
          count={participationCondition.length}
          maxLength={PARTICIPATION_CONDITION_MAX_LENGTH}
        >
          <Textarea
            id="participation-condition"
            value={participationCondition}
            maxLength={PARTICIPATION_CONDITION_MAX_LENGTH}
            disabled={isFormLocked}
            placeholder={
              "예 : 만 19세 이상\n매주 토요일 11:00~12:30 진행\n건대입구역 2번출구 앞에서 만나요"
            }
            className="h-[83px] overflow-hidden text-[15px] leading-[19px]"
            onChange={(event) => setParticipationCondition(event.target.value)}
          />
        </FormField>
        {createMeetingMutation.isError && createdMeetingId === null ? (
          <p role="alert" className="text-sm text-point-red">
            모임을 만들지 못했어요. 입력 내용을 확인하고 다시 시도해 주세요.
          </p>
        ) : null}
        <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom)+29px)] left-1/2 z-20 w-[calc(100%-46px)] max-w-[356px] -translate-x-1/2">
          {createPhase === "uploadFailed" ? (
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                fullWidth
                disabled={
                  uploadMeetingImagesMutation.isPending || images.length === 0
                }
                onClick={() => void retryImageUpload()}
              >
                사진 업로드 다시 시도
              </Button>
              <Button
                type="button"
                variant="primaryOutline"
                fullWidth
                disabled={uploadMeetingImagesMutation.isPending}
                onClick={() => {
                  if (createdMeetingId !== null) {
                    navigateToCompletePage(createdMeetingId);
                  }
                }}
              >
                사진 없이 완료
              </Button>
            </div>
          ) : (
            <Button
              type="submit"
              fullWidth
              disabled={createPhase !== "editing"}
            >
              {createPhase === "creating"
                ? "모임 만드는 중..."
                : createPhase === "uploading"
                  ? `사진 업로드 중... (${(uploadingImageIndex ?? 0) + 1}/${images.length})`
                  : createPhase === "applying"
                    ? "사진 등록 중..."
                    : "모임 만들기 완료"}
            </Button>
          )}
        </div>
      </form>
      <RegionSelectionSheet
        open={!isPostingBased && !isFormLocked && isRegionSheetOpen}
        onOpenChange={setIsRegionSheetOpen}
        title="활동 지역"
        value={resolvedRegionId ? Number(resolvedRegionId) : undefined}
        onApply={(nextRegionId) => {
          setRegionId(String(nextRegionId));
          clearError("region");
        }}
      />
      <MobileBottomNavigation />
    </PageContainer>
  );
}
