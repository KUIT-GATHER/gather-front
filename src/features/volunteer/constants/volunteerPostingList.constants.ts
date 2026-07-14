import type { SelectOption } from "@/shared/ui/Select";

import type {
  VolunteerPostingCardCategory,
  VolunteerPostingListSort,
} from "../types/volunteerPostingList.types";

export const volunteerPostingListSortOptions: SelectOption[] = [
  { value: "latest", label: "최신순 ✨" },
  { value: "popular", label: "인기순 🔥" },
  { value: "deadline", label: "마감임박 ⏰" },
  { value: "default", label: "공고기반" },
];

export const volunteerPostingCategoryStyle: Record<
  VolunteerPostingCardCategory,
  string
> = {
  문화: "border-[#F2D28D] bg-[#FFF9EA] text-[#B98926]",
  복지: "border-[#E4A6E7] bg-[#FFF2FF] text-[#B05AB6]",
  교육: "border-[#9FC4F5] bg-[#F1F7FF] text-[#4D81C4]",
  환경: "border-[#9ED6AE] bg-[#F0FFF4] text-[#4B9660]",
};

export function isVolunteerPostingListSort(
  value: string,
): value is VolunteerPostingListSort {
  return volunteerPostingListSortOptions.some(
    (option) => option.value === value,
  );
}
