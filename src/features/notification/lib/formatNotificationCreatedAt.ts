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
    hourCycle: "h23",
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
    hour: Number(parts.get("hour")),
    minute: Number(parts.get("minute")),
  });
}

export function formatNotificationCreatedAt(createdAt: string) {
  const date = new Date(createdAt);

  return Number.isNaN(date.getTime()) ? createdAt : formatOffsetDateTime(date);
}
