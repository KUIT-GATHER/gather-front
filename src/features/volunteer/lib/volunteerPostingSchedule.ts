import {
  formatLocalDateForApi,
  parseLocalDate,
} from "@/features/volunteer/lib/volunteerPostingDateRange";

type PostingSchedulePeriod = {
  actStartDate: string | null;
  actEndDate: string | null;
};

export type ScheduleSelectionMode = "single" | "range";

export type VolunteerScheduleSelection = {
  startDate?: Date;
  endDate?: Date;
};

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getVolunteerPostingSelectablePeriod(
  posting: PostingSchedulePeriod,
  now = new Date(),
) {
  const postingStartDate = posting.actStartDate
    ? parseLocalDate(posting.actStartDate)
    : undefined;
  const postingEndDate = posting.actEndDate
    ? parseLocalDate(posting.actEndDate)
    : undefined;

  if (!postingStartDate || !postingEndDate) {
    return undefined;
  }

  const today = startOfLocalDay(now);
  const startDate = postingStartDate > today ? postingStartDate : today;

  if (startDate > postingEndDate) {
    return undefined;
  }

  return {
    startDate,
    endDate: postingEndDate,
  };
}

export function isDateWithinVolunteerPostingPeriod(
  date: Date,
  period: { startDate: Date; endDate: Date },
) {
  const targetDate = startOfLocalDay(date);

  return targetDate >= period.startDate && targetDate <= period.endDate;
}

export function toVolunteerPostingParticipationDate(date: Date) {
  return formatLocalDateForApi(startOfLocalDay(date));
}

export function selectVolunteerScheduleDate(
  mode: ScheduleSelectionMode,
  selection: VolunteerScheduleSelection,
  date: Date,
): VolunteerScheduleSelection {
  if (mode === "single") {
    return { startDate: date, endDate: date };
  }

  if (!selection.startDate || selection.endDate) {
    return { startDate: date };
  }

  if (date < selection.startDate) {
    return { startDate: date };
  }

  return { startDate: selection.startDate, endDate: date };
}

export function changeVolunteerScheduleSelectionMode(
  mode: ScheduleSelectionMode,
  selection: VolunteerScheduleSelection,
): VolunteerScheduleSelection {
  if (mode === "range") {
    return { startDate: selection.startDate };
  }

  return selection.startDate
    ? { startDate: selection.startDate, endDate: selection.startDate }
    : {};
}
