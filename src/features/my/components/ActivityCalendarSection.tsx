import {
  type ReactNode,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";

import { useMyActivitiesQuery } from "@/features/my/hooks/useMyActivitiesQuery";
import {
  canCancelMeetingRecruitActivity,
  getMyActivityStatusLabel,
} from "@/features/my/lib/myActivity";
import { formatMyActivityDateRange } from "@/features/my/lib/myActivityDate";
import type {
  MyMeetingRecruitActivity,
  MyPageActivity,
  MyVolunteerActivity,
} from "@/features/my/types/myActivity.types";
import { useToggleMeetingRecruitParticipationMutation } from "@/features/team/hooks/useMeetingRecruitMutations";
import { useCancelVolunteerPostingParticipationMutation } from "@/features/volunteer/hooks/detail/useVolunteerPostingParticipationMutation";
import { cn } from "@/shared/lib/cn";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function getEffectiveEndDate(activity: MyPageActivity) {
  return activity.actEndDate ?? activity.actStartDate;
}

function isActivityOnDate(activity: MyPageActivity, dateKey: string) {
  return (
    activity.actStartDate <= dateKey && dateKey <= getEffectiveEndDate(activity)
  );
}

function formatActivityTime(startTime: string | null, endTime: string | null) {
  if (startTime && endTime) return `${startTime}–${endTime}`;
  return startTime ?? endTime ?? null;
}

function getActivityLocation(activity: MyPageActivity) {
  const location = activity.actPlace ?? activity.regionName;

  return location?.trim() || "장소 미정";
}

function formatActivityMetadata(activity: MyPageActivity) {
  const date = formatMyActivityDateRange(
    activity.actStartDate,
    activity.actEndDate,
  );
  const time = formatActivityTime(activity.actStartTime, activity.actEndTime);
  const schedule = time ? `${date} ${time}` : date;

  return [schedule, getActivityLocation(activity)].filter(Boolean).join(" | ");
}

function VolunteerActivityCard({
  activity,
}: {
  activity: MyVolunteerActivity;
}) {
  const navigate = useNavigate();
  const cancelMutation = useCancelVolunteerPostingParticipationMutation(
    activity.postingId,
  );
  const isCancelable = activity.participationAction === "CANCEL";

  return (
    <ActivityCardFrame
      activity={activity}
      statusLabel={getMyActivityStatusLabel(activity.status)}
    >
      {isCancelable ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
            className="h-9 rounded-[10px] border border-stroke text-body-14 font-medium text-text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelMutation.isPending ? "취소 중..." : "신청 취소"}
          </button>
          <ActivityDetailButton
            onClick={() => navigate(`/volunteers/${activity.postingId}`)}
          />
        </div>
      ) : (
        <ActivityDetailButton
          fullWidth
          onClick={() => navigate(`/volunteers/${activity.postingId}`)}
        />
      )}
    </ActivityCardFrame>
  );
}

function MeetingRecruitActivityCard({
  activity,
}: {
  activity: MyMeetingRecruitActivity;
}) {
  const navigate = useNavigate();
  const participationMutation = useToggleMeetingRecruitParticipationMutation(
    activity.meetingId,
    activity.postId,
  );
  const isCancelable = canCancelMeetingRecruitActivity(activity);
  const detailPath = `/volunteers/meeting-recruits/${activity.meetingId}/${activity.postId}`;

  return (
    <ActivityCardFrame
      activity={activity}
      statusLabel={getMyActivityStatusLabel(activity.status)}
    >
      {isCancelable ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={participationMutation.isPending}
            onClick={() => participationMutation.mutate()}
            className="h-9 rounded-[10px] border border-stroke text-body-14 font-medium text-text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {participationMutation.isPending ? "취소 중..." : "신청 취소"}
          </button>
          <ActivityDetailButton onClick={() => navigate(detailPath)} />
        </div>
      ) : (
        <ActivityDetailButton fullWidth onClick={() => navigate(detailPath)} />
      )}
    </ActivityCardFrame>
  );
}

function ActivityCardFrame({
  activity,
  statusLabel,
  children,
}: {
  activity: MyPageActivity;
  statusLabel: string;
  children: ReactNode;
}) {
  return (
    <article className="flex min-h-[145px] flex-col justify-between rounded-xl border border-stroke bg-white px-3 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-body-15-semibold">{activity.title}</h3>
          <p className="mt-2 truncate text-body-14 text-text-gray-400">
            {formatActivityMetadata(activity)}
          </p>
        </div>
        <span className="shrink-0 rounded-[10px] bg-text-gray-400 px-2 py-0.5 text-body-14 text-text2">
          {statusLabel}
        </span>
      </div>
      {children}
    </article>
  );
}

function ActivityDetailButton({
  fullWidth = false,
  onClick,
}: {
  fullWidth?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 rounded-[10px] bg-button/15 text-body-14 font-medium text-text-gray-400",
        fullWidth && "w-full",
      )}
    >
      상세 보기
    </button>
  );
}

export function ActivityCalendarSection() {
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const selectedButtonRef = useRef<HTMLButtonElement>(null);
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const yearMonth = `${year}-${pad(monthIndex + 1)}`;
  const activitiesQuery = useMyActivitiesQuery(yearMonth);
  const activities = useMemo(
    () => activitiesQuery.data ?? [],
    [activitiesQuery.data],
  );
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const selectedDate = toDateKey(year, monthIndex, selectedDay);
  const todayKey = toDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const days = Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1;
    const dateKey = toDateKey(year, monthIndex, day);

    return {
      day,
      dateKey,
      label: DAY_LABELS[new Date(year, monthIndex, day).getDay()],
      isToday: dateKey === todayKey,
      hasActivity: activities.some((activity) =>
        isActivityOnDate(activity, dateKey),
      ),
    };
  });

  const selectedActivities = activities.filter((activity) =>
    isActivityOnDate(activity, selectedDate),
  );

  useLayoutEffect(() => {
    selectedButtonRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [yearMonth, selectedDay]);

  const moveMonth = (offset: number) => {
    const next = new Date(year, monthIndex + offset, 1);
    const nextLastDay = new Date(
      next.getFullYear(),
      next.getMonth() + 1,
      0,
    ).getDate();
    setSelectedDay((day) => Math.min(day, nextLastDay));
    setMonth(next);
  };

  return (
    <section className="mt-12" aria-labelledby="activity-calendar-title">
      <h2 id="activity-calendar-title" className="text-title-18">
        다가오는 활동
      </h2>

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="이전 달"
          className="-ml-1 p-1"
          onClick={() => moveMonth(-1)}
        >
          <ChevronLeft className="size-8 stroke-[1.8]" />
        </button>
        <strong className="text-title-18">
          {year}년 {monthIndex + 1}월
        </strong>
        <button
          type="button"
          aria-label="다음 달"
          className="-mr-1 p-1"
          onClick={() => moveMonth(1)}
        >
          <ChevronRight className="size-8 stroke-[1.8]" />
        </button>
      </div>

      <div className="-mx-5.5 mt-4 overflow-x-auto px-5.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-3">
          {days.map((item) => {
            const isSelected = item.day === selectedDay;

            return (
              <button
                ref={isSelected ? selectedButtonRef : undefined}
                key={item.dateKey}
                type="button"
                onClick={() => setSelectedDay(item.day)}
                aria-pressed={isSelected}
                className={cn(
                  "flex h-[59px] w-[35px] shrink-0 flex-col items-center justify-center gap-1 rounded-[17px] border text-sm",
                  item.isToday
                    ? "border-text-green-500 bg-text-green-500 text-text2"
                    : item.hasActivity
                      ? "border-stroke bg-button/5 text-text"
                      : "border-stroke bg-white text-text",
                  isSelected && !item.isToday && "ring-2 ring-inset ring-icon",
                )}
              >
                <span className="font-medium">{item.day}</span>
                <span>{item.isToday ? "오늘" : item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {activitiesQuery.isPending ? (
          <p className="py-8 text-center text-body-14 text-text-gray-400">
            일정을 불러오는 중이에요.
          </p>
        ) : activitiesQuery.isError ? (
          <button
            type="button"
            onClick={() => void activitiesQuery.refetch()}
            className="w-full py-8 text-center text-body-14 text-text-gray-400"
          >
            일정을 불러오지 못했어요. 다시 시도
          </button>
        ) : selectedActivities.length > 0 ? (
          selectedActivities.map((activity) =>
            activity.activityType === "VOLUNTEER" ? (
              <VolunteerActivityCard
                key={`volunteer-${activity.participationId}`}
                activity={activity}
              />
            ) : (
              <MeetingRecruitActivityCard
                key={`meeting-recruit-${activity.participationId}`}
                activity={activity}
              />
            ),
          )
        ) : (
          <p className="py-8 text-center text-body-14 text-text-gray-400">
            선택한 날짜에 활동이 없어요.
          </p>
        )}
      </div>
    </section>
  );
}
