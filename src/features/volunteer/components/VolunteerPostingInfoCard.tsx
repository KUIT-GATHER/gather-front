import CalendarIcon from "@/assets/volunteer/calender.svg";
import ClockIcon from "@/assets/volunteer/clock.svg";
import ExpireDateIcon from "@/assets/volunteer/expiredate.svg";
import LocationIcon from "@/assets/volunteer/location.svg";
import MemberIcon from "@/assets/volunteer/member.svg";
import PortalOrgIcon from "@/assets/volunteer/portalorg.svg";
import VolunteerOrgIcon from "@/assets/volunteer/volunteerorg.svg";
import type { VolunteerPosting } from "@/features/volunteer/types/volunteer.types";
import { cn } from "@/shared/lib/cn";

type VolunteerPostingInfoCardProps = {
  posting: VolunteerPosting;
  className?: string;
};

type InfoRow = {
  icon: string;
  label: string;
  value: string;
};

function formatDate(date: string, weekday?: string) {
  const normalizedDate = date.replaceAll("-", ".");

  return weekday ? `${normalizedDate} (${weekday})` : normalizedDate;
}

function formatDateRange(posting: VolunteerPosting) {
  if (posting.actStartDate === posting.actEndDate) {
    return formatDate(posting.actStartDate, posting.actWkdy);
  }

  return `${formatDate(posting.actStartDate)} ~ ${formatDate(
    posting.actEndDate,
    posting.actWkdy,
  )}`;
}

function formatTimeRange(startTime: string, endTime: string) {
  return `${startTime} ~ ${endTime}`;
}

function getLocation(posting: VolunteerPosting) {
  return posting.locations[0]?.address ?? posting.actPlace;
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

export function VolunteerPostingInfoCard({
  posting,
  className,
}: VolunteerPostingInfoCardProps) {
  const rows: InfoRow[] = [
    {
      icon: LocationIcon,
      label: "장소",
      value: getLocation(posting),
    },
    {
      icon: CalendarIcon,
      label: "날짜",
      value: formatDateRange(posting),
    },
    {
      icon: ClockIcon,
      label: "시간",
      value: formatTimeRange(posting.actStartTime, posting.actEndTime),
    },
    {
      icon: MemberIcon,
      label: "참여 인원",
      value: `${posting.applicantCount}/${posting.recruitCount}명`,
    },
    {
      icon: ExpireDateIcon,
      label: "신청 마감",
      value: formatDate(posting.noticeEndDate),
    },
    {
      icon: VolunteerOrgIcon,
      label: "봉사 기관명",
      value: posting.recruitOrg,
    },
    {
      icon: PortalOrgIcon,
      label: "포털 등록 기관명",
      value: posting.registerOrg,
    },
  ];

  return (
    <section
      className={cn(
        "rounded-xl border border-stroke bg-white px-3 py-4",
        className,
      )}
    >
      <dl className="flex flex-col gap-2">
        {rows.map((row) => (
          <DetailRow key={row.label} {...row} />
        ))}
      </dl>
    </section>
  );
}
