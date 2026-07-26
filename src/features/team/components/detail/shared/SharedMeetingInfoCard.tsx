import CalendarIcon from "@/assets/volunteer/calender.svg";
import ClockIcon from "@/assets/volunteer/clock.svg";
import ExpireDateIcon from "@/assets/volunteer/expiredate.svg";
import LocationIcon from "@/assets/volunteer/location.svg";
import MemberIcon from "@/assets/volunteer/member.svg";
import PortalOrgIcon from "@/assets/volunteer/portalorg.svg";
import { formatMeetingFullDate } from "@/features/team/lib/teamFormatters";
import type { MeetingHome } from "@/features/team/types/team.types";

type InfoRow = {
  icon: string;
  label: string;
  value: string;
};

type SharedMeetingInfoCardProps = {
  home: MeetingHome;
};

const MEETING_STATUS_LABEL = {
  RECRUITING: "모집 중",
  CLOSED: "모집 마감",
  COMPLETED: "활동 완료",
} as const;

function isInfoRow(row: InfoRow | null): row is InfoRow {
  return row !== null;
}

function DetailRow({ icon, label, value }: InfoRow) {
  return (
    <div className="grid grid-cols-[1.5rem_auto_1fr] items-start gap-2">
      <span className="flex size-6 items-center justify-center">
        <img src={icon} alt="" className="max-h-5 max-w-5" />
      </span>
      <dt className="whitespace-nowrap pt-0.5 text-[15px] leading-normal font-normal text-text-gray-400">
        {label}
      </dt>
      <dd className="pt-0.5 text-right text-[15px] leading-normal font-normal text-text">
        {value}
      </dd>
    </div>
  );
}

export function SharedMeetingInfoCard({ home }: SharedMeetingInfoCardProps) {
  const rows = [
    {
      icon: ExpireDateIcon,
      label: "모집 마감일",
      value: formatMeetingFullDate(home.deadline) ?? home.deadline,
    },
    home.regionName
      ? {
          icon: LocationIcon,
          label: "장소",
          value: home.regionName,
        }
      : null,
    {
      icon: MemberIcon,
      label: "현재 인원",
      value: `${home.currentMemberCount}/${home.maxMember}명`,
    },
    {
      icon: ClockIcon,
      label: "시간 인증",
      // 백엔드 봉사시간 인증 기능 구현 전까지 항상 확인 필요로 표시합니다.
      value: "확인 필요",
    },
    {
      icon: CalendarIcon,
      label: "모집 상태",
      value: MEETING_STATUS_LABEL[home.status],
    },
    home.linkedPostingTitle
      ? {
          icon: PortalOrgIcon,
          label: "연관 공고",
          value: home.linkedPostingTitle,
        }
      : null,
  ].filter(isInfoRow);

  return (
    <section className="rounded-xl border border-stroke bg-white px-3 py-4">
      <dl className="flex flex-col gap-2.75">
        {rows.map((row) => (
          <DetailRow key={row.label} {...row} />
        ))}
      </dl>
    </section>
  );
}
