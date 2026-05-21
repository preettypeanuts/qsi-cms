const inputDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function getYesterdayDateValue() {
  return getRelativeDateValue(-1);
}

export function getTomorrowDateValue() {
  return getRelativeDateValue(1);
}

export function isYesterdayDateValue(value: string) {
  return value === getYesterdayDateValue();
}

export function isAfterTodayDateValue(value: string) {
  const date = parseInputDate(value);

  if (!date) {
    return false;
  }

  return date > getToday();
}

function getRelativeDateValue(dayOffset: number) {
  const date = getToday();
  date.setDate(date.getDate() + dayOffset);

  return formatInputDate(date);
}

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today;
}

function parseInputDate(value: string) {
  if (!inputDatePattern.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
