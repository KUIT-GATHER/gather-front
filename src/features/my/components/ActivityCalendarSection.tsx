import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";

import { useMyActivitiesQuery } from "@/features/my/hooks/useMyActivitiesQuery";
import type { MyPageActivity } from "@/features/my/types/myActivity.types";
import { useCancelVolunteerPostingParticipationMutation } from "@/features/volunteer/hooks/detail/useVolunteerPostingParticipationMutation";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function formatActivityDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return `${year}.${pad(month)}.${pad(day)} (${DAY_LABELS[date.getDay()]})`;
}

function getActivityStatusLabel(status: string) {
  switch (status) {
    case "APPLIED":
    case "CONFIRMED":
      return "신청중";
    case "COMPLETED":
    case "REVIEWED":
      return "봉사 완료";
    default:
      return status;
  }
}

function ActivityCard({ activity }: { activity: MyPageActivity }) {
  const navigate = useNavigate();
  const cancelMutation = useCancelVolunteerPostingParticipationMutation(
    activity.postingId,
  );

  return (
    <article className="flex h-[145px] flex-col justify-center gap-3 rounded-xl border border-[#d9d9d9] bg-white px-3 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-body-15-semibold">{activity.title}</h3>
          <p className="mt-2 truncate text-body-14 text-text-gray-400">
            {formatActivityDate(activity.actStartDate)} {activity.actStartTime}-
            {activity.actEndTime}
            <span className="mx-2">|</span>
            {activity.actPlace}
          </p>
        </div>
        <span className="shrink-0 rounded-[10px] bg-text-gray-400 px-2 py-0.5 text-body-14 text-text2">
          {getActivityStatusLabel(activity.status)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={cancelMutation.isPending}
          onClick={() => cancelMutation.mutate()}
          className="h-9 rounded-[10px] border border-[#c5c5c5] text-[15px] font-medium text-[#5c5c5c]"
        >
          {cancelMutation.isPending ? "취소 중" : "신청 취소"}
        </button>
        <button
          type="button"
          onClick={() => navigate(`/volunteers/${activity.postingId}`)}
          className="h-9 rounded-[10px] bg-[#dcecdf] text-[15px] font-medium text-[#5c5c5c]"
        >
          상세 보기
        </button>
      </div>
    </article>
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
  const activities = activitiesQuery.data ?? [];
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
      hasActivity: activities.some(
        (activity) =>
          activity.actStartDate <= dateKey && dateKey <= activity.actEndDate,
      ),
    };
  });

  const selectedActivities = activities.filter(
    (activity) =>
      activity.actStartDate <= selectedDate &&
      selectedDate <= activity.actEndDate,
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
                className={[
                  "flex h-[59px] w-[35px] shrink-0 flex-col items-center justify-center gap-1 rounded-[17px] border text-sm",
                  item.isToday
                    ? "border-[#2e6136] bg-[#2e6136] text-text2"
                    : item.hasActivity
                      ? "border-[#d9d9d9] bg-[#f0f6f0] text-text"
                      : "border-[#d9d9d9] bg-white text-text",
                  isSelected && !item.isToday ? "ring-2 ring-icon" : "",
                ].join(" ")}
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
          <p className="py-8 text-center text-body-14 text-text-gray-400">
            일정을 불러오지 못했어요.
          </p>
        ) : selectedActivities.length > 0 ? (
          selectedActivities.map((activity) => (
            <ActivityCard key={activity.participationId} activity={activity} />
          ))
        ) : (
          <p className="py-8 text-center text-body-14 text-text-gray-400">
            선택한 날짜에 예정된 활동이 없어요.
          </p>
        )}
      </div>
    </section>
  );
}
