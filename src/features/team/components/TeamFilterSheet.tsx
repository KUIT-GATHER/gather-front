import {
  ActivityFilterSheet,
  type ActivityFilter,
} from "@/features/activity-filter/components/ActivityFilterSheet";
import type { TeamFilter } from "@/features/team/types/teamFilter.types";

type TeamFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: TeamFilter;
  onApply: (filter: TeamFilter) => void;
};

export function TeamFilterSheet({
  open,
  onOpenChange,
  filter,
  onApply,
}: TeamFilterSheetProps) {
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
      onApply={(next) =>
        onApply({
          regionId: next.regionId,
          activityStartDate: next.startDate,
          activityEndDate: next.endDate,
          category: next.category,
        })
      }
    />
  );
}
