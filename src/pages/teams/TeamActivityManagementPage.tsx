import { CalendarDays, MapPin } from "lucide-react";
import { Navigate, useNavigate } from "react-router";

import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import { useMeetingRecruitActivitiesQuery } from "@/features/team/hooks/useMeetingRecruitActivitiesQuery";
import PageHeader from "@/shared/ui/PageHeader";

type ManagedActivity = {
  postId: number;
  title: string;
  place: string;
  activityDate: string;
  startTime: string;
  endTime: string;
  applicationStartDate: string;
  applicationEndDate: string;
  applicantCount: number;
  capacity: number;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.replaceAll("-", ".");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function formatActivityDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(date.getTime())
  ) {
    return value;
  }

  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(
    2,
    "0",
  )} (${DAY_LABELS[date.getDay()]})`;
}

export function TeamActivityManagementPage() {
  const navigate = useNavigate();
  const { home, isHost } = useTeamDetailContext();

  const activitiesQuery = useMeetingRecruitActivitiesQuery(home.meetingId, {
    enabled: isHost,
  });

  if (!isHost) {
    return <Navigate to={`/teams/${home.meetingId}`} replace />;
  }

  const activities: ManagedActivity[] = (activitiesQuery.data ?? []).map(
    (recruit) => ({
      postId: recruit.postId,
      title: recruit.title,
      place: recruit.place,
      activityDate: formatActivityDate(recruit.actDate),
      startTime: recruit.actStartTime ?? "",
      endTime: recruit.actEndTime ?? "",
      applicationStartDate: formatDate(recruit.createdAt),
      applicationEndDate: formatDate(recruit.applyDeadline),
      applicantCount: recruit.appliedCount,
      capacity: recruit.maxParticipants,
    }),
  );

  return (
    <main className="min-h-dvh bg-bg px-5.5">
      <PageHeader
        title="활동 관리"
        onBack={() => navigate(-1)}
        rightAction={
          <span className="rounded-lg bg-[#6D6D6D] px-3 py-1.5 text-[12px] font-medium text-white">
            팀장
          </span>
        }
        sticky
      />

      <section className="pb-28 pt-6">
        {activitiesQuery.isLoading ? (
          <div className="flex min-h-60 items-center justify-center">
            <p className="text-[15px] text-text-gray-200">
              활동을 불러오는 중이에요.
            </p>
          </div>
        ) : activitiesQuery.isError ? (
          <div className="flex min-h-60 flex-col items-center justify-center gap-3">
            <p className="text-[15px] text-text-gray-200">
              활동을 불러오지 못했어요.
            </p>

            <button
              type="button"
              className="h-9 rounded-lg border border-stroke bg-white px-4 text-[13px] font-medium text-text"
              onClick={() => {
                void activitiesQuery.refetch();
              }}
            >
              다시 시도
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center text-center">
            <p className="text-[16px] font-medium text-text">
              등록된 봉사활동이 없어요
            </p>

            <p className="mt-2 text-[14px] text-text-gray-200">
              모임에서 진행할 봉사활동을 등록해 주세요.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {activities.map((activity) => {
              const progress =
                activity.capacity > 0
                  ? Math.min(
                      100,
                      (activity.applicantCount / activity.capacity) * 100,
                    )
                  : 0;

              return (
                <li
                  key={activity.postId}
                  className="rounded-xl border border-stroke bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 flex-1 text-[15px] font-semibold leading-5 text-text">
                      {activity.title}
                    </h2>

                    <button
                      type="button"
                      className="shrink-0 text-[11px] font-medium text-text-gray-300 underline underline-offset-2"
                      onClick={() => {
                        navigate(
                          `/teams/${home.meetingId}/posts/${activity.postId}`,
                        );
                      }}
                    >
                      봉사 공고로 이동
                    </button>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-[13px] font-semibold text-text">
                      봉사 일정 및 장소
                    </h3>

                    <div className="mt-2 flex items-center gap-2 text-[12px] text-text">
                      <CalendarDays
                        aria-hidden="true"
                        className="size-4 shrink-0 text-button"
                      />

                      <span>
                        {activity.activityDate} {activity.startTime} ~{" "}
                        {activity.endTime}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-[12px] text-text">
                      <MapPin
                        aria-hidden="true"
                        className="size-4 shrink-0 text-button"
                      />

                      <span className="truncate">{activity.place}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-[13px] font-semibold text-text">
                      신청 기간
                    </h3>

                    <p className="mt-2 text-[12px] text-text">
                      {activity.applicationStartDate} ~{" "}
                      {activity.applicationEndDate}
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[12px] text-text">
                      <span className="font-medium">참여 신청 현황</span>

                      <span>
                        {activity.applicantCount} / {activity.capacity}명
                      </span>
                    </div>

                    <div
                      role="progressbar"
                      aria-label={`${activity.title} 신청 현황`}
                      aria-valuemin={0}
                      aria-valuemax={activity.capacity}
                      aria-valuenow={activity.applicantCount}
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-stroke"
                    >
                      <div
                        className="h-full rounded-full bg-button"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="h-10 rounded-lg border border-button bg-white text-[13px] font-medium text-button"
                      onClick={() => {
                        navigate(
                          `/teams/${home.meetingId}/posts/${activity.postId}/recruit/edit`,
                        );
                      }}
                    >
                      공고 수정
                    </button>

                    <button
                      type="button"
                      className="h-10 rounded-lg border border-button bg-white text-[13px] font-medium text-button"
                      onClick={() => {
                        navigate(
                          `/teams/${home.meetingId}/settings/activities/${activity.postId}/applicants`,
                        );
                      }}
                    >
                      신청자 보기
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
