import {
  ActivityFilterSheet,
  type ActivityFilter,
} from "@/features/activity/components/ActivityFilterSheet";
import type { VolunteerPostingFilter } from "@/features/volunteer/types/volunteerPostingFilter.types";

type VolunteerPostingFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: VolunteerPostingFilter;
  onApply: (filter: VolunteerPostingFilter) => void;
  onOpenMap?: (filter: VolunteerPostingFilter) => void;
};

function toVolunteerPostingFilter(
  value: ActivityFilter,
): VolunteerPostingFilter {
  const dateFilter =
    value.startDate && value.endDate
      ? {
          activityStartDate: value.startDate,
          activityEndDate: value.endDate,
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
  onOpenMap,
}: VolunteerPostingFilterSheetProps) {
  const value: ActivityFilter = {
    regionId: filter.regionId,
    startDate: filter.activityStartDate,
    endDate: filter.activityEndDate,
    category: filter.category,
  };

  return (
    <ActivityFilterSheet
      open={open}
      onOpenChange={onOpenChange}
      filter={value}
      dateLabel="날짜"
      onApply={(next) => onApply(toVolunteerPostingFilter(next))}
      onOpenMap={
        onOpenMap
          ? (draft) => onOpenMap(toVolunteerPostingFilter(draft))
          : undefined
      }
    />
  );
}
