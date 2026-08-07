import { useState } from "react";
import { MapPin, CalendarDays, RefreshCw } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router";

import { RegionSelectionSheet } from "@/features/region/components/RegionSelectionSheet";
import { useRegionsQuery } from "@/features/region/hooks/useRegionsQuery";
import { getFullRegionSelectionLabel } from "@/features/region/lib/regionLabel";
import { MobileBottomNavigation } from "@/app/navigation/MobileBottomNavigation";
import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import { MeetingCategoryTag } from "@/features/team/components/MeetingCategoryTag";
import { SingleDateCalendar } from "@/features/team/components/SingleDateCalendar";
import { TimeWheelPicker } from "@/features/team/components/TimeWheelPicker";
import { useMeetingHomeQuery } from "@/features/team/hooks/useMeetingHomeQuery";
import {
  formatLocalDateTimeForInput,
  parseLocalDateTimeInput,
} from "@/shared/lib/localDateTime";
import BottomSheet from "@/shared/ui/BottomSheet";
import Button from "@/shared/ui/Button";
import { ErrorState } from "@/shared/ui/ErrorState";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";
import LoadingState from "@/shared/ui/LoadingState";
import PageHeader from "@/shared/ui/PageHeader";
import Textarea from "@/shared/ui/Textarea";

const TITLE_MAX_LENGTH = 15;
const CONTENT_MAX_LENGTH = 1000;
const MAX_RECRUIT_CAPACITY = 50;
const PARTICIPATION_CONDITION_MAX_LENGTH = 150;

const CATEGORY_ORDER: PostingCategory[] = [
  "ENVIRONMENT",
  "EDUCATION",
  "WELFARE",
  "CULTURE",
  "COMMUNITY",
  "OVERSEAS",
];

type EditingTime = "start" | "end";

type FormErrors = Partial<
  Record<
    | "title"
    | "content"
    | "place"
    | "activityDate"
    | "activityTime"
    | "recruitCapacity"
    | "categories"
    | "recruitDeadline",
    string
  >
>;

function parseActivityDateTime(value: string) {
  if (!value) {
    return null;
  }

  const date = parseLocalDateTimeInput(value);

  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function createDefaultDeadline(activityStartAt: string) {
  const activityStart = parseActivityDateTime(activityStartAt);

  if (!activityStart) {
    const now = new Date();
    now.setSeconds(0, 0);

    return now;
  }

  const oneHourBefore = new Date(activityStart.getTime() - 60 * 60 * 1000);

  const now = new Date();
  now.setSeconds(0, 0);

  return oneHourBefore > now ? oneHourBefore : now;
}

function formatDeadline(value: string) {
  const date = parseLocalDateTimeInput(value);

  if (!date) {
    return "신청 마감일을 선택해 주세요";
  }

  const dateText = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join(".");

  const hour24 = date.getHours();
  const hour12 = hour24 % 12 || 12;
  const minute = String(date.getMinutes()).padStart(2, "0");
  const meridiem = hour24 < 12 ? "A.M." : "P.M.";

  return `${dateText} · ${String(hour12).padStart(2, "0")}:${minute} ${meridiem}`;
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

  return `${dateText}  |  ${String(hour12).padStart(
    2,
    "0",
  )}:${minute} ${meridiem}`;
}

export function TeamRecruitPostCreatePage() {
  const navigate = useNavigate();
  const { teamId } = useParams();

  const meetingId = Number(teamId);
  const hasValidMeetingId = Number.isInteger(meetingId) && meetingId > 0;

  const safeMeetingId = hasValidMeetingId ? meetingId : 0;

  const homeQuery = useMeetingHomeQuery(safeMeetingId, {
    enabled: hasValidMeetingId,
    isAuthenticated: true,
  });

  const [isExternal, setIsExternal] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [placeRegionId, setPlaceRegionId] = useState("");
  const [isRegionSheetOpen, setIsRegionSheetOpen] = useState(false);

  const regionsQuery = useRegionsQuery();

  const [activityStartAt, setActivityStartAt] = useState("");
  const [activityEndAt, setActivityEndAt] = useState("");

  const [recruitCapacity, setRecruitCapacity] = useState("50");
  const [categories, setCategories] = useState<PostingCategory[]>([]);

  const [timeVerified, setTimeVerified] = useState(false);
  const [recruitDeadline, setRecruitDeadline] = useState("");
  const [participationCondition, setParticipationCondition] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});

  const [isActivityDateTimeSheetOpen, setIsActivityDateTimeSheetOpen] =
    useState(false);

  const [editingTime, setEditingTime] = useState<EditingTime>("start");

  const [draftActivityDateTime, setDraftActivityDateTime] = useState(
    () => new Date(),
  );

  const [activityDateTimeSheetError, setActivityDateTimeSheetError] = useState<
    string | null
  >(null);

  const [isDeadlineSheetOpen, setIsDeadlineSheetOpen] = useState(false);

  const [draftRecruitDeadline, setDraftRecruitDeadline] = useState(
    () => new Date(),
  );

  const [deadlineSheetError, setDeadlineSheetError] = useState<string | null>(
    null,
  );

  if (!hasValidMeetingId) {
    return <Navigate to="/teams" replace />;
  }

  if (homeQuery.isLoading) {
    return (
      <LoadingState
        label="모임 정보를 불러오는 중"
        className="mx-auto min-h-dvh max-w-app justify-center px-5.5"
      />
    );
  }

  if (homeQuery.isError || !homeQuery.data) {
    return (
      <ErrorState
        className="mx-auto min-h-dvh max-w-app justify-center px-5.5"
        title="모임 정보를 불러오지 못했어요"
        description="잠시 후 다시 확인해 주세요."
        primaryAction={{
          label: "다시 시도",
          onClick: () => void homeQuery.refetch(),
        }}
      />
    );
  }

  const home = homeQuery.data;

  if (!home.host) {
    return <Navigate to={`/teams/${meetingId}/posts`} replace />;
  }

  const regions = regionsQuery.data ?? [];

  const selectedPlaceRegion = placeRegionId
    ? regions.find((region) => region.id === Number(placeRegionId))
    : undefined;

  const selectedPlaceRegionParent = selectedPlaceRegion?.parentId
    ? regions.find((region) => region.id === selectedPlaceRegion.parentId)
    : undefined;

  const place = selectedPlaceRegion
    ? getFullRegionSelectionLabel(
        selectedPlaceRegion,
        selectedPlaceRegionParent,
      )
    : "";

  const clearError = (field: keyof FormErrors) => {
    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
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

    clearError("categories");
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const capacity = Number(recruitCapacity);

    if (!title.trim()) {
      nextErrors.title = "활동 제목을 입력해 주세요.";
    }

    if (!content.trim()) {
      nextErrors.content = "활동 소개를 입력해 주세요.";
    }

    if (!place.trim()) {
      nextErrors.place = "활동 장소를 입력해 주세요.";
    }

    const activityStart = parseActivityDateTime(activityStartAt);
    const activityEnd = parseActivityDateTime(activityEndAt);

    if (!activityStart) {
      nextErrors.activityDate = "시작일시를 선택해 주세요.";
    }

    if (!activityEnd) {
      nextErrors.activityTime = "종료일시를 선택해 주세요.";
    }

    if (activityStart && activityEnd && activityEnd <= activityStart) {
      nextErrors.activityTime = "종료일시는 시작일시보다 늦어야 해요.";
    }

    if (
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      capacity > MAX_RECRUIT_CAPACITY
    ) {
      nextErrors.recruitCapacity = `최대 인원은 1명 이상 ${MAX_RECRUIT_CAPACITY}명 이하여야 해요.`;
    }

    if (categories.length === 0) {
      nextErrors.categories = "카테고리를 1개 이상 선택해 주세요.";
    }

    if (!recruitDeadline) {
      nextErrors.recruitDeadline = "신청 마감일을 선택해 주세요.";
    } else {
      const deadline = parseLocalDateTimeInput(recruitDeadline);

      const activityStart = parseActivityDateTime(activityStartAt);

      if (deadline && activityStart && deadline >= activityStart) {
        nextErrors.recruitDeadline =
          "신청 마감일은 활동 시작 전으로 선택해 주세요.";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    const payload = {
      type: "RECRUIT" as const,
      isExternal,
      title: title.trim(),
      content: content.trim(),
      place: place.trim(),
      activityStartAt,
      activityEndAt,
      recruitCapacity: Number(recruitCapacity),
      categories,
      timeVerified,
      recruitDeadline,
      participationCondition: participationCondition.trim() || null,
    };

    console.log("모집공고 작성 데이터:", payload);

    /*
     * TODO:
     * 1. 모집공고 작성 API 연동
     * 2. 성공 후 모집공고 상세 화면으로 이동
     */
  };

  const capacityNumber = Number(recruitCapacity);

  const orderedCategories = [
    ...categories,
    ...CATEGORY_ORDER.filter((category) => !categories.includes(category)),
  ];

  const isSubmitDisabled =
    !title.trim() ||
    !content.trim() ||
    !place.trim() ||
    categories.length === 0 ||
    !Number.isInteger(capacityNumber) ||
    capacityNumber < 1 ||
    capacityNumber > MAX_RECRUIT_CAPACITY;

  return (
    <div className="mx-auto min-h-dvh max-w-app bg-bg pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <PageHeader
        title="모집 공고"
        onBack={() => navigate(-1)}
        sticky
        className="px-5.5"
      />

      <form
        noValidate
        className="flex flex-col gap-5 px-5.5 pt-5 pb-8"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stroke bg-white px-4 py-4">
          <input
            type="checkbox"
            checked={isExternal}
            className="mt-0.5 size-5 accent-button"
            onChange={(event) => {
              setIsExternal(event.target.checked);
            }}
          />

          <span>
            <span className="block text-[14px] font-semibold text-text">
              외부 공고로 등록하기
            </span>

            <span className="mt-1 block text-[12px] leading-4 text-text-gray-400">
              팀 외부 사용자에게도 이 활동을 공개해요
            </span>
          </span>
        </label>

        <FormField
          label="활동 제목"
          required
          htmlFor="recruit-title"
          count={title.length}
          maxLength={TITLE_MAX_LENGTH}
          error={errors.title}
        >
          <Input
            id="recruit-title"
            value={title}
            maxLength={TITLE_MAX_LENGTH}
            placeholder="활동 제목을 입력하세요"
            invalid={Boolean(errors.title)}
            className="h-12"
            onChange={(event) => {
              setTitle(event.target.value.slice(0, TITLE_MAX_LENGTH));
              clearError("title");
            }}
          />
        </FormField>

        <FormField
          label="활동 소개"
          required
          htmlFor="recruit-content"
          count={content.length}
          maxLength={CONTENT_MAX_LENGTH}
          error={errors.content}
        >
          <Textarea
            id="recruit-content"
            value={content}
            maxLength={CONTENT_MAX_LENGTH}
            placeholder="활동에 대해 자세히 설명해 주세요"
            invalid={Boolean(errors.content)}
            className="h-[165px] resize-none"
            onChange={(event) => {
              setContent(event.target.value.slice(0, CONTENT_MAX_LENGTH));
              clearError("content");
            }}
          />
        </FormField>

        <FormField label="장소" required error={errors.place}>
          <button
            type="button"
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl border bg-white px-4 text-[14px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-button/40 ${
              errors.place ? "border-point-red" : "border-stroke"
            }`}
            onClick={() => {
              setIsRegionSheetOpen(true);
            }}
          >
            <MapPin aria-hidden="true" className="size-4 shrink-0 text-icon" />

            <span className={place ? "text-text" : "text-text-gray-100"}>
              {place || "활동 장소를 선택해 주세요"}
            </span>
          </button>
        </FormField>

        <FormField
          label="일시"
          error={errors.activityDate || errors.activityTime}
        >
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-button/40 ${
                errors.activityDate ? "border-point-red" : "border-stroke"
              }`}
              onClick={() => {
                const current =
                  parseLocalDateTimeInput(activityStartAt) ?? new Date();

                setEditingTime("start");
                setDraftActivityDateTime(current);
                setActivityDateTimeSheetError(null);
                setIsActivityDateTimeSheetOpen(true);
              }}
            >
              <span
                className={
                  activityStartAt
                    ? "text-[14px] text-text"
                    : "text-[14px] text-text-gray-100"
                }
              >
                {activityStartAt ? formatDeadline(activityStartAt) : "시작일시"}
              </span>

              <CalendarDays
                aria-hidden="true"
                className="size-5 shrink-0 text-icon"
              />
            </button>

            <button
              type="button"
              className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-button/40 ${
                errors.activityTime ? "border-point-red" : "border-stroke"
              }`}
              onClick={() => {
                const currentEnd = parseLocalDateTimeInput(activityEndAt);

                const start = parseLocalDateTimeInput(activityStartAt);

                const defaultEnd = start
                  ? new Date(start.getTime() + 60 * 60 * 1000)
                  : new Date();

                setEditingTime("end");
                setDraftActivityDateTime(currentEnd ?? defaultEnd);
                setActivityDateTimeSheetError(null);
                setIsActivityDateTimeSheetOpen(true);
              }}
            >
              <span
                className={
                  activityEndAt
                    ? "text-[14px] text-text"
                    : "text-[14px] text-text-gray-100"
                }
              >
                {activityEndAt ? formatDeadline(activityEndAt) : "종료일시"}
              </span>

              <CalendarDays
                aria-hidden="true"
                className="size-5 shrink-0 text-icon"
              />
            </button>
          </div>
        </FormField>

        <FormField
          label={`최대 인원 (${MAX_RECRUIT_CAPACITY}명)`}
          htmlFor="recruit-capacity"
          error={errors.recruitCapacity}
        >
          <Input
            id="recruit-capacity"
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_RECRUIT_CAPACITY}
            value={recruitCapacity}
            invalid={Boolean(errors.recruitCapacity)}
            className="h-12 w-20"
            onChange={(event) => {
              setRecruitCapacity(event.target.value);
              clearError("recruitCapacity");
            }}
          />
        </FormField>

        <FormField
          label="카테고리"
          required
          description={
            errors.categories ? undefined : "최대 3개까지 선택할 수 있어요."
          }
          error={errors.categories}
        >
          <div className="-mx-5.5 flex touch-pan-x gap-2 overflow-x-auto px-5.5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {orderedCategories.map((category) => {
              const selected = categories.includes(category);

              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                  onClick={() => {
                    toggleCategory(category);
                  }}
                >
                  <MeetingCategoryTag category={category} selected={selected} />
                </button>
              );
            })}
          </div>
        </FormField>

        <div className="flex h-14 items-center justify-between rounded-xl border border-stroke bg-white px-4">
          <span className="text-[14px] font-medium text-text">
            봉사 시간 인정 여부
          </span>

          <button
            type="button"
            role="switch"
            aria-label="봉사 시간 인정 여부"
            aria-checked={timeVerified}
            className={`flex h-6 w-11 items-center rounded-full px-0.5 transition ${
              timeVerified ? "justify-end bg-icon" : "justify-start bg-stroke"
            }`}
            onClick={() => {
              setTimeVerified((current) => !current);
            }}
          >
            <span className="size-5 rounded-full bg-white shadow" />
          </button>
        </div>

        <FormField label="신청 마감일" error={errors.recruitDeadline}>
          <button
            type="button"
            className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-button/40 ${
              errors.recruitDeadline ? "border-point-red" : "border-stroke"
            }`}
            onClick={() => {
              setDraftRecruitDeadline(
                parseLocalDateTimeInput(recruitDeadline) ??
                  createDefaultDeadline(activityStartAt),
              );

              setDeadlineSheetError(null);
              setIsDeadlineSheetOpen(true);
            }}
          >
            <span
              className={
                recruitDeadline
                  ? "text-[14px] text-text"
                  : "text-[14px] text-text-gray-100"
              }
            >
              {formatDeadline(recruitDeadline)}
            </span>

            <CalendarDays
              aria-hidden="true"
              className="size-5 shrink-0 text-icon"
            />
          </button>
        </FormField>

        <FormField
          label="참여 조건"
          htmlFor="participation-condition"
          count={participationCondition.length}
          maxLength={PARTICIPATION_CONDITION_MAX_LENGTH}
        >
          <Textarea
            id="participation-condition"
            value={participationCondition}
            maxLength={PARTICIPATION_CONDITION_MAX_LENGTH}
            placeholder="예: 만 14세 이상, 편한 복장 필수"
            className="h-24 resize-none"
            onChange={(event) => {
              setParticipationCondition(
                event.target.value.slice(0, PARTICIPATION_CONDITION_MAX_LENGTH),
              );
            }}
          />
        </FormField>

        <Button
          type="submit"
          fullWidth
          disabled={isSubmitDisabled}
          className="mt-1 h-12 rounded-full text-[16px]"
        >
          등록하기
        </Button>
      </form>

      <BottomSheet
        open={isActivityDateTimeSheetOpen}
        onOpenChange={setIsActivityDateTimeSheetOpen}
        title={editingTime === "start" ? "시작일시" : "종료일시"}
        className="h-[96dvh] max-h-[55rem] rounded-t-[40px] bg-bg"
        contentClassName="overflow-y-auto overscroll-contain px-5.5 pt-3 pb-1"
        footer={
          <div>
            {activityDateTimeSheetError ? (
              <p
                role="alert"
                className="mb-3 text-center text-[12px] text-point-red"
              >
                {activityDateTimeSheetError}
              </p>
            ) : null}

            <Button
              type="button"
              fullWidth
              onClick={() => {
                const nextValue = formatLocalDateTimeForInput(
                  draftActivityDateTime,
                );

                if (!nextValue) {
                  setActivityDateTimeSheetError("일시를 다시 선택해 주세요.");
                  return;
                }

                const nextDate = parseLocalDateTimeInput(nextValue);

                if (!nextDate) {
                  setActivityDateTimeSheetError("일시를 다시 선택해 주세요.");
                  return;
                }

                if (editingTime === "start") {
                  const currentEnd = parseLocalDateTimeInput(activityEndAt);

                  setActivityStartAt(nextValue);
                  clearError("activityDate");

                  if (currentEnd && currentEnd <= nextDate) {
                    setActivityEndAt("");
                  }

                  const deadline = parseLocalDateTimeInput(recruitDeadline);

                  if (deadline && deadline >= nextDate) {
                    setRecruitDeadline("");
                  }
                } else {
                  const currentStart = parseLocalDateTimeInput(activityStartAt);

                  if (currentStart && nextDate <= currentStart) {
                    setActivityDateTimeSheetError(
                      "종료일시는 시작일시보다 늦어야 해요.",
                    );
                    return;
                  }

                  setActivityEndAt(nextValue);
                  clearError("activityTime");
                }

                setActivityDateTimeSheetError(null);
                setIsActivityDateTimeSheetOpen(false);
              }}
            >
              적용하기
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="flex h-[68px] shrink-0 items-center justify-between rounded-2xl border border-button bg-white px-4">
            <p className="text-[14px] font-medium text-text-gray-400">
              {formatDeadlineSummary(draftActivityDateTime)}
            </p>

            <CalendarDays aria-hidden="true" className="size-6 text-icon" />
          </div>

          <div className="min-h-[348px] shrink-0 rounded-2xl border border-button bg-white px-1 pb-2">
            <SingleDateCalendar
              selected={draftActivityDateTime}
              onSelect={(date) => {
                const nextDate = new Date(date);

                nextDate.setHours(
                  draftActivityDateTime.getHours(),
                  draftActivityDateTime.getMinutes(),
                  0,
                  0,
                );

                setDraftActivityDateTime(nextDate);
                setActivityDateTimeSheetError(null);
              }}
            />
          </div>

          <div className="shrink-0">
            <TimeWheelPicker
              value={draftActivityDateTime}
              onChange={(date) => {
                setDraftActivityDateTime(date);
                setActivityDateTimeSheetError(null);
              }}
            />
          </div>
        </div>
      </BottomSheet>

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
              setDraftRecruitDeadline(createDefaultDeadline(activityStartAt));

              setDeadlineSheetError(null);
            }}
          >
            재설정
            <RefreshCw aria-hidden="true" className="size-4" />
          </button>
        }
        footer={
          <div>
            {deadlineSheetError ? (
              <p
                role="alert"
                className="mb-3 text-center text-[12px] text-point-red"
              >
                {deadlineSheetError}
              </p>
            ) : null}

            <Button
              type="button"
              fullWidth
              onClick={() => {
                const activityStart = parseActivityDateTime(activityStartAt);

                if (activityStart && draftRecruitDeadline >= activityStart) {
                  setDeadlineSheetError(
                    "신청 마감일은 활동 시작 전으로 선택해 주세요.",
                  );

                  return;
                }

                const nextDeadline =
                  formatLocalDateTimeForInput(draftRecruitDeadline);

                if (!nextDeadline) {
                  setDeadlineSheetError("신청 마감일을 다시 선택해 주세요.");

                  return;
                }

                setRecruitDeadline(nextDeadline);
                clearError("recruitDeadline");
                setDeadlineSheetError(null);
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
            <p className="text-[14px] font-medium text-text-gray-400">
              {formatDeadlineSummary(draftRecruitDeadline)}
            </p>

            <CalendarDays aria-hidden="true" className="size-6 text-icon" />
          </div>

          <div className="min-h-[348px] rounded-2xl border border-button bg-white px-1 pb-2">
            <SingleDateCalendar
              selected={draftRecruitDeadline}
              maxDate={
                activityStartAt
                  ? (parseActivityDateTime(activityStartAt) ?? undefined)
                  : undefined
              }
              onSelect={(date) => {
                const nextDeadline = new Date(date);

                nextDeadline.setHours(
                  draftRecruitDeadline.getHours(),
                  draftRecruitDeadline.getMinutes(),
                  0,
                  0,
                );

                setDraftRecruitDeadline(nextDeadline);

                setDeadlineSheetError(null);
              }}
            />
          </div>

          <TimeWheelPicker
            value={draftRecruitDeadline}
            onChange={(date) => {
              setDraftRecruitDeadline(date);
              setDeadlineSheetError(null);
            }}
          />
        </div>
      </BottomSheet>
      <RegionSelectionSheet
        open={isRegionSheetOpen}
        onOpenChange={setIsRegionSheetOpen}
        title="장소"
        value={placeRegionId ? Number(placeRegionId) : undefined}
        onApply={(regionId) => {
          setPlaceRegionId(String(regionId));
          clearError("place");
        }}
      />

      <MobileBottomNavigation />
    </div>
  );
}
