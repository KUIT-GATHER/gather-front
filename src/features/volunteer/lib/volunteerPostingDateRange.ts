import type { DateRange } from "@daypicker/react";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function parseLocalDate(value: string) {
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

export function formatLocalDateForApi(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatLocalDateForDisplay(value: string) {
  const date = parseLocalDate(value);

  return date
    ? `${date.getFullYear()}. ${pad(date.getMonth() + 1)}. ${pad(date.getDate())}`
    : value;
}

export function getDateRangeFromValues(
  noticeStartDate?: string,
  noticeEndDate?: string,
) {
  if (!noticeStartDate || !noticeEndDate) {
    return undefined;
  }

  const from = parseLocalDate(noticeStartDate);
  const to = parseLocalDate(noticeEndDate);

  return from && to ? { from, to } : undefined;
}

export function getDateFilterFromRange(range: DateRange | undefined) {
  if (!range?.from || !range.to) {
    return undefined;
  }

  return {
    noticeStartDate: formatLocalDateForApi(range.from),
    noticeEndDate: formatLocalDateForApi(range.to),
  };
}

export function formatVolunteerPostingDateRange(
  noticeStartDate: string,
  noticeEndDate: string,
) {
  return `${formatLocalDateForDisplay(noticeStartDate)} ~ ${formatLocalDateForDisplay(noticeEndDate)}`;
}
