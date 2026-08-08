import { InfoIcon, type InfoIconName } from "@/shared/ui/InfoIcon";
import { formatMeetingFullDate } from "@/features/team/lib/teamFormatters";
import type { MeetingHome } from "@/features/team/types/team.types";

type InfoRow = {
  icon: InfoIconName;
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
      <InfoIcon name={icon} />
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
  const infoRows: (InfoRow | null)[] = [
    {
      icon: "deadline",
      label: "모집 마감일",
      value: formatMeetingFullDate(home.deadline) ?? home.deadline,
    },
    home.regionName
      ? {
          icon: "location",
          label: "장소",
          value: home.regionName,
        }
      : null,
    {
      icon: "participants",
      label: "현재 인원",
      value: `${home.currentMemberCount}/${home.maxMember}명`,
    },
    {
      icon: "time",
      label: "시간 인증",
      // 백엔드 봉사시간 인증 기능 구현 전까지 항상 확인 필요로 표시합니다.
      value: "확인 필요",
    },
    {
      icon: "date",
      label: "모집 상태",
      value: MEETING_STATUS_LABEL[home.status],
    },
    home.linkedPostingTitle
      ? {
          icon: "portalOrganization",
          label: "연관 공고",
          value: home.linkedPostingTitle,
        }
      : null,
  ];
  const rows = infoRows.filter(isInfoRow);

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
