import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import { POSTING_CATEGORIES } from "@/features/category/types/postingCategory.types";
import { cn } from "@/shared/lib/cn";

import { CategoryPuzzleOption } from "./CategoryPuzzleOption";

const positionClasses: Record<PostingCategory, string> = {
  ENVIRONMENT: "translate-y-1",
  EDUCATION: "-translate-y-2",
  CULTURE: "translate-x-1 translate-y-3",
  COMMUNITY: "-translate-x-1 translate-y-1",
  WELFARE: "-translate-y-1",
  OVERSEAS: "translate-x-1 translate-y-2",
};

type CategoryPuzzleGridProps = {
  selectedCategories: PostingCategory[];
  onToggle: (category: PostingCategory) => void;
  className?: string;
};

export function CategoryPuzzleGrid({
  selectedCategories,
  onToggle,
  className,
}: CategoryPuzzleGridProps) {
  return (
    <div
      className={cn(
        "mx-auto grid w-[372px] max-w-full grid-cols-3 gap-x-0 gap-y-0",
        className,
      )}
    >
      {POSTING_CATEGORIES.map((category) => (
        <CategoryPuzzleOption
          key={category}
          category={category}
          selected={selectedCategories.includes(category)}
          className={positionClasses[category]}
          onClick={() => onToggle(category)}
        />
      ))}
    </div>
  );
}
