export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);

  newDate.setUTCDate(newDate.getUTCDate() + days);

  return newDate;
}

export function getDaysOfMonth(
  date: Date,
  padded?: boolean,
  firstDayOfWeek?: number
): Date[] {
  const days: Date[] = [];
  const firstOfMonth = getFirstOfMonth(date);
  const firstDayMonth =
    firstOfMonth.getUTCDay() === 0 ? 7 : firstOfMonth.getUTCDay();
  const lastOfMonth = getLastOfMonth(date);
  const lastDayOfMonth =
    lastOfMonth.getUTCDay() === 0 ? 7 : lastOfMonth.getUTCDay();
  const lastDayOfWeek = firstDayOfWeek === 1 ? 7 : firstDayOfWeek - 1;
  const leftPaddingDays: Date[] = [];
  const rightPaddingDays: Date[] = [];

  if (padded) {
    const leftPadding = (7 - firstDayOfWeek + firstDayMonth) % 7;

    let leftPaddingAmount = leftPadding;
    let leftPaddingDay = getPreviousDay(firstOfMonth);

    while (leftPaddingAmount > 0) {
      leftPaddingDays.push(leftPaddingDay);
      leftPaddingDay = getPreviousDay(leftPaddingDay);
      leftPaddingAmount -= 1;
    }
    leftPaddingDays.reverse();

    const rightPadding = (7 - lastDayOfMonth + lastDayOfWeek) % 7;

    let rightPaddingAmount = rightPadding;
    let rightPaddingDay = getNextDay(lastOfMonth);

    while (rightPaddingAmount > 0) {
      rightPaddingDays.push(rightPaddingDay);
      rightPaddingDay = getNextDay(rightPaddingDay);
      rightPaddingAmount -= 1;
    }
  }

  let currentDay = firstOfMonth;

  while (currentDay.getUTCMonth() === date.getUTCMonth()) {
    days.push(currentDay);
    currentDay = getNextDay(currentDay);
  }

  return [...leftPaddingDays, ...days, ...rightPaddingDays];
}

export function getFirstOfMonth(date: Date): Date {
  const firstOfMonth = new Date(
    `${getYear(date)}-${String(getMonth(date)).padStart(2, "0")}-01`
  );
  return firstOfMonth;
}

export function getISODateString(date: Date): string {
  if (!(date instanceof Date)) {
    return;
  }
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function getLastOfMonth(date: Date): Date {
  const newDate = getFirstOfMonth(date);

  newDate.setUTCMonth(newDate.getUTCMonth() + 1);
  newDate.setUTCDate(newDate.getUTCDate() - 1);

  return newDate;
}

export function getMonth(date: Date): number {
  return date.getUTCMonth() + 1;
}

export function getMonths(locale?: string): string[] {
  return new Array(12).fill(undefined).map((_, month) => {
    const date = removeTimezoneOffset(
      new Date(`2006-${String(month + 1).padStart(2, "0")}-01`)
    );

    return Intl.DateTimeFormat(locale, {
      month: "long"
    }).format(date);
  });
}

export function getNextDay(date: Date): Date {
  return addDays(date, 1);
}

export function getNextMonth(date: Date): Date {
  const newDate = new Date(date);

  newDate.setUTCMonth(newDate.getUTCMonth() + 1);

  return newDate;
}

export function getNextYear(date: Date): Date {
  const newDate = new Date(date);

  newDate.setUTCFullYear(newDate.getUTCFullYear() + 1);

  return newDate;
}

export function getPreviousDay(date: Date): Date {
  return subDays(date, 1);
}

export function getPreviousMonth(date: Date): Date {
  const newDate = new Date(date);

  newDate.setUTCMonth(newDate.getUTCMonth() - 1);
  return newDate;
}

export function getPreviousYear(date: Date): Date {
  const newDate = new Date(date);

  newDate.setUTCFullYear(newDate.getUTCFullYear() - 1);

  return newDate;
}

export function getWeekDays(
  firstDayOfWeek: number,
  locale?: string
): string[][] {
  return new Array(7)
    .fill(undefined)
    .map((_, index) => ((firstDayOfWeek + index) % 7) + 1)
    .map((day) => {
      const date = removeTimezoneOffset(new Date(`2006-01-0${day}`));

      return [
        Intl.DateTimeFormat(locale, {
          weekday: "short"
        }).format(date),
        Intl.DateTimeFormat(locale, {
          weekday: "long"
        }).format(date)
      ];
    });
}

export function getYear(date: Date): number {
  return date.getUTCFullYear();
}

export function isDateInRange(date: Date, range: { from: Date; to: Date }) {
  if (!date || !range || !range.from || !range.to) {
    return false;
  }

  const earlyDate = range.from < range.to ? range.from : range.to;
  const laterDate = range.from < range.to ? range.to : range.from;

  return date >= earlyDate && date <= laterDate;
}

export function isSameDay(date1?: Date, date2?: Date) {
  if (!date1 || !date2) {
    return false;
  }

  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
}

export function removeTimezoneOffset(date: Date): Date {
  const newDate = new Date(date);

  newDate.setUTCMinutes(newDate.getUTCMinutes() + newDate.getTimezoneOffset());

  return newDate;
}

export function subDays(date: Date, days: number): Date {
  const newDate = new Date(date);

  newDate.setUTCDate(newDate.getUTCDate() - days);

  return newDate;
}

export function dateIsWithinLowerBounds(date: Date, minDate?: string): boolean {
  if (minDate) {
    const min = new Date(minDate);
    return date >= min || isSameDay(min, date);
  } else return true;
}

export function dateIsWithinUpperBounds(date: Date, maxDate?: string): boolean {
  if (maxDate) {
    const max = new Date(maxDate);
    return date <= max || isSameDay(date, max);
  } else return true;
}

export function dateIsWithinBounds(
  date: Date,
  minDate?: string,
  maxDate?: string
): boolean {
  return (
    dateIsWithinLowerBounds(date, minDate) &&
    dateIsWithinUpperBounds(date, maxDate)
  );
}

export function monthIsDisabled(
  month: number,
  year: number,
  minDate: string,
  maxDate: string
) {
  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);

  return (
    !dateIsWithinBounds(firstDate, minDate, maxDate) &&
    !dateIsWithinBounds(lastDate, minDate, maxDate)
  );
}

export function isValidISODate(dateString) {
  var isoFormat = /^\d{4}-\d{2}-\d{2}$/;
  if (dateString.match(isoFormat) == null) {
    return false;
  } else {
    var d = new Date(dateString);
    return !isNaN(d.getTime());
  }
}

export function extractDates(text) {
  var dateRegex = /\d{4}-\d{2}-\d{2}/g;
  var matches = text.match(dateRegex);
  return matches.slice(0, 2);
}
