import type { SelectOption } from "@/shared/ui/Select";

export const VOLUNTEER_POSTING_SORTS = [
  "latest",
  "applicants",
  "deadline",
] as const;

export type VolunteerPostingListSort = (typeof VOLUNTEER_POSTING_SORTS)[number];

export const volunteerPostingListSortOptions = [
  { value: "latest", label: "최신순 ✨" },
  { value: "applicants", label: "신청자순 👥" },
  { value: "deadline", label: "마감임박 ⏰" },
] satisfies SelectOption[];

export const VOLUNTEER_POSTING_SORT_PARAMS = {
  latest: ["id,desc"],
  applicants: ["applicantCount,desc", "id,desc"],
  deadline: ["noticeEndDate,asc", "id,desc"],
} satisfies Record<VolunteerPostingListSort, string[]>;

export function isVolunteerPostingListSort(
  value: string,
): value is VolunteerPostingListSort {
  return volunteerPostingListSortOptions.some(
    (option) => option.value === value,
  );
}
