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
  const urgentDeadline =
    deadline === "D-day" || /^D-[1-7]$/.test(deadline ?? "") ? deadline : null;
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
      className="flex w-full items-center gap-4 rounded-xl border border-stroke bg-white px-3 py-4 text-left focus:outline-none focus-visible:border-point-green focus-visible:bg-[#f0f6f0] focus-visible:ring-2 focus-visible:ring-point-green/30"
    >
      <img
        src={imageSrc}
        alt=""
        className="h-[106px] w-[91px] shrink-0 rounded-[10px] object-cover"
      />

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-lg font-semibold leading-5 text-text">
          {team.name}
        </h2>
        {team.description ? (
          <p className="mt-3 truncate text-[15px] leading-4 text-text-gray-400">
            {team.description}
          </p>
        ) : null}
        <p className="mt-1 truncate text-sm leading-4 text-text-gray-400">
          {regionName ? `${regionName} · ` : ""}
          {team.currentMemberCount}/{team.maxMember}명
          {activityDate ? ` · ${activityDate}` : ""}
          {urgentDeadline ? (
            <span
              className={cn(
                urgentDeadline === "D-day" ||
                  urgentDeadline === "D-1" ||
                  urgentDeadline === "D-2" ||
                  urgentDeadline === "D-3"
                  ? "font-semibold text-point-red"
                  : "text-point-red",
              )}
            >
              {" "}
              · {urgentDeadline}
            </span>
          ) : null}
        </p>

        <div className="mt-2 flex flex-wrap gap-1">
          <CategoryBadge category={team.category} className="text-sm" />
        </div>
      </div>
    </button>
  );
}
