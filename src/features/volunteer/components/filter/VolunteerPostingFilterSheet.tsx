import {
  ActivityFilterSheet,
  type ActivityFilter,
} from "@/features/activity-filter/components/ActivityFilterSheet";
import type { VolunteerPostingFilter } from "@/features/volunteer/types/volunteerPostingFilter.types";

type VolunteerPostingFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: VolunteerPostingFilter;
  onApply: (filter: VolunteerPostingFilter) => void;
};

function toVolunteerPostingFilter(
  value: ActivityFilter,
): VolunteerPostingFilter {
  const dateFilter =
    value.startDate && value.endDate
      ? {
          noticeStartDate: value.startDate,
          noticeEndDate: value.endDate,
        }
      : {};
  const categoryFilter = value.category ? { category: value.category } : {};

  return value.regionId !== undefined
    ? { regionId: value.regionId, ...dateFilter, ...categoryFilter }
    : { ...dateFilter, ...categoryFilter };
}

export function VolunteerPostingFilterSheet({
  open,
  onOpenChange,
  filter,
  onApply,
}: VolunteerPostingFilterSheetProps) {
  const value: ActivityFilter = {
    regionId: filter.regionId,
    startDate: filter.noticeStartDate,
    endDate: filter.noticeEndDate,
    category: filter.category,
  };

  return (
    <ActivityFilterSheet
      open={open}
      onOpenChange={onOpenChange}
      filter={value}
      onApply={(next) => onApply(toVolunteerPostingFilter(next))}
    />
  );
}
