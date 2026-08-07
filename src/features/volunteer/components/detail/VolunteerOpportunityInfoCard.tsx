import CalendarIcon from "@/assets/volunteer/calender.svg";
import ClockIcon from "@/assets/volunteer/clock.svg";
import ExpireDateIcon from "@/assets/volunteer/expiredate.svg";
import LocationIcon from "@/assets/volunteer/location.svg";
import MemberIcon from "@/assets/volunteer/member.svg";
import PortalOrgIcon from "@/assets/volunteer/portalorg.svg";
import VolunteerOrgIcon from "@/assets/volunteer/volunteerorg.svg";
import { cn } from "@/shared/lib/cn";

export type VolunteerOpportunityInfoIcon =
  | "location"
  | "date"
  | "time"
  | "participants"
  | "deadline"
  | "volunteerOrganization"
  | "portalOrganization";

export type VolunteerOpportunityInfoRow = {
  id: string;
  icon: VolunteerOpportunityInfoIcon;
  label: string;
  value: string;
};

type VolunteerOpportunityInfoCardProps = {
  rows: readonly VolunteerOpportunityInfoRow[];
  className?: string;
};

const iconByType: Record<VolunteerOpportunityInfoIcon, string> = {
  location: LocationIcon,
  date: CalendarIcon,
  time: ClockIcon,
  participants: MemberIcon,
  deadline: ExpireDateIcon,
  volunteerOrganization: VolunteerOrgIcon,
  portalOrganization: PortalOrgIcon,
};

function DetailRow({ icon, label, value }: VolunteerOpportunityInfoRow) {
  return (
    <div className="grid grid-cols-[1.5rem_auto_1fr] items-start gap-2">
      <span className="flex size-6 items-center justify-center">
        <img src={iconByType[icon]} alt="" className="max-h-5 max-w-5" />
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

export function VolunteerOpportunityInfoCard({
  rows,
  className,
}: VolunteerOpportunityInfoCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-stroke bg-white px-3 py-4",
        className,
      )}
    >
      <dl className="flex flex-col gap-2">
        {rows.map((row) => (
          <DetailRow key={row.id} {...row} />
        ))}
      </dl>
    </section>
  );
}
