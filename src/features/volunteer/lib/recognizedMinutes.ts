export const RECOGNIZED_MINUTES_UNIT = 10;
export const MAX_RECOGNIZED_MINUTES = 30 * 24 * 60;

export function isValidRecognizedMinutes(value: number) {
  return (
    Number.isInteger(value) &&
    value > 0 &&
    value <= MAX_RECOGNIZED_MINUTES &&
    value % RECOGNIZED_MINUTES_UNIT === 0
  );
}

export function formatRecognizedMinutes(value: number) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  if (hours === 0) {
    return `${minutes}분`;
  }

  if (minutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${minutes}분`;
}
