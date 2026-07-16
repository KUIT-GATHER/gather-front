import type { SelectOption } from "@/shared/ui/Select";

import type { TeamCardCategory, TeamListSort } from "../types/teamList.types";

export const teamListSortOptions: SelectOption[] = [
  { value: "latest", label: "최신순 ✨" },
  { value: "popular", label: "인기순 🔥" },
  { value: "deadline", label: "마감임박 ⏰" },
  { value: "default", label: "공고기반" },
];

export const teamCategoryStyle: Record<TeamCardCategory, string> = {
  문화: "border-[#F2D28D] bg-[#FFF9EA] text-[#B98926]",
  복지: "border-[#E4A6E7] bg-[#FFF2FF] text-[#B05AB6]",
  교육: "border-[#AABAF4] bg-[#F3F5FF] text-[#687BC5]",
  환경: "border-[#8FD8CF] bg-[#EFFFFC] text-[#4A9E94]",
};

export function isTeamListSort(value: string): value is TeamListSort {
  return teamListSortOptions.some((option) => option.value === value);
}
