import { CategoryBadge } from "@/features/category/components/CategoryBadge";
import {
  formatMeetingActivityDate,
  getMeetingDDay,
} from "@/features/team/lib/teamFormatters";
import { getMeetingImage } from "@/features/team/lib/getMeetingImage";
import type { MeetingListItem } from "@/features/team/types/team.types";
import { cn } from "@/shared/lib/cn";

type TeamCardProps = {
  team: MeetingListItem;
  onClick: () => void;
  variant?: "list" | "compact";
  regionName?: string | null;
};

export function TeamCard({
  team,
  onClick,
  variant = "list",
  regionName,
}: TeamCardProps) {
  const activityDate = formatMeetingActivityDate(team.activityStartAt);
  const deadline = getMeetingDDay(team.deadline);
  const imageSrc = getMeetingImage(team.category, team.meetingId);

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-[193px] shrink-0 rounded-xl border border-[#c5c5c5] bg-white p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
      >
        <img
          src={imageSrc}
          alt=""
          className="h-[202px] w-[167px] rounded-[10px] object-cover"
        />
        <div className="mt-2.5">
          <h3 className="truncate text-body-15-semibold text-text">
            {team.name}
          </h3>
          {team.description ? (
            <p className="mt-[3px] truncate text-sm font-medium leading-4 text-text-gray-400">
              {team.description}
            </p>
          ) : null}
          <p className="mt-[3px] truncate text-sm leading-4 text-text-gray-100">
            {regionName ? `${regionName} \u00b7 ` : ""}
            {team.currentMemberCount}/{team.maxMember}명
            {activityDate ? ` · ${activityDate}` : ""}
          </p>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-3 rounded-xl border border-gray-200 p-3 text-left"
    >
      <img
        src={imageSrc}
        alt=""
        className="h-[100px] w-[76px] shrink-0 rounded-lg object-cover"
      />

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-bold">{team.name}</h2>
        {team.description ? (
          <p className="mt-1 truncate text-sm text-gray-500">
            {team.description}
          </p>
        ) : null}
        <p className="mt-1 truncate text-xs text-gray-500">
          {team.currentMemberCount}/{team.maxMember}명
          {activityDate ? ` · ${activityDate}` : ""}
          {deadline ? (
            <span
              className={cn(
                "font-medium",
                deadline === "마감" ? "text-text-gray-400" : "text-red-500",
              )}
            >
              {" "}
              · {deadline}
            </span>
          ) : null}
        </p>

        <div className="mt-2 flex flex-wrap gap-1">
          <CategoryBadge category={team.category} className="text-[11px]" />
        </div>
      </div>
    </button>
  );
}
