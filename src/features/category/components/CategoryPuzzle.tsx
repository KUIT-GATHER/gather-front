import { cn } from "@/shared/lib/cn";

import { POSTING_CATEGORY_PUZZLE_ASSETS } from "../constants/postingCategoryPuzzleAssets";
import type { PostingCategory } from "../types/postingCategory.types";

type CategoryPuzzleProps = {
  category: PostingCategory;
  selected: boolean;
  className?: string;
};

export function CategoryPuzzle({
  category,
  selected,
  className,
}: CategoryPuzzleProps) {
  const { defaultSrc, selectedSrc } = POSTING_CATEGORY_PUZZLE_ASSETS[category];

  return (
    <span
      className={cn("relative block size-[105px] shrink-0", className)}
      aria-hidden="true"
    >
      <img
        src={defaultSrc}
        alt=""
        className={cn(
          "absolute inset-0 m-auto block max-h-full max-w-full",
          "transition-opacity duration-150",
          selected ? "opacity-0" : "opacity-100",
        )}
      />

      <img
        src={selectedSrc}
        alt=""
        className={cn(
          "absolute inset-0 m-auto block max-h-full max-w-full",
          "transition-opacity duration-150",
          selected ? "opacity-100" : "opacity-0",
        )}
      />
    </span>
  );
}
