import activatingPeopleIcon from "@/assets/volunteer/activatingpeople.svg";
import rightArrowIcon from "@/assets/volunteer/rightarrow.svg";
import { POSTING_CATEGORY_LABEL } from "@/features/category/constants/postingCategory.constants";
import { POSTING_CATEGORY_TILE_STYLE } from "@/features/category/constants/postingCategoryStyles";
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
      className="flex min-h-20 w-full items-center gap-4 rounded-xl border border-stroke bg-white px-4 py-4 text-left transition hover:border-point-green focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
    >
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-xl text-center text-sm leading-5 font-semibold whitespace-pre-line",
          category === "ENVIRONMENT"
            ? "bg-[#F1FFFD] text-[#82D3CA]"
            : POSTING_CATEGORY_TILE_STYLE[category],
        )}
      >
        {POSTING_CATEGORY_LABEL[category].replace(" ", "\n")}
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
            className="size-4 shrink-0"
          />
          <span>{activityLabel}</span>
        </p>
      </div>

      <span className="flex size-12 shrink-0 items-center justify-center">
        <img
          src={rightArrowIcon}
          alt=""
          aria-hidden="true"
          className="h-[21px] w-3"
        />
      </span>
    </button>
  );
}
