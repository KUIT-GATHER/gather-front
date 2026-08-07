import { formatMeetingFullDate } from "@/features/team/lib/teamFormatters";
import {
  formatVolunteerDate,
  formatVolunteerTimeRange,
} from "@/features/volunteer/lib/volunteerPostingFormatters";

function formatDateWithWeekday(value: string) {
  return formatVolunteerDate(value.slice(0, 10))?.replace("(", " (") ?? value;
}

export function formatMeetingRecruitActivitySchedule(
  startAt: string,
  endAt: string,
) {
  const startDate = formatDateWithWeekday(startAt);
  const endDate = formatDateWithWeekday(endAt);
  const startTime = startAt.slice(11, 16);
  const endTime = endAt.slice(11, 16);

  if (startAt.slice(0, 10) !== endAt.slice(0, 10)) {
    return `${startDate} ${startTime} ~ ${endDate} ${endTime}`;
  }

  const timeRange = formatVolunteerTimeRange(startTime, endTime);

  return timeRange ? `${startDate} ${timeRange}` : startDate;
}

export function formatMeetingRecruitApplicationPeriod(
  createdAt: string,
  applyDeadlineAt: string,
) {
  const startDate = formatMeetingFullDate(createdAt) ?? createdAt.slice(0, 10);
  const endDate =
    formatMeetingFullDate(applyDeadlineAt) ?? applyDeadlineAt.slice(0, 10);

  return `${startDate} ~ ${endDate}`;
}

export function formatMeetingRecruitApplicationDeadline(value: string) {
  const date = formatMeetingFullDate(value) ?? value.slice(0, 10);

  return `${date}까지`;
}

export function formatMeetingRecruitLocation(
  regionName: string,
  place: string,
) {
  const region = regionName.trim();
  const location = place.trim();

  if (!region || location.includes(region)) {
    return location || region;
  }

  return `${region} ${location}`;
}
