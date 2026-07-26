import type { SelectOption } from "@/shared/ui/Select";

export const TEAM_SORTS = ["latest", "popular", "deadline", "posting"] as const;

export type TeamListSort = (typeof TEAM_SORTS)[number];

export const teamListSortOptions = [
  { value: "latest", label: "최신순 ✨" },
  { value: "popular", label: "인기순 🔥" },
  { value: "deadline", label: "마감임박 ⏰" },
  { value: "posting", label: "공고기반" },
] satisfies SelectOption[];

export const TEAM_SORT_PARAMS = {
  latest: ["createdAt,desc"],
  popular: ["currentMemberCount,desc", "createdAt,desc"],
  deadline: ["deadline,asc", "createdAt,desc"],
  posting: [],
} satisfies Record<TeamListSort, string[]>;

export function isTeamListSort(value: string | null): value is TeamListSort {
  return value !== null && TEAM_SORTS.includes(value as TeamListSort);
}
