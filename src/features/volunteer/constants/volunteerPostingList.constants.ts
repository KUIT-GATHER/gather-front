import type { SelectOption } from "@/shared/ui/Select";

export type VolunteerPostingListSort =
  | "latest"
  | "deadline"
  | "activityDate"
  | "applicants";

export const volunteerPostingListSortOptions: SelectOption[] = [
  { value: "latest", label: "최신순 ✨" },
  { value: "applicants", label: "신청자순 👥" },
  { value: "deadline", label: "마감임박 ⏰" },
];

export const VOLUNTEER_POSTING_SORT_PARAMS: Record<
  VolunteerPostingListSort,
  string[]
> = {
  latest: ["id,desc"],
  deadline: ["noticeEndDate,asc"],
  activityDate: ["actStartDate,asc"],
  applicants: ["applicantCount,desc"],
};

export function isVolunteerPostingListSort(
  value: string,
): value is VolunteerPostingListSort {
  return volunteerPostingListSortOptions.some(
    (option) => option.value === value,
  );
}
