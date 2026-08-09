import { POSTING_CATEGORY_LABEL } from "@/features/category/constants/postingCategory.constants";
import {
  FLIPPED_POSTING_CATEGORY_TAGS,
  POSTING_CATEGORY_TAG_ICON,
} from "@/features/category/constants/postingCategoryTagAssets";
import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import { cn } from "@/shared/lib/cn";

const CHIP_STYLE: Record<PostingCategory, { idle: string; selected: string }> =
  {
    ENVIRONMENT: {
      idle: "border-[#82d3ca] bg-[#f1fffd]",
      selected: "border-transparent bg-[#249c8e]",
    },
    EDUCATION: {
      idle: "border-[#828ed2] bg-[#eef1ff]",
      selected: "border-transparent bg-[#404c8f]",
    },
    WELFARE: {
      idle: "border-[#d197d1] bg-[#fff3ff]",
      selected: "border-transparent bg-[#a442a4]",
    },
    CULTURE: {
      idle: "border-[#fade9e] bg-[#fffbf1]",
      selected: "border-transparent bg-[#f7cb65]",
    },
    COMMUNITY: {
      idle: "border-[#dcecdf] bg-[#f4fff6]",
      selected: "border-transparent bg-[#27b780]",
    },
    OVERSEAS: {
      idle: "border-[#a6ccf4] bg-[#f1f8ff]",
      selected: "border-transparent bg-[#297bd0]",
    },
  };

type CategoryChipProps = {
  category: PostingCategory;
  selected: boolean;
};

export function CategoryChip({ category, selected }: CategoryChipProps) {
  return (
    <span
      className={cn(
        "inline-flex h-11 items-center justify-center gap-1 rounded-[30px] border px-4 py-2.5 text-center text-sm leading-4 font-semibold whitespace-nowrap",
        selected ? CHIP_STYLE[category].selected : CHIP_STYLE[category].idle,
        selected ? "text-text2" : "text-text-gray-400",
      )}
    >
      <img
        src={POSTING_CATEGORY_TAG_ICON[category]}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={cn(
          "size-[18px]",
          FLIPPED_POSTING_CATEGORY_TAGS.includes(category) && "-scale-y-100",
        )}
      />
      {POSTING_CATEGORY_LABEL[category]}
    </span>
  );
}
