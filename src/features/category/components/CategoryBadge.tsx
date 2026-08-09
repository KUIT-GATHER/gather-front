import { Puzzle } from "lucide-react";

import { POSTING_CATEGORY_LABEL } from "../constants/postingCategory.constants";
import { POSTING_CATEGORY_BADGE_STYLE } from "../constants/postingCategoryStyles";
import {
  FLIPPED_POSTING_CATEGORY_TAGS,
  POSTING_CATEGORY_TAG_ICON,
} from "../constants/postingCategoryTagAssets";
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

  return (
    <span
      className={cn(
        "inline-flex h-[23px] items-center gap-1 rounded-[30px] border px-2 text-sm leading-4 font-normal text-[#5E5E5D]",
        knownCategory
          ? POSTING_CATEGORY_BADGE_STYLE[knownCategory]
          : "border-stroke bg-bg text-text-gray-300",
        className,
      )}
    >
      {knownCategory ? (
        <img
          src={POSTING_CATEGORY_TAG_ICON[knownCategory]}
          alt=""
          aria-hidden="true"
          className={cn(
            "size-3",
            FLIPPED_POSTING_CATEGORY_TAGS.includes(knownCategory) &&
              "-scale-y-100",
          )}
        />
      ) : (
        <Puzzle aria-hidden="true" className="size-3" />
      )}
      {knownCategory ? POSTING_CATEGORY_LABEL[knownCategory] : "기타"}
    </span>
  );
}
