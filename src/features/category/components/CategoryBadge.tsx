import { Puzzle } from "lucide-react";

import { POSTING_CATEGORY_LABEL } from "../constants/postingCategory.constants";
import { POSTING_CATEGORY_PUZZLE_ASSETS } from "../constants/postingCategoryPuzzleAssets";
import { POSTING_CATEGORY_BADGE_STYLE } from "../constants/postingCategoryStyles";
import {
  POSTING_CATEGORIES,
  type PostingCategory,
} from "../types/postingCategory.types";

import { cn } from "@/shared/lib/cn";

type CategoryBadgeProps = {
  category: PostingCategory | string | null | undefined;
  className?: string;
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const isKnownCategory =
    typeof category === "string" &&
    POSTING_CATEGORIES.includes(category as PostingCategory);
  const knownCategory = isKnownCategory
    ? (category as PostingCategory)
    : undefined;
  const selectedSrc = knownCategory
    ? POSTING_CATEGORY_PUZZLE_ASSETS[knownCategory].selectedSrc
    : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        knownCategory
          ? POSTING_CATEGORY_BADGE_STYLE[knownCategory]
          : "border-stroke bg-bg text-text-gray-300",
        className,
      )}
    >
      {selectedSrc ? (
        <img src={selectedSrc} alt="" aria-hidden="true" className="size-3.5" />
      ) : (
        <Puzzle aria-hidden="true" className="size-3.5" />
      )}
      {knownCategory ? POSTING_CATEGORY_LABEL[knownCategory] : "기타"}
    </span>
  );
}
