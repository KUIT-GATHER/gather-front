import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ImagePlus, MapPin, RefreshCw, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate } from "react-router";

import { RegionSelectionSheet } from "@/features/region/components/RegionSelectionSheet";
import { useRegionsQuery } from "@/features/region/hooks/useRegionsQuery";
import { getFullRegionSelectionLabel } from "@/features/region/lib/regionLabel";
import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import { MeetingCategoryTag } from "@/features/team/components/MeetingCategoryTag";
import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";
import PageHeader from "@/shared/ui/PageHeader";
import Textarea from "@/shared/ui/Textarea";
import { SingleDateCalendar } from "@/features/team/components/SingleDateCalendar";
import { TimeWheelPicker } from "@/features/team/components/TimeWheelPicker";
import {
  formatLocalDateTimeForInput,
  parseLocalDateTimeInput,
} from "@/shared/lib/localDateTime";
import BottomSheet from "@/shared/ui/BottomSheet";
import Button from "@/shared/ui/Button";
import { teamQueries } from "@/features/team/api/team.queries";
import {
  getMeetingImageSelectionErrorMessage,
  MAX_MEETING_IMAGE_COUNT,
  validateMeetingImageSelection,
} from "@/features/team/lib/meetingImageValidation";
import type { LocalMeetingImage } from "@/features/team/types/meetingImage.types";

const NAME_MAX_LENGTH = 15;
const DESCRIPTION_MAX_LENGTH = 200;
const PARTICIPATION_CONDITION_MAX_LENGTH = 150;

const MEETING_CATEGORY_ORDER: PostingCategory[] = [
  "ENVIRONMENT",
  "EDUCATION",
  "WELFARE",
  "CULTURE",
  "COMMUNITY",
  "OVERSEAS",
];

type FormErrors = Partial<
  Record<"name" | "description" | "region" | "categories" | "deadline", string>
>;

type ExistingMeetingImage = {
  id: string;
  source: "existing";
  previewUrl: string;
};

type NewMeetingImage = LocalMeetingImage & {
  source: "local";
};

type EditableMeetingImage = ExistingMeetingImage | NewMeetingImage;

function isNewMeetingImage(
  image: EditableMeetingImage,
): image is NewMeetingImage {
  return image.source === "local";
}

function formatDeadline(value: string) {
  if (!value) {
    return "신청 마감일을 선택해 주세요.";
  }

  const date = parseLocalDateTimeInput(value);

  if (!date) {
    return "신청 마감일을 선택해 주세요.";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatDeadlineSummary(date: Date) {
  const dateText = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join(".");

  const hour24 = date.getHours();
  const hour12 = hour24 % 12 || 12;
  const minute = String(date.getMinutes()).padStart(2, "0");
  const meridiem = hour24 < 12 ? "A.M." : "P.M.";

  return `${dateText}  |  ${String(hour12).padStart(2, "0")}:${minute} ${meridiem}`;
}

export function TeamInfoEditPage() {
  const navigate = useNavigate();
  const { home, detail, isHost } = useTeamDetailContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageSliderRef = useRef<HTMLDivElement>(null);
  const imageObjectUrlsRef = useRef(new Set<string>());
  const hasInitializedImagesRef = useRef(false);

  const meetingImagesQuery = useQuery({
    ...teamQueries.images(home.meetingId),
    enabled: isHost,
  });

  const [images, setImages] = useState<EditableMeetingImage[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageSelectionError, setImageSelectionError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (
      hasInitializedImagesRef.current ||
      meetingImagesQuery.data === undefined
    ) {
      return;
    }

    setImages(
      meetingImagesQuery.data.imageUrls.map((imageUrl, index) => ({
        id: `existing-${index}-${imageUrl}`,
        source: "existing",
        previewUrl: imageUrl,
      })),
    );

    hasInitializedImagesRef.current = true;
  }, [meetingImagesQuery.data]);

  useEffect(
    () => () => {
      imageObjectUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      imageObjectUrlsRef.current.clear();
    },
    [],
  );

  const isPostingBased = detail.volunteerPostingId !== null;
  const maxMemberLimit = isPostingBased ? 30 : 100;

  const [name, setName] = useState(detail.name);
  const [description, setDescription] = useState(detail.description ?? "");
  const [maxMember, setMaxMember] = useState(String(detail.maxMember));
  const [categories, setCategories] = useState<PostingCategory[]>([
    ...detail.categories,
  ]);
  const [participationCondition, setParticipationCondition] = useState(
    detail.participationCondition ?? "",
  );
  const [isTimeRecognized, setIsTimeRecognized] = useState(home.timeVerified);
  const [regionId, setRegionId] = useState(detail.regionId);
  const [isRegionSheetOpen, setIsRegionSheetOpen] = useState(false);

  const initialDeadline = detail.deadline?.slice(0, 16) ?? "";
  const [errors, setErrors] = useState<FormErrors>({});

  const [deadline, setDeadline] = useState(initialDeadline);
  const [isDeadlineSheetOpen, setIsDeadlineSheetOpen] = useState(false);
  const [draftDeadline, setDraftDeadline] = useState(
    () => parseLocalDateTimeInput(initialDeadline) ?? new Date(),
  );

  const clearError = (field: keyof FormErrors) => {
    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const getNormalizedMaxMember = () => {
    const parsedMaxMember = Number.parseInt(maxMember, 10);

    if (!Number.isInteger(parsedMaxMember)) {
      return detail.maxMember;
    }

    return Math.min(
      maxMemberLimit,
      Math.max(home.currentMemberCount, parsedMaxMember),
    );
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!name.trim()) {
      nextErrors.name = "모임 이름을 입력해 주세요.";
    }

    if (!description.trim()) {
      nextErrors.description = "모임 소개를 입력해 주세요.";
    }

    if (!isPostingBased && !regionId) {
      nextErrors.region = "활동 지역을 선택해 주세요.";
    }

    if (categories.length === 0) {
      nextErrors.categories = "카테고리를 1개 이상 선택해 주세요.";
    }

    if (!deadline || !parseLocalDateTimeInput(deadline)) {
      nextErrors.deadline = "신청 마감일을 선택해 주세요.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const toggleCategory = (category: PostingCategory) => {
    setCategories((current) => {
      if (current.includes(category)) {
        return current.filter((item) => item !== category);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, category];
    });
  };

  const orderedCategories = [
    ...categories,
    ...MEETING_CATEGORY_ORDER.filter(
      (category) => !categories.includes(category),
    ),
  ];

  const regionsQuery = useRegionsQuery();

  const regions = useMemo(() => regionsQuery.data ?? [], [regionsQuery.data]);

  const regionById = useMemo(
    () => new Map(regions.map((region) => [region.id, region])),
    [regions],
  );

  const selectedRegion = regionById.get(regionId);

  const selectedRegionParent =
    selectedRegion?.parentId !== null && selectedRegion?.parentId !== undefined
      ? regionById.get(selectedRegion.parentId)
      : undefined;

  const selectedRegionLabel = selectedRegion
    ? getFullRegionSelectionLabel(selectedRegion, selectedRegionParent)
    : home.regionName || "활동 지역 정보를 불러오지 못했습니다.";

  const handleImageChange = (files: FileList | null) => {
    try {
      if (!files) {
        return;
      }

      const selectedFiles = Array.from(files);
      const remainingCount = Math.max(
        0,
        MAX_MEETING_IMAGE_COUNT - images.length,
      );
      const filesWithinLimit = selectedFiles.slice(0, remainingCount);
      const localImages = images.filter(isNewMeetingImage);

      const { acceptedFiles, rejectedReasons } = validateMeetingImageSelection({
        existingImages: localImages,
        files: filesWithinLimit,
      });

      const nextImages: NewMeetingImage[] = acceptedFiles.map((file) => {
        const previewUrl = URL.createObjectURL(file);

        imageObjectUrlsRef.current.add(previewUrl);

        return {
          id: crypto.randomUUID(),
          source: "local",
          file,
          previewUrl,
        };
      });

      if (nextImages.length > 0) {
        setImages((current) => [...current, ...nextImages]);
      }

      const countExceeded = selectedFiles.length > filesWithinLimit.length;

      setImageSelectionError(
        rejectedReasons.length > 0
          ? getMeetingImageSelectionErrorMessage(rejectedReasons)
          : countExceeded
            ? `사진은 최대 ${MAX_MEETING_IMAGE_COUNT}장까지 첨부할 수 있어요.`
            : null,
      );
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((current) => {
      const target = current[index];

      if (target && isNewMeetingImage(target)) {
        URL.revokeObjectURL(target.previewUrl);
        imageObjectUrlsRef.current.delete(target.previewUrl);
      }

      return current.filter((_, imageIndex) => imageIndex !== index);
    });

    setActiveImageIndex((current) =>
      current > index
        ? current - 1
        : Math.max(0, Math.min(current, images.length - 2)),
    );

    setImageSelectionError(null);
  };

  const handleImageSliderScroll = () => {
    const slider = imageSliderRef.current;
    const firstImage = slider?.children[0] as HTMLElement | undefined;

    if (!slider || !firstImage) {
      return;
    }

    const closestImageIndex = Array.from(slider.children).reduce(
      (closestIndex, child, index) => {
        const imagePosition =
          (child as HTMLElement).offsetLeft - firstImage.offsetLeft;
        const closestImagePosition =
          (slider.children[closestIndex] as HTMLElement).offsetLeft -
          firstImage.offsetLeft;

        return Math.abs(imagePosition - slider.scrollLeft) <
          Math.abs(closestImagePosition - slider.scrollLeft)
          ? index
          : closestIndex;
      },
      0,
    );

    setActiveImageIndex(closestImageIndex);
  };

  const scrollToImage = (index: number) => {
    const slider = imageSliderRef.current;
    const firstImage = slider?.children[0] as HTMLElement | undefined;
    const image = slider?.children[index] as HTMLElement | undefined;

    if (!slider || !firstImage || !image) {
      return;
    }

    setActiveImageIndex(index);

    slider.scrollTo({
      left: image.offsetLeft - firstImage.offsetLeft,
      behavior: "smooth",
    });
  };

  if (!isHost) {
    return <Navigate to={`/teams/${home.meetingId}`} replace />;
  }

  return (
    <main className="min-h-dvh bg-bg px-5.5">
      <PageHeader title="팀 정보 수정" onBack={() => navigate(-1)} sticky />

      <form
        noValidate
        className="flex flex-col gap-6 pb-28"
        onSubmit={(event) => {
          event.preventDefault();

          if (!validate()) {
            return;
          }

          const normalizedMaxMember = getNormalizedMaxMember();

          setMaxMember(String(normalizedMaxMember));

          const payload = {
            name: name.trim(),
            description: description.trim(),
            maxMember: normalizedMaxMember,
            deadline,
            categories,
            participationCondition: participationCondition.trim() || null,
            ...(isPostingBased
              ? { timeVerified: isTimeRecognized }
              : { regionId }),
          };

          console.log(payload);
        }}
      >
        {isPostingBased ? (
          <FormField label="연결 공고">
            <Input value={home.linkedPostingTitle ?? ""} />
          </FormField>
        ) : null}

        <FormField
          label="모임 이름"
          required
          htmlFor="meeting-name"
          count={name.length}
          maxLength={NAME_MAX_LENGTH}
          error={errors.name}
        >
          <Input
            id="meeting-name"
            value={name}
            maxLength={NAME_MAX_LENGTH}
            invalid={Boolean(errors.name)}
            onChange={(event) => {
              setName(event.target.value);
              clearError("name");
            }}
          />
        </FormField>

        <FormField
          label="모임 소개"
          required
          htmlFor="meeting-description"
          count={description.length}
          maxLength={DESCRIPTION_MAX_LENGTH}
          error={errors.description}
        >
          <Textarea
            id="meeting-description"
            value={description}
            maxLength={DESCRIPTION_MAX_LENGTH}
            invalid={Boolean(errors.description)}
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
            disabled={
              meetingImagesQuery.isLoading ||
              meetingImagesQuery.isError ||
              images.length >= MAX_MEETING_IMAGE_COUNT
            }
            className="flex w-full items-center gap-3 rounded-xl border border-dashed border-[#90d79d] bg-[#f8fbf8] px-4 py-3 text-left text-base font-semibold text-[#18bd77] focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              fileInputRef.current?.click();
            }}
          >
            <ImagePlus aria-hidden="true" className="size-6" />

            <span id="meeting-image-label">
              사진 첨부 (선택, 최대 {MAX_MEETING_IMAGE_COUNT}장)
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={
              meetingImagesQuery.isLoading || meetingImagesQuery.isError
            }
            className="sr-only"
            onChange={(event) => {
              handleImageChange(event.target.files);
            }}
          />

          {meetingImagesQuery.isLoading ? (
            <p className="mt-2 text-sm text-text-gray-300">
              기존 사진을 불러오는 중이에요.
            </p>
          ) : null}

          {meetingImagesQuery.isError ? (
            <div className="mt-2 flex items-center justify-between gap-3">
              <p role="alert" className="text-sm text-point-red">
                기존 사진을 불러오지 못했어요.
              </p>

              <button
                type="button"
                className="shrink-0 text-sm font-medium text-button"
                onClick={() => {
                  void meetingImagesQuery.refetch();
                }}
              >
                다시 시도
              </button>
            </div>
          ) : null}

          {imageSelectionError ? (
            <p role="alert" className="mt-2 text-sm text-point-red">
              {imageSelectionError}
            </p>
          ) : null}

          {images.length > 0 ? (
            <div className="mt-5">
              <div
                ref={imageSliderRef}
                aria-label="모임 사진 미리보기"
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                onScroll={handleImageSliderScroll}
              >
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative min-w-full snap-start overflow-hidden rounded-2xl"
                  >
                    <img
                      src={image.previewUrl}
                      alt={`모임 사진 ${index + 1}`}
                      className="h-41 w-full object-cover"
                    />

                    <button
                      type="button"
                      aria-label={`모임 사진 ${index + 1} 삭제`}
                      className="absolute top-2 right-2 flex size-10 items-center justify-center rounded-full bg-white/80 text-text-gray-400 shadow-sm backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-button/50"
                      onClick={() => {
                        removeImage(index);
                      }}
                    >
                      <X
                        aria-hidden="true"
                        className="size-6"
                        strokeWidth={1.8}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div
                className="mt-3 flex h-3 items-center justify-center gap-2"
                aria-label={`${images.length}장 중 ${activeImageIndex + 1}번째 사진`}
              >
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    aria-label={`${index + 1}번째 사진 보기`}
                    aria-current={
                      index === activeImageIndex ? "true" : undefined
                    }
                    className={`size-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-button/50 ${
                      index === activeImageIndex
                        ? "bg-[#18bd77]"
                        : "bg-[#d9d9d9]"
                    }`}
                    onClick={() => {
                      scrollToImage(index);
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <FormField label="활동 지역" required error={errors.region}>
          <button
            type="button"
            disabled={isPostingBased}
            onClick={() => {
              if (!isPostingBased) {
                setIsRegionSheetOpen(true);
              }
            }}
            className="flex h-12 w-full items-center justify-between rounded-xl border border-stroke bg-white px-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40 disabled:cursor-default disabled:opacity-100"
          >
            <span className="flex min-w-0 items-center gap-2">
              <MapPin
                aria-hidden="true"
                className="size-4 shrink-0 text-icon"
              />

              <span className="truncate text-[15px] text-text">
                {selectedRegionLabel}
              </span>
            </span>
          </button>
        </FormField>

        <FormField
          label={`최대 인원 (${maxMemberLimit}명)`}
          htmlFor="meeting-max-member"
        >
          <Input
            id="meeting-max-member"
            type="number"
            value={maxMember}
            min={Math.max(1, home.currentMemberCount)}
            max={maxMemberLimit}
            onChange={(event) => {
              setMaxMember(event.target.value);
            }}
          />
        </FormField>

        {isPostingBased ? (
          <div className="flex h-14 items-center justify-between rounded-xl border border-stroke bg-white px-4">
            <span className="text-base font-medium text-text">
              봉사 시간 인정 여부
            </span>

            <button
              type="button"
              role="switch"
              aria-label="봉사 시간 인정 여부"
              aria-checked={isTimeRecognized}
              className={`flex h-6 w-11 items-center rounded-full px-0.5 transition ${
                isTimeRecognized
                  ? "justify-end bg-icon"
                  : "justify-start bg-stroke"
              }`}
              onClick={() => {
                setIsTimeRecognized((current) => !current);
              }}
            >
              <span className="size-5 rounded-full bg-white shadow" />
            </button>
          </div>
        ) : null}

        <FormField
          label="카테고리"
          required
          description={
            errors.categories ? undefined : "최대 3개까지 선택할 수 있습니다."
          }
          error={errors.categories}
        >
          <div className="flex flex-wrap gap-2">
            {orderedCategories.map((category) => {
              const selected = categories.includes(category);

              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    toggleCategory(category);
                    clearError("categories");
                  }}
                  className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                >
                  <MeetingCategoryTag category={category} selected={selected} />
                </button>
              );
            })}
          </div>
        </FormField>

        <FormField
          label="신청 마감일"
          htmlFor="meeting-deadline"
          error={errors.deadline}
        >
          <button
            id="meeting-deadline"
            type="button"
            className="flex h-12 w-full items-center justify-between rounded-xl border border-stroke bg-white px-4 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-button/40"
            onClick={() => {
              setDraftDeadline(parseLocalDateTimeInput(deadline) ?? new Date());
              setIsDeadlineSheetOpen(true);
            }}
          >
            <span className={deadline ? "text-text" : "text-text-gray-100"}>
              {formatDeadline(deadline)}
            </span>

            <CalendarDays aria-hidden="true" className="size-6 text-icon" />
          </button>
        </FormField>

        <FormField
          label="활동 안내 및 참여 조건"
          htmlFor="meeting-participation-condition"
          count={participationCondition.length}
          maxLength={PARTICIPATION_CONDITION_MAX_LENGTH}
        >
          <Textarea
            id="meeting-participation-condition"
            value={participationCondition}
            maxLength={PARTICIPATION_CONDITION_MAX_LENGTH}
            className="h-28"
            onChange={(event) => {
              setParticipationCondition(event.target.value);
            }}
          />
        </FormField>

        <button
          type="submit"
          className="h-12 w-full rounded-xl bg-button text-[16px] font-semibold text-white"
        >
          저장하기
        </button>
      </form>

      <RegionSelectionSheet
        open={isRegionSheetOpen}
        onOpenChange={setIsRegionSheetOpen}
        value={regionId}
        onApply={(nextRegionId) => {
          setRegionId(nextRegionId);
          clearError("region");
        }}
        title="활동 지역"
      />

      <BottomSheet
        open={isDeadlineSheetOpen}
        onOpenChange={setIsDeadlineSheetOpen}
        title="신청 마감일"
        className="max-h-[min(96dvh,55rem)] rounded-t-[40px] bg-bg"
        contentClassName="px-5.5 pt-3 pb-1"
        leadingAction={
          <button
            type="button"
            className="inline-flex h-11 items-center gap-1 text-xs font-medium text-point-red"
            onClick={() => {
              setDraftDeadline(new Date());
            }}
          >
            재설정
            <RefreshCw aria-hidden="true" className="size-4" />
          </button>
        }
        footer={
          <div className="flex justify-center">
            <Button
              type="button"
              fullWidth
              className="max-w-[315px] active:bg-icon"
              onClick={() => {
                const nextDeadline = formatLocalDateTimeForInput(draftDeadline);

                if (!nextDeadline) {
                  return;
                }

                setDeadline(nextDeadline);
                clearError("deadline");
                setIsDeadlineSheetOpen(false);
              }}
            >
              적용하기
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="flex h-[68px] items-center justify-between rounded-2xl border border-button bg-white px-4">
            <p className="text-base font-medium text-text-gray-400">
              {formatDeadlineSummary(draftDeadline)}
            </p>

            <CalendarDays aria-hidden="true" className="size-6 text-icon" />
          </div>

          <div className="min-h-[348px] rounded-2xl border border-button bg-white px-1 pb-2">
            <SingleDateCalendar
              selected={draftDeadline}
              onSelect={(date) => {
                const nextDeadline = new Date(date);

                nextDeadline.setHours(
                  draftDeadline.getHours(),
                  draftDeadline.getMinutes(),
                  0,
                  0,
                );

                setDraftDeadline(nextDeadline);
              }}
            />
          </div>

          <TimeWheelPicker value={draftDeadline} onChange={setDraftDeadline} />
        </div>
      </BottomSheet>
    </main>
  );
}
