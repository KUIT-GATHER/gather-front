export function isVolunteerPostingActivityPeriodOverlapping(
  activityStartDate: string | null | undefined,
  activityEndDate: string | null | undefined,
  selectedStartDate: string | null | undefined,
  selectedEndDate: string | null | undefined,
) {
  const startDate = activityStartDate ?? activityEndDate;
  const endDate = activityEndDate ?? activityStartDate;

  if (!startDate || !endDate) {
    return !selectedStartDate && !selectedEndDate;
  }

  return (
    (!selectedStartDate || endDate >= selectedStartDate) &&
    (!selectedEndDate || startDate <= selectedEndDate)
  );
}
