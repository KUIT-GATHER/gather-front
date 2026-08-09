import AnnouncementIcon from "@/shared/assets/icons/info/announcement.svg";
import CalendarIcon from "@/shared/assets/icons/info/calender.svg";
import ClockIcon from "@/shared/assets/icons/info/clock.svg";
import ExpireDateIcon from "@/shared/assets/icons/info/expiredate.svg";
import LocationIcon from "@/shared/assets/icons/info/location.svg";
import MemberIcon from "@/shared/assets/icons/info/member.svg";
import PortalOrgIcon from "@/shared/assets/icons/info/portalorg.svg";
import VolunteerOrgIcon from "@/shared/assets/icons/info/volunteerorg.svg";
import { cn } from "@/shared/lib/cn";

export type InfoIconName =
  | "location"
  | "date"
  | "time"
  | "participants"
  | "deadline"
  | "announcement"
  | "volunteerOrganization"
  | "portalOrganization";

const iconByName: Record<InfoIconName, string> = {
  location: LocationIcon,
  date: CalendarIcon,
  time: ClockIcon,
  participants: MemberIcon,
  deadline: ExpireDateIcon,
  announcement: AnnouncementIcon,
  volunteerOrganization: VolunteerOrgIcon,
  portalOrganization: PortalOrgIcon,
};

const sizeByName: Record<InfoIconName, string> = {
  location: "h-[21px] w-4",
  date: "size-[18px]",
  time: "size-5",
  participants: "size-[21px]",
  deadline: "size-[21px]",
  announcement: "h-[18px] w-[21px]",
  volunteerOrganization: "h-5 w-[21px]",
  portalOrganization: "h-[19px] w-5",
};

export function InfoIcon({
  name,
  className,
}: {
  name: InfoIconName;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center",
        className,
      )}
    >
      <img
        src={iconByName[name]}
        alt=""
        aria-hidden="true"
        className={sizeByName[name]}
      />
    </span>
  );
}
