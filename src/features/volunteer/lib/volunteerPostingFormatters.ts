import type { VolunteerPostingListItem } from "../types/volunteer.types";

function parseLocalDate(value: string | null) {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return date;
}

function formatDateParts(date: Date) {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export function formatVolunteerDate(value: string | null) {
  const date = parseLocalDate(value);

  return date ? formatDateParts(date) : null;
}

export function formatVolunteerPeriod(
  startDate: string | null,
  endDate: string | null,
  weekday?: string | null,
) {
  const formattedStartDate = formatVolunteerDate(startDate);
  const formattedEndDate = formatVolunteerDate(endDate);

  if (!formattedStartDate && !formattedEndDate) {
    return null;
  }

  const period =
    formattedStartDate &&
    formattedEndDate &&
    formattedStartDate !== formattedEndDate
      ? `${formattedStartDate} ~ ${formattedEndDate}`
      : (formattedStartDate ?? formattedEndDate);

  return weekday ? `${period} (${weekday})` : period;
}

export function formatVolunteerTimeRange(
  startTime: string | null,
  endTime: string | null,
) {
  if (!startTime && !endTime) {
    return null;
  }

  if (!startTime || !endTime) {
    return startTime ?? endTime;
  }

  return `${startTime} ~ ${endTime}`;
}

export function getRecruitmentDDay(noticeEndDate: string | null) {
  const deadline = parseLocalDate(noticeEndDate);

  if (!deadline) {
    return null;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const differenceInDays = Math.round(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (differenceInDays < 0) {
    return "마감";
  }

  if (differenceInDays === 0) {
    return "D-day";
  }

  return `D-${differenceInDays}`;
}

export function formatVolunteerLocation(
  posting: Pick<VolunteerPostingListItem, "regionName" | "actPlace">,
) {
  return posting.regionName || posting.actPlace || null;
}
