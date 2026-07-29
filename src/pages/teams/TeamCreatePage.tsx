import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ImagePlus, MapPin, RefreshCw, X } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { POSTING_CATEGORY_LABEL } from "@/features/category/constants/postingCategory.constants";
import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import { RegionSelectionSheet } from "@/features/region/components/RegionSelectionSheet";
import { useRegionsQuery } from "@/features/region/hooks/useRegionsQuery";
import { getFullRegionSelectionLabel } from "@/features/region/lib/regionLabel";
import { MeetingCategoryTag } from "@/features/team/components/MeetingCategoryTag";
import { SingleDateCalendar } from "@/features/team/components/SingleDateCalendar";
import { TimeWheelPicker } from "@/features/team/components/TimeWheelPicker";
import { useCreateMeetingMutation } from "@/features/team/hooks/useCreateMeetingMutation";
import { buildMeetingCreateDateTimePayload } from "@/features/team/lib/meetingCreatePayload";
import { useVolunteerPostingDetail } from "@/features/volunteer/hooks/useVolunteerPostingDetail";
import {
  combineLocalDateAndTime,
  formatLocalDateTimeForInput,
  parseLocalDateTimeInput,
} from "@/shared/lib/localDateTime";
import BottomSheet from "@/shared/ui/BottomSheet";
import Button from "@/shared/ui/Button";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";
import Textarea from "@/shared/ui/Textarea";

const NAME_MAX_LENGTH = 15;
const DESCRIPTION_MAX_LENGTH = 200;
const MAX_IMAGES = 3;
const MAX_MEMBER = 100;
const PARTICIPATION_CONDITION_MAX_LENGTH = 150;
const MEETING_CATEGORY_ORDER: PostingCategory[] = [
  "ENVIRONMENT",
  "EDUCATION",
  "WELFARE",
  "CULTURE",
  "COMMUNITY",
  "OVERSEAS",
];

type ImagePreview = {
  file: File;
  url: string;
};

type FormErrors = Partial<
  Record<
    "name" | "description" | "region" | "categories" | "deadline" | "activity",
    string
  >
>;

function formatDeadline(value: string) {
  if (!value) return "신청 마감일을 선택해 주세요";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
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

export function TeamCreatePage() {
  const navigate = useNavigate();
  const { volunteerId } = useParams();
  const postingId = Number(volunteerId);
  const isPostingBased = Number.isInteger(postingId) && postingId > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageSliderRef = useRef<HTMLDivElement>(null);
  const imageUrlsRef = useRef<string[]>([]);
  const regionsQuery = useRegionsQuery();
  const createMeetingMutation = useCreateMeetingMutation();
  const postingQuery = useVolunteerPostingDetail(
    isPostingBased ? postingId : undefined,
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [regionId, setRegionId] = useState("");
  const [maxMember, setMaxMember] = useState(isPostingBased ? "30" : "100");
  const [categories, setCategories] = useState<PostingCategory[]>([]);
  const [deadline, setDeadline] = useState("");
  const [participationCondition, setParticipationCondition] = useState("");
  const [isTimeRecognized, setIsTimeRecognized] = useState(true);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isRegionSheetOpen, setIsRegionSheetOpen] = useState(false);
  const [isDeadlineSheetOpen, setIsDeadlineSheetOpen] = useState(false);
  const [draftDeadline, setDraftDeadline] = useState(() => new Date());

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
  const resolvedCategories =
    categories.length > 0
      ? categories
      : isPostingBased && postingQuery.data?.category
        ? [postingQuery.data.category]
        : [];
  const orderedCategories = [
    ...resolvedCategories,
    ...MEETING_CATEGORY_ORDER.filter(
      (category) => !resolvedCategories.includes(category),
    ),
  ];
  const resolvedDeadline = deadline || (postingDefaultDeadline ?? "");
  const regions = useMemo(() => regionsQuery.data ?? [], [regionsQuery.data]);
  const regionById = useMemo(
    () => new Map(regions.map((region) => [region.id, region])),
    [regions],
  );
  const selectedRegion = resolvedRegionId
    ? regionById.get(Number(resolvedRegionId))
    : undefined;
  const maxMemberLimit = isPostingBased ? 30 : MAX_MEMBER;
  const selectedRegionParent = selectedRegion?.parentId
    ? regionById.get(selectedRegion.parentId)
    : undefined;

  useEffect(
    () => () => {
      imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const clearError = (field: keyof FormErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleImageChange = (files: FileList | null) => {
    if (!files) return;

    const availableCount = MAX_IMAGES - images.length;
    const nextImages = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, availableCount)
      .map((file) => {
        const url = URL.createObjectURL(file);
        imageUrlsRef.current.push(url);
        return { file, url };
      });

    setImages((current) => [...current, ...nextImages]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((current) => {
      const target = current[index];
      if (target) {
        URL.revokeObjectURL(target.url);
        imageUrlsRef.current = imageUrlsRef.current.filter(
          (url) => url !== target.url,
        );
      }
      return current.filter((_, imageIndex) => imageIndex !== index);
    });
    setActiveImageIndex((current) =>
      current > index
        ? current - 1
        : Math.max(0, Math.min(current, images.length - 2)),
    );
  };

  const handleImageSliderScroll = () => {
    const slider = imageSliderRef.current;
    const firstImage = slider?.children[0] as HTMLElement | undefined;
    if (!slider || !firstImage) return;

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
    if (!slider || !firstImage || !image) return;

    setActiveImageIndex(index);
    slider.scrollTo({
      left: image.offsetLeft - firstImage.offsetLeft,
      behavior: "smooth",
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate() || resolvedCategories.length === 0) return;

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

    try {
      const meeting = await createMeetingMutation.mutateAsync({
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
        ...dateTimePayload,
      });

      const completeSearchParams = new URLSearchParams({
        meetingId: String(meeting.meetingId),
      });
      if (isPostingBased) {
        completeSearchParams.set("volunteerPostingId", String(postingId));
      }
      navigate(`/teams/new/complete?${completeSearchParams.toString()}`, {
        replace: true,
      });
    } catch {
      // Mutation state renders the request error below the form.
    }
  };

  return (
    <PageContainer size="narrow" className="min-h-dvh pb-32">
      <PageHeader
        title={isPostingBased ? "공고 기반 모임 만들기" : "자유 모임 만들기"}
        onBack={() => navigate(-1)}
      />

      {isPostingBased ? null : (
        <div className="rounded-xl border border-button bg-[#f8fbf8] px-3 py-2.5 text-[13px] leading-5 text-text-gray-400">
          <p>자유 모임은 여러 봉사활동을 함께하는 커뮤니티입니다.</p>
          <p>
            활동별 날짜와 장소는{" "}
            <strong className="font-semibold text-[#18bd77]">
              모임 생성 후 봉사 모집 글
            </strong>
            에서 등록할 수 있습니다.
          </p>
        </div>
      )}

      <form className="mt-5 flex flex-col gap-6" onSubmit={handleSubmit}>
        {isPostingBased ? (
          <FormField label="연관 공고" error={errors.activity}>
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
            placeholder="모임 이름을 입력해 주세요."
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
            className="flex w-full items-center gap-3 rounded-xl border border-dashed border-[#90d79d] bg-[#f8fbf8] px-4 py-3 text-left text-base font-semibold text-[#18bd77] focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={images.length >= MAX_IMAGES}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus aria-hidden="true" className="size-6" />
            <span id="meeting-image-label">
              사진 첨부 (선택, 최대 {MAX_IMAGES}장)
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(event) => handleImageChange(event.target.files)}
          />
          {images.length > 0 ? (
            <div className="mt-5">
              <div
                ref={imageSliderRef}
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-label="첨부 사진 미리보기"
                onScroll={handleImageSliderScroll}
              >
                {images.map((image, index) => (
                  <div
                    key={image.url}
                    className="relative min-w-full snap-start overflow-hidden rounded-2xl"
                  >
                    <img
                      src={image.url}
                      alt={`첨부 사진 ${index + 1}`}
                      className="h-41 w-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label={`첨부 사진 ${index + 1} 삭제`}
                      className="absolute right-2 top-2 flex size-10 items-center justify-center rounded-full bg-white/80 text-text-gray-400 shadow-sm backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-button/50"
                      onClick={() => removeImage(index)}
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
                    key={image.url}
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
                    onClick={() => scrollToImage(index)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </section>
        <FormField
          label={isPostingBased ? "활동 장소" : "활동 지역"}
          required
          error={errors.region}
        >
          <button
            type="button"
            disabled={isPostingBased}
            className="relative flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-stroke bg-white px-4 text-sm font-medium text-text focus:border-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40 disabled:opacity-100"
            onClick={() => setIsRegionSheetOpen(true)}
          >
            <MapPin aria-hidden="true" className="size-4 text-icon" />
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
          label={`최대 인원 (${maxMemberLimit}명)`}
          htmlFor="max-member"
        >
          <Input
            id="max-member"
            type="number"
            inputMode="numeric"
            min={2}
            max={maxMemberLimit}
            value={maxMember}
            onChange={(event) => setMaxMember(event.target.value)}
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
              aria-checked={isTimeRecognized}
              className={`flex h-6 w-11 items-center rounded-full px-0.5 transition ${isTimeRecognized ? "justify-end bg-icon" : "justify-start bg-stroke"}`}
              onClick={() => setIsTimeRecognized((current) => !current)}
            >
              <span className="size-5 rounded-full bg-white shadow" />
            </button>
          </div>
        ) : null}
        <FormField
          label="카테고리 (최대 3개)"
          required
          error={errors.categories}
        >
          <div className="-mx-5.5 flex gap-2 overflow-x-auto px-5.5 pb-1">
            {orderedCategories.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={resolvedCategories.includes(value)}
                aria-label={`${POSTING_CATEGORY_LABEL[value]} 카테고리`}
                className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                onClick={() => {
                  setCategories((current) =>
                    current.includes(value)
                      ? current.filter((category) => category !== value)
                      : current.length < 3
                        ? [...current, value]
                        : current,
                  );
                  clearError("categories");
                }}
              >
                <MeetingCategoryTag
                  category={value}
                  selected={resolvedCategories.includes(value)}
                />
              </button>
            ))}
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
            className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-button/40 ${errors.deadline ? "border-point-red" : "border-stroke"}`}
            onClick={() => {
              setDraftDeadline(
                (resolvedDeadline &&
                  parseLocalDateTimeInput(resolvedDeadline)) ||
                  new Date(),
              );
              setIsDeadlineSheetOpen(true);
            }}
          >
            <span
              className={resolvedDeadline ? "text-text" : "text-text-gray-100"}
            >
              {formatDeadline(resolvedDeadline)}
            </span>
            <CalendarDays aria-hidden="true" className="size-6 text-icon" />
          </button>
        </FormField>
        <FormField
          label="활동 안내 및 참여 조건"
          htmlFor="participation-condition"
          count={participationCondition.length}
          maxLength={PARTICIPATION_CONDITION_MAX_LENGTH}
        >
          <Textarea
            id="participation-condition"
            value={participationCondition}
            maxLength={PARTICIPATION_CONDITION_MAX_LENGTH}
            placeholder={
              "만 19세 이상\n매주 토요일 11:00~12:30 진행\n건대입구역 2번출구 앞에서 만나요"
            }
            className="h-28"
            onChange={(event) => setParticipationCondition(event.target.value)}
          />
        </FormField>
        {createMeetingMutation.isError ? (
          <p role="alert" className="text-sm text-point-red">
            모임을 만들지 못했어요. 입력 내용을 확인하고 다시 시도해 주세요.
          </p>
        ) : null}
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-app border-t border-stroke bg-bg/95 px-5.5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur">
          <Button
            type="submit"
            fullWidth
            disabled={createMeetingMutation.isPending}
          >
            {createMeetingMutation.isPending
              ? "모임 만드는 중..."
              : "모임 만들기 완료"}
          </Button>
        </div>
      </form>
      <RegionSelectionSheet
        open={!isPostingBased && isRegionSheetOpen}
        onOpenChange={setIsRegionSheetOpen}
        title="활동 지역"
        value={resolvedRegionId ? Number(resolvedRegionId) : undefined}
        onApply={(nextRegionId) => {
          setRegionId(String(nextRegionId));
          clearError("region");
        }}
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
            onClick={() => setDraftDeadline(new Date())}
          >
            재설정
            <RefreshCw aria-hidden="true" className="size-4" />
          </button>
        }
        footer={
          <div className="flex justify-center">
            <Button
              fullWidth
              className="max-w-[315px] active:bg-icon"
              onClick={() => {
                const nextDeadline = formatLocalDateTimeForInput(draftDeadline);

                if (postingMaxDeadline && draftDeadline > postingMaxDeadline) {
                  setErrors((current) => ({
                    ...current,
                    deadline:
                      "모집 마감일은 활동 시작 시간 이전으로 선택해 주세요.",
                  }));
                  return;
                }

                if (!nextDeadline) {
                  setErrors((current) => ({
                    ...current,
                    deadline: "신청 마감일을 다시 선택해 주세요.",
                  }));
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
              maxDate={isPostingBased ? postingMaxDeadline : undefined}
              onSelect={(date) => {
                const next = new Date(date);
                next.setHours(
                  draftDeadline.getHours(),
                  draftDeadline.getMinutes(),
                  0,
                  0,
                );
                setDraftDeadline(next);
              }}
            />
          </div>
          <TimeWheelPicker value={draftDeadline} onChange={setDraftDeadline} />
        </div>
      </BottomSheet>
    </PageContainer>
  );
}
