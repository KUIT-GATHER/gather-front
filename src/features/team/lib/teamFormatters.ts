function parseLocalDateTime(value: string) {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
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

  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
    value,
  );

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second = "0"] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day) ||
    date.getHours() !== Number(hour) ||
    date.getMinutes() !== Number(minute)
  ) {
    return null;
  }

  return date;
}

function formatMeetingFullDateParts(date: Date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function normalizeMeetingTime(value: string | null) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return null;
  }

  const match = /^(\d{1,2})(?::(\d{1,2}))?(?::\d{1,2})?$/.exec(normalizedValue);

  if (!match) {
    return normalizedValue;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return normalizedValue;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
}

export function formatMeetingActivityDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = parseLocalDateTime(value);

  if (!date) {
    return null;
  }

  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export function formatMeetingFullDate(value: string) {
  const date = parseLocalDateTime(value);

  if (!date) {
    return null;
  }

  return formatMeetingFullDateParts(date);
}

export function formatMeetingFullDateWithWeekday(value: string) {
  const date = parseLocalDateTime(value);

  if (!date) {
    return null;
  }

  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[date.getDay()];

  return `${formatMeetingFullDateParts(date)}(${weekday})`;
}

export function formatMeetingTimeRange(
  startTime: string | null,
  endTime: string | null,
) {
  const start = normalizeMeetingTime(startTime);
  const end = normalizeMeetingTime(endTime);

  if (!start && !end) {
    return null;
  }

  if (!start) {
    return end;
  }

  if (!end) {
    return start;
  }

  return `${start} - ${end}`;
}

export function formatMeetingDurationMinutes(minutes: number | null) {
  if (!minutes || minutes <= 0) {
    return null;
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (hours > 0 && restMinutes > 0) {
    return `${hours}h ${restMinutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${restMinutes}m`;
}

export function getMeetingDDay(value: string) {
  const deadline = parseLocalDateTime(value);

  if (!deadline) {
    return null;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineDate = new Date(
    deadline.getFullYear(),
    deadline.getMonth(),
    deadline.getDate(),
  );
  const differenceInDays = Math.round(
    (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (deadline.getTime() < now.getTime()) {
    return "마감";
  }

  if (differenceInDays === 0) {
    return "D-day";
  }

  return `D-${differenceInDays}`;
}
