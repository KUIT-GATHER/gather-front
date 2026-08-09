import { POSTING_CATEGORY_LABEL } from "@/features/category/constants/postingCategory.constants";
import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import { cn } from "@/shared/lib/cn";

import { CategoryPuzzle } from "./CategoryPuzzle";

const labelPositionClasses: Partial<Record<PostingCategory, string>> = {
  COMMUNITY: "translate-x-[-4px] translate-y-[4px]",
  WELFARE: "translate-x-[-2px] translate-y-[2px]",
  CULTURE: "translate-x-[-4px] translate-y-[-4px]",
};
const labelColorClasses: Record<PostingCategory, string> = {
  ENVIRONMENT: "text-[#17534C]",
  EDUCATION: "text-[#111B55]",
  CULTURE: "text-[#483811]",
  COMMUNITY: "text-[#294C30]",
  WELFARE: "text-[#591C59]",
  OVERSEAS: "text-[#162D45]",
};
type CategoryPuzzleOptionProps = {
  category: PostingCategory;
  selected: boolean;
  onClick: () => void;
  className?: string;
};

export function CategoryPuzzleOption({
  category,
  selected,
  onClick,
  className,
}: CategoryPuzzleOptionProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "relative flex min-h-28 items-center justify-center rounded-xl p-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
        className,
      )}
      onClick={onClick}
    >
      <span className="relative block size-[105px]">
        <CategoryPuzzle
          category={category}
          selected={selected}
          className="size-full"
        />
        <span className="pointer-events-none absolute inset-0 grid place-items-center px-2">
          <span
            className={cn(
              "max-w-[78px] break-keep text-center text-[18px] font-medium leading-5",
              labelColorClasses[category],
              labelPositionClasses[category],
            )}
          >
            {POSTING_CATEGORY_LABEL[category]}
          </span>
        </span>
      </span>
    </button>
  );
}
