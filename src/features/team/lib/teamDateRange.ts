import type { DateRange } from "@daypicker/react";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseLocalDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : undefined;
}

export function formatTeamDateForApi(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatTeamDateForDisplay(value: string) {
  const date = parseLocalDate(value);

  return date
    ? `${date.getFullYear()}. ${pad(date.getMonth() + 1)}. ${pad(date.getDate())}`
    : value;
}

export function getTeamDateRangeFromValues(
  activityStartDate?: string,
  activityEndDate?: string,
) {
  if (!activityStartDate || !activityEndDate) {
    return undefined;
  }

  const from = parseLocalDate(activityStartDate);
  const to = parseLocalDate(activityEndDate);

  return from && to ? { from, to } : undefined;
}

export function getTeamDateFilterFromRange(range: DateRange | undefined) {
  if (!range?.from || !range.to) {
    return undefined;
  }

  return {
    activityStartDate: formatTeamDateForApi(range.from),
    activityEndDate: formatTeamDateForApi(range.to),
  };
}

export function formatTeamDateRange(
  activityStartDate: string,
  activityEndDate: string,
) {
  return `${formatTeamDateForDisplay(activityStartDate)} ~ ${formatTeamDateForDisplay(activityEndDate)}`;
}
