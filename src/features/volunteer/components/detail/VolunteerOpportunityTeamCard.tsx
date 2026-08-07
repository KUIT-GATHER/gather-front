import activatingPeopleIcon from "@/assets/volunteer/activatingpeople.svg";
import rightArrowIcon from "@/assets/volunteer/rightarrow.svg";
import { POSTING_CATEGORY_LABEL } from "@/features/category/constants/postingCategory.constants";
import { POSTING_CATEGORY_BADGE_STYLE } from "@/features/category/constants/postingCategoryStyles";
import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import { cn } from "@/shared/lib/cn";

type VolunteerOpportunityTeamCardProps = {
  name: string;
  category: PostingCategory;
  activityLabel: string;
  onClick: () => void;
};

export function VolunteerOpportunityTeamCard({
  name,
  category,
  activityLabel,
  onClick,
}: VolunteerOpportunityTeamCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-22 w-full items-center gap-4 rounded-xl border border-stroke bg-white px-4 py-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-point-green focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
    >
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
          POSTING_CATEGORY_BADGE_STYLE[category],
        )}
      >
        {POSTING_CATEGORY_LABEL[category]}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base leading-5.5 font-medium text-text">
          {name}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-[15px] leading-5.5 font-normal text-text-gray-400">
          <img
            src={activatingPeopleIcon}
            alt=""
            aria-hidden="true"
            className="size-3.5 shrink-0"
          />
          <span>{activityLabel}</span>
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
