import { POSTING_CATEGORY_LABEL } from "../constants/postingCategory.constants";
import { POSTING_CATEGORY_PUZZLE_ASSETS } from "../constants/postingCategoryPuzzleAssets";
import { POSTING_CATEGORY_BADGE_STYLE } from "../constants/postingCategoryStyles";
import type { PostingCategory } from "../types/postingCategory.types";

import { cn } from "@/shared/lib/cn";

type CategoryBadgeProps = {
  category: PostingCategory;
  className?: string;
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const { selectedSrc } = POSTING_CATEGORY_PUZZLE_ASSETS[category];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        POSTING_CATEGORY_BADGE_STYLE[category],
        className,
      )}
    >
      <img src={selectedSrc} alt="" aria-hidden="true" className="size-3.5" />
      {POSTING_CATEGORY_LABEL[category]}
    </span>
  );
}
