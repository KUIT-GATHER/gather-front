type LocalDateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const LOCAL_DATE_TIME_INPUT_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const LOCAL_DATE_TIME_API_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toValidLocalDateTime(parts: LocalDateTimeParts) {
  const { year, month, day, hour, minute, second } = parts;

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return undefined;
  }

  const date = new Date(year, month - 1, day, hour, minute, second);

  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute &&
    date.getSeconds() === second
    ? date
    : undefined;
}

function parseLocalDateTime(
  value: string,
  pattern: RegExp,
  seconds: (match: RegExpExecArray) => string,
) {
  const match = pattern.exec(value);

  if (!match) {
    return undefined;
  }

  const [, year, month, day, hour, minute] = match;

  return toValidLocalDateTime({
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(seconds(match)),
  });
}

export function formatLocalDateTimeForApi(date: Date) {
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
    ":00",
  ].join("");
}

export function formatLocalDateTimeForInput(date: Date) {
  return formatLocalDateTimeForApi(date)?.slice(0, 16);
}

export function parseLocalDateTimeInput(value: string) {
  return parseLocalDateTime(value, LOCAL_DATE_TIME_INPUT_PATTERN, () => "0");
}

export function isLocalDateTimeApiValue(value: unknown): value is string {
  return (
    typeof value === "string" &&
    parseLocalDateTime(
      value,
      LOCAL_DATE_TIME_API_PATTERN,
      (match) => match[6],
    ) !== undefined
  );
}

export function combineLocalDateAndTime(
  date: string | null,
  time: string | null,
) {
  if (!date) {
    return undefined;
  }

  const normalizedDate = date.trim();
  const normalizedTime = time?.trim() || "00:00";
  const value = `${normalizedDate}T${normalizedTime}`;

  return parseLocalDateTimeInput(value)
    ? `${normalizedDate}T${normalizedTime}:00`
    : undefined;
}
