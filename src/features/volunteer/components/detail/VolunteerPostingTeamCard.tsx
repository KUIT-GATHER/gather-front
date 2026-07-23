import activatingPeopleIcon from "@/assets/volunteer/activatingpeople.svg";
import rightArrowIcon from "@/assets/volunteer/rightarrow.svg";
import { POSTING_CATEGORY_LABEL } from "@/features/category/constants/postingCategory.constants";
import { POSTING_CATEGORY_BADGE_STYLE } from "@/features/category/constants/postingCategoryStyles";
import type { VolunteerPostingMeeting } from "@/features/volunteer/types/volunteer.types";
import { cn } from "@/shared/lib/cn";

type VolunteerPostingTeamCardProps = {
  meeting: VolunteerPostingMeeting;
  onClick: () => void;
};

function getMeetingActivityLabel(meeting: VolunteerPostingMeeting) {
  if (meeting.status === "COMPLETED") {
    return "활동 완료";
  }

  if (meeting.status === "CLOSED") {
    return "모집 마감";
  }

  return `${meeting.currentMemberCount}명 활동중`;
}

export function VolunteerPostingTeamCard({
  meeting,
  onClick,
}: VolunteerPostingTeamCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-22 w-full items-center gap-4 rounded-xl border border-stroke bg-white px-4 py-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-point-green focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
    >
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
          POSTING_CATEGORY_BADGE_STYLE[meeting.category],
        )}
      >
        {POSTING_CATEGORY_LABEL[meeting.category]}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-['Inter'] text-[16px] leading-[22px] font-medium text-black">
          {meeting.name}
        </h3>
        <p className="mt-1 flex items-center gap-1 font-['Inter'] text-[15px] leading-[22px] font-normal text-text-gray-400">
          <img
            src={activatingPeopleIcon}
            alt=""
            aria-hidden="true"
            className="size-3.5 shrink-0"
          />
          <span>{getMeetingActivityLabel(meeting)}</span>
        </p>
      </div>

      <img
        src={rightArrowIcon}
        alt=""
        aria-hidden="true"
        className="h-5.5 w-3 shrink-0"
      />
    </button>
  );
}
