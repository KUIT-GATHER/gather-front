const LOCAL_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/;

function getSeoulCurrentYear() {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      timeZone: "Asia/Seoul",
    }).format(new Date()),
  );
}

function formatKoreanDateTime({
  year,
  month,
  day,
  hour,
  minute,
}: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}) {
  const displayedHour = hour % 12 || 12;
  const yearLabel = year === getSeoulCurrentYear() ? "" : `${year}년 `;

  return `${yearLabel}${month}월 ${day}일 ${hour < 12 ? "오전" : "오후"} ${displayedHour}:${String(minute).padStart(2, "0")}`;
}

function formatOffsetDateTime(date: Date) {
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Seoul",
  });
  const parts = new Map(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return formatKoreanDateTime({
    year: Number(parts.get("year")),
    month: Number(parts.get("month")),
    day: Number(parts.get("day")),
    hour:
      parts.get("dayPeriod") === "오후"
        ? (Number(parts.get("hour")) % 12) + 12
        : Number(parts.get("hour")) % 12,
    minute: Number(parts.get("minute")),
  });
}

export function formatNotificationCreatedAt(createdAt: string) {
  const localDateTimeMatch = createdAt.match(LOCAL_DATE_TIME_PATTERN);

  if (localDateTimeMatch) {
    const [, year, month, day, hour, minute] = localDateTimeMatch;

    return formatKoreanDateTime({
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: Number(hour),
      minute: Number(minute),
    });
  }

  const date = new Date(createdAt);

  return Number.isNaN(date.getTime()) ? createdAt : formatOffsetDateTime(date);
}
