function parseLocalDateTime(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatMeetingActivityDate(value: string) {
  const date = parseLocalDateTime(value);

  if (!date) {
    return null;
  }

  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
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
