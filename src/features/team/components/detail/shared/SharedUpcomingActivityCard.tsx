import CalendarIcon from "@/shared/assets/icons/info/calender.svg";
import LocationIcon from "@/shared/assets/icons/info/location.svg";
import {
  formatMeetingFullDate,
  formatMeetingTimeRange,
} from "@/features/team/lib/teamFormatters";
import type { UpcomingActivity } from "@/features/team/types/team.types";

type SharedUpcomingActivityCardProps = {
  activity: UpcomingActivity | null;
};

export function SharedUpcomingActivityCard({
  activity,
}: SharedUpcomingActivityCardProps) {
  if (!activity) {
    return null;
  }

  const date = formatMeetingFullDate(activity.activityDate);
  const timeRange = formatMeetingTimeRange(
    activity.startTime,
    activity.endTime,
  );
  const schedule = [date, timeRange].filter(Boolean).join(" ");

  // 추후 모임 활동 경로 확정 시 카드 클릭 이동 연결 예정
  return (
    <section className="rounded-lg border border-point-green bg-[#F8FBF8] p-3">
      <h2 className="text-[18px] leading-[22.5px] font-semibold text-text">
        다가오는 활동
      </h2>
      <p className="mt-3 text-[16px] leading-[21px] font-semibold text-text">
        {activity.title}
      </p>

      <dl className="mt-2 flex flex-col gap-2.5 text-[14px] leading-4.5 text-text-gray-400">
        {schedule ? (
          <div className="flex items-center gap-1">
            <dt className="sr-only">일시</dt>
            <img src={CalendarIcon} alt="" className="size-3.75" />
            <dd>{schedule}</dd>
          </div>
        ) : null}
        {activity.place ? (
          <div className="flex items-center gap-1">
            <dt className="sr-only">장소</dt>
            <img src={LocationIcon} alt="" className="size-3.75" />
            <dd>{activity.place}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
