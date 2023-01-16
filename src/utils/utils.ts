export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);

  newDate.setDate(newDate.getDate() + days);

  return newDate;
}

export function getDaysOfMonth(
  date: Date,
  padded?: boolean,
  firstDayOfWeek?: number
): Date[] {
  const days: Date[] = [];
  const firstOfMonth = getFirstOfMonth(date);
  const firstDayMonth = firstOfMonth.getDay() === 0 ? 7 : firstOfMonth.getDay();
  const lastOfMonth = getLastOfMonth(date);
  const lastDayOfMonth = lastOfMonth.getDay() === 0 ? 7 : lastOfMonth.getDay();
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

  while (currentDay.getMonth() === date.getMonth()) {
    days.push(currentDay);
    currentDay = getNextDay(currentDay);
  }

  return [...leftPaddingDays, ...days, ...rightPaddingDays];
}

export function getFirstOfMonth(date: Date): Date {
  return new Date(
    `${getYear(date)}-${String(getMonth(date)).padStart(2, "0")}-01`
  );
}

export function getISODateString(date: Date): string {
  if (!(date instanceof Date)) {
    return;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getLastOfMonth(date: Date): Date {
  const newDate = getFirstOfMonth(date);

  newDate.setMonth(newDate.getMonth() + 1);
  newDate.setDate(newDate.getDate() - 1);

  return newDate;
}

export function getMonth(date: Date): number {
  return date.getMonth() + 1;
}

export function getMonths(locale?: string): string[] {
  return new Array(12).fill(undefined).map((_, month) => {
    const date = new Date(`2006-${String(month + 1).padStart(2, "0")}-01`);

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

  newDate.setMonth(newDate.getMonth() + 1);

  return newDate;
}

export function getNextYear(date: Date): Date {
  const newDate = new Date(date);

  newDate.setFullYear(newDate.getFullYear() + 1);

  return newDate;
}

export function getPreviousDay(date: Date): Date {
  return subDays(date, 1);
}

export function getPreviousMonth(date: Date): Date {
  const newDate = new Date(date);

  newDate.setMonth(newDate.getMonth() - 1);
  return newDate;
}

export function getPreviousYear(date: Date): Date {
  const newDate = new Date(date);

  newDate.setFullYear(newDate.getFullYear() - 1);

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
      const date = new Date(`2006-01-0${day}`);

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
  return date.getFullYear();
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
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function subDays(date: Date, days: number): Date {
  const newDate = new Date(date);

  newDate.setDate(newDate.getDate() - days);

  return newDate;
}

export function dateIsWithinLowerBounds(date: Date, minDate?: string): boolean {
  if (minDate) return date >= new Date(minDate);
  else return true;
}

export function dateIsWithinUpperBounds(date: Date, maxDate?: string): boolean {
  if (maxDate) return date <= new Date(maxDate);
  else return true;
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
  firstDate.setDate(firstDate.getDate() - 1);
  const lastDate = new Date(year, month + 1, 0);
  lastDate.setDate(firstDate.getDate() + 1);
  return (
    !dateIsWithinBounds(firstDate, minDate, maxDate) &&
    !dateIsWithinBounds(lastDate, minDate, maxDate)
  );
}
