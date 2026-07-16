import { CategoryBadge } from "@/features/category/components/CategoryBadge";
import { POSTING_CATEGORY_LABEL } from "@/features/category/constants/postingCategory.constants";
import {
  formatMeetingActivityDate,
  getMeetingDDay,
} from "@/features/team/lib/teamFormatters";
import type { MeetingListItem } from "@/features/team/types/team.types";
import { cn } from "@/shared/lib/cn";

type TeamCardProps = {
  team: MeetingListItem;
  onClick: () => void;
  variant?: "list" | "compact";
};

export function TeamCard({ team, onClick, variant = "list" }: TeamCardProps) {
  const activityDate = formatMeetingActivityDate(team.activityStartAt);
  const deadline = getMeetingDDay(team.deadline);

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-52 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
      >
        <div className="flex h-36 items-center justify-center bg-[#F8FBF8] p-5 text-center text-lg font-semibold text-button">
          {POSTING_CATEGORY_LABEL[team.category]}
        </div>
        <div className="p-3">
          <h3 className="truncate text-[15px] font-bold">{team.name}</h3>
          {team.description ? (
            <p className="mt-1 truncate text-sm text-gray-500">
              {team.description}
            </p>
          ) : null}
          <p className="mt-2 truncate text-xs text-gray-400">
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
      <div className="flex h-[100px] w-[76px] shrink-0 items-center justify-center rounded-lg bg-[#F8FBF8] p-3 text-center text-sm font-semibold text-button">
        {POSTING_CATEGORY_LABEL[team.category]}
      </div>

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
