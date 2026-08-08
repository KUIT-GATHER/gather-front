import { CategoryChip } from "@/features/category/components/CategoryChip";
import { POSTING_CATEGORY_LABEL } from "@/features/category/constants/postingCategory.constants";
import {
  POSTING_CATEGORIES,
  type PostingCategory,
} from "@/features/category/types/postingCategory.types";
import { cn } from "@/shared/lib/cn";

type CategoryChipGroupProps = {
  value: PostingCategory[];
  onChange: (value: PostingCategory[]) => void;
  maxSelected?: number;
  disabled?: boolean;
  options?: readonly PostingCategory[];
  className?: string;
};

export function CategoryChipGroup({
  value,
  onChange,
  maxSelected = 3,
  disabled = false,
  options = POSTING_CATEGORIES,
  className,
}: CategoryChipGroupProps) {
  const orderedOptions = [...options].sort(
    (a, b) => Number(value.includes(b)) - Number(value.includes(a)),
  );

  return (
    <div
      className={cn(
        "-mx-5.5 flex gap-2 overflow-x-auto px-5.5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {orderedOptions.map((category) => {
        const selected = value.includes(category);

        return (
          <button
            key={category}
            type="button"
            aria-label={`${POSTING_CATEGORY_LABEL[category]} 카테고리`}
            aria-pressed={selected}
            disabled={disabled}
            className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40 disabled:cursor-not-allowed"
            onClick={() =>
              onChange(
                selected
                  ? value.filter((item) => item !== category)
                  : value.length < maxSelected
                    ? [...value, category]
                    : value,
              )
            }
          >
            <CategoryChip category={category} selected={selected} />
          </button>
        );
      })}
    </div>
  );
}
