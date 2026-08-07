import { useNavigate } from "react-router";

import CalendarIcon from "@/assets/volunteer/calender.svg";
import ClockIcon from "@/assets/volunteer/clock.svg";
import LocationIcon from "@/assets/volunteer/location.svg";
import {
  formatMeetingRecruitActivitySchedule,
  formatMeetingRecruitApplicationDeadline,
} from "@/features/team/lib/meetingRecruitFormatters";
import type { ManagedMeetingRecruit } from "@/features/team/types/meetingRecruit.types";
import Button from "@/shared/ui/Button";

function SummaryIcon({ src }: { src: string }) {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center">
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="h-full w-full object-contain"
      />
    </span>
  );
}

type ManagedRecruitCardProps = {
  meetingId: number;
  activity: ManagedMeetingRecruit;
};

export function ManagedRecruitCard({
  meetingId,
  activity,
}: ManagedRecruitCardProps) {
  const navigate = useNavigate();
  const progress = activity.maxParticipants
    ? Math.min(100, (activity.appliedCount / activity.maxParticipants) * 100)
    : 0;

  return (
    <li className="rounded-2xl border border-stroke bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 flex-1 text-title-18 text-text">
          {activity.title}
        </h2>
        <button
          type="button"
          className="shrink-0 pt-1 text-body-14 text-text-gray-400 underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
          onClick={() =>
            navigate(
              `/volunteers/meeting-recruits/${meetingId}/${activity.postId}`,
            )
          }
        >
          봉사 공고로 이동
        </button>
      </div>

      <div className="mt-5">
        <h3 className="text-base font-semibold text-text">봉사 일정 및 장소</h3>
        <dl className="mt-3 flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <SummaryIcon src={CalendarIcon} />
            <dt className="sr-only">봉사 일정</dt>
            <dd className="min-w-0 text-body-14 text-text">
              {formatMeetingRecruitActivitySchedule(
                activity.activityStartAt,
                activity.activityEndAt,
              )}
            </dd>
          </div>
          <div className="flex items-start gap-3">
            <SummaryIcon src={LocationIcon} />
            <dt className="sr-only">봉사 장소</dt>
            <dd className="min-w-0 text-body-14 text-text">{activity.place}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-5">
        <h3 className="text-base font-semibold text-text">신청 마감일</h3>
        <div className="mt-3 flex items-start gap-3">
          <SummaryIcon src={ClockIcon} />
          <p className="min-w-0 text-body-14 text-text">
            {formatMeetingRecruitApplicationDeadline(activity.applyDeadlineAt)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between text-body-14 text-text">
        <span className="font-semibold">참여 신청 현황</span>
        <span className="font-medium">
          {activity.appliedCount} / {activity.maxParticipants}명
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stroke">
        <div
          className="h-full rounded-full bg-button"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button
          variant="primaryOutline"
          size="medium"
          className="text-body-14"
          disabled={!activity.canEdit}
          onClick={() =>
            navigate(
              `/teams/${meetingId}/posts/${activity.postId}/recruit/edit`,
            )
          }
        >
          공고 수정
        </Button>
        <Button
          variant="primaryOutline"
          size="medium"
          className="text-body-14"
          onClick={() =>
            navigate(
              `/teams/${meetingId}/settings/activities/${activity.postId}/applicants`,
            )
          }
        >
          신청자 보기
        </Button>
      </div>
    </li>
  );
}
