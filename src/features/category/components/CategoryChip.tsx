import CommunityPuzzle from "@/shared/assets/category-tags/community.svg";
import CulturePuzzle from "@/shared/assets/category-tags/culture.svg";
import EducationPuzzle from "@/shared/assets/category-tags/education.svg";
import EnvironmentPuzzle from "@/shared/assets/category-tags/environment.svg";
import OverseasPuzzle from "@/shared/assets/category-tags/overseas.svg";
import WelfarePuzzle from "@/shared/assets/category-tags/welfare.svg";

import { POSTING_CATEGORY_LABEL } from "@/features/category/constants/postingCategory.constants";
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

const CHIP_ICON: Record<PostingCategory, string> = {
  ENVIRONMENT: EnvironmentPuzzle,
  EDUCATION: EducationPuzzle,
  WELFARE: WelfarePuzzle,
  CULTURE: CulturePuzzle,
  COMMUNITY: CommunityPuzzle,
  OVERSEAS: OverseasPuzzle,
};

const FLIPPED_ICONS: PostingCategory[] = [
  "ENVIRONMENT",
  "CULTURE",
  "COMMUNITY",
  "OVERSEAS",
];

type CategoryChipProps = {
  category: PostingCategory;
  selected: boolean;
};

export function CategoryChip({ category, selected }: CategoryChipProps) {
  return (
    <span
      className={cn(
        "inline-flex h-11 items-center justify-center gap-1 rounded-[30px] border px-4 py-2.5 text-center text-xs leading-4 font-semibold whitespace-nowrap",
        selected ? CHIP_STYLE[category].selected : CHIP_STYLE[category].idle,
        selected ? "text-text2" : "text-text-gray-400",
      )}
    >
      <img
        src={CHIP_ICON[category]}
        alt=""
        aria-hidden="true"
        className={cn(
          "size-[18px]",
          FLIPPED_ICONS.includes(category) && "-scale-y-100",
        )}
      />
      {POSTING_CATEGORY_LABEL[category]}
    </span>
  );
}
