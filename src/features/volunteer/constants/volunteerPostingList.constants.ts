import type { SelectOption } from "@/shared/ui/Select";

export const VOLUNTEER_POSTING_SORTS = [
  "latest",
  "popular",
  "deadline",
  "postingBased",
] as const;

export type VolunteerPostingListSort = (typeof VOLUNTEER_POSTING_SORTS)[number];

export const volunteerPostingListSortOptions = [
  { value: "latest", label: "최신순 ✨", selectedLabel: "최신순" },
  { value: "popular", label: "인기순 🔥", selectedLabel: "인기순" },
  { value: "deadline", label: "마감임박 ⏰", selectedLabel: "마감임박" },
  { value: "postingBased", label: "공고기반", selectedLabel: "공고기반" },
] satisfies SelectOption[];

export const VOLUNTEER_POSTING_SORT_PARAMS = {
  latest: ["id,desc"],
  popular: ["applicantCount,desc", "id,desc"],
  deadline: ["noticeEndDate,asc", "id,desc"],
  postingBased: ["id,desc"],
} satisfies Record<VolunteerPostingListSort, string[]>;

export function isVolunteerPostingListSort(
  value: string,
): value is VolunteerPostingListSort {
  return volunteerPostingListSortOptions.some(
    (option) => option.value === value,
  );
}
