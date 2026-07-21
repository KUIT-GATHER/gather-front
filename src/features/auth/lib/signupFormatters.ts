export const MIN_BIRTH_DATE = "1900-01-01";

export function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function formatPhoneNumber(value: string) {
  const numbers = normalizePhoneNumber(value);

  if (numbers.length <= 3) {
    return numbers;
  }

  if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  }

  if (numbers.length === 10) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  }

  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function formatBirthDateInput(value: string) {
  const numbers = value.replace(/\D/g, "").slice(0, 8);

  if (numbers.length <= 4) {
    return numbers;
  }

  if (numbers.length <= 6) {
    return `${numbers.slice(0, 4)}. ${numbers.slice(4)}`;
  }

  return `${numbers.slice(0, 4)}. ${numbers.slice(4, 6)}. ${numbers.slice(6)}`;
}

export function normalizeBirthDate(value: string) {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length !== 8) {
    return value;
  }

  return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6)}`;
}

export function isRealPastOrTodayBirthDate(value: string) {
  const normalized = normalizeBirthDate(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date <= today;
}

export function isAllowedBirthDate(value: string) {
  const normalized = normalizeBirthDate(value);

  return (
    /^\d{4}-\d{2}-\d{2}$/.test(normalized) &&
    normalized >= MIN_BIRTH_DATE &&
    isRealPastOrTodayBirthDate(normalized)
  );
}
