const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseDateParts(dateKey: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);

  if (!match) {
    return undefined;
  }

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return { year, month, day, date };
}

export function formatMyActivityDateRange(
  startDateKey: string,
  endDateKey: string | null,
) {
  const start = parseDateParts(startDateKey);
  const end = parseDateParts(endDateKey ?? startDateKey);

  if (!start || !end) {
    return startDateKey;
  }

  const formattedStart = `${start.year}.${pad(start.month)}.${pad(start.day)}`;

  if (
    start.year === end.year &&
    start.month === end.month &&
    start.day === end.day
  ) {
    return `${formattedStart} (${DAY_LABELS[start.date.getDay()]})`;
  }

  if (start.year === end.year) {
    return `${formattedStart} ~ ${pad(end.month)}.${pad(end.day)}`;
  }

  return `${formattedStart} ~ ${end.year}.${pad(end.month)}.${pad(end.day)}`;
}
