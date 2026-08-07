export function formatMeetingDateTimeSummary(date: Date) {
  const dateText = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join(".");
  const hour24 = date.getHours();
  const hour12 = hour24 % 12 || 12;
  const minute = String(date.getMinutes()).padStart(2, "0");
  const meridiem = hour24 < 12 ? "A.M." : "P.M.";

  return `${dateText}  |  ${String(hour12).padStart(2, "0")}:${minute} ${meridiem}`;
}
