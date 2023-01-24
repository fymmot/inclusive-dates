import {
  addDays,
  dateIsWithinBounds,
  dateIsWithinUpperBounds,
  getDaysOfMonth,
  getFirstOfMonth,
  getISODateString,
  getLastOfMonth,
  getMonth,
  getMonths,
  getNextDay,
  getNextMonth,
  getNextYear,
  getPreviousDay,
  getPreviousMonth,
  getPreviousYear,
  getWeekDays,
  getYear,
  isDateInRange,
  isSameDay,
  monthIsDisabled,
  subDays
} from "./utils";

/*describe("Timezones", () => {
  it("should always be UTC", () => {
    expect(new Date().getTimezoneOffset()).toBe(0);
  });
});*/

describe("format", () => {
  it("adds days to date", () => {
    expect(addDays(new Date("2022-01-01"), 1)).toEqual(new Date("2022-01-02"));
    expect(addDays(new Date("2022-01-01"), 10)).toEqual(new Date("2022-01-11"));
    expect(addDays(new Date("2022-01-01"), 60)).toEqual(new Date("2022-03-02"));
    expect(addDays(new Date("2022-01-01"), 365)).toEqual(
      new Date("2023-01-01")
    );
    expect(addDays(new Date("2022-01-01"), -1)).toEqual(new Date("2021-12-31"));
  });

  it("returns (padded) days of month", () => {
    const expected = new Array(31)
      .fill(undefined)
      .map(
        (_, index) => new Date(`2022-01-${String(index + 1).padStart(2, "0")}`)
      );
    console.log(expected);
    console.log(new Date(`2022-02-${String(1).padStart(2, "0")}`));

    expect(getDaysOfMonth(new Date("2022-01-01"))).toEqual(expected);

    expect(getDaysOfMonth(new Date("2022-01-01"), true, 3)).toEqual([
      new Date("2021-12-29"),
      new Date("2021-12-30"),
      new Date("2021-12-31"),
      ...expected,
      new Date("2022-02-01")
    ]);
  });

  it("returns first of month", () => {
    const expected = new Date("2022-01-01");

    expect(getFirstOfMonth(new Date("2022-01-01"))).toEqual(expected);
    expect(getFirstOfMonth(new Date("2022-01-20"))).toEqual(expected);
  });

  it("returns ISO date string", () => {
    expect(getISODateString(new Date("2022-01-01"))).toEqual("2022-01-01");
    expect(getISODateString(new Date("2022-01-20"))).toEqual("2022-01-20");
  });

  it("returns last of month", () => {
    const expected = new Date("2022-01-31");

    expect(getLastOfMonth(new Date("2022-01-01"))).toEqual(expected);
    expect(getLastOfMonth(new Date("2022-01-20"))).toEqual(expected);
    expect(getLastOfMonth(new Date("2022-01-31"))).toEqual(expected);
  });

  it("returns month", () => {
    expect(getMonth(new Date("2022-01-01"))).toEqual(1);
    expect(getMonth(new Date("2022-01-31"))).toEqual(1);
    expect(getMonth(new Date("2022-02-31"))).toEqual(3);
  });

  it("returns months labels", () => {
    const expected = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    expect(getMonths("en-US")).toEqual(expected);
  });

  it("returns next day", () => {
    expect(getNextDay(new Date("2022-01-01"))).toEqual(new Date("2022-01-02"));
    expect(getNextDay(new Date("2022-01-31"))).toEqual(new Date("2022-02-01"));
    expect(getNextDay(new Date("2022-12-31"))).toEqual(new Date("2023-01-01"));
  });

  it("returns next month", () => {
    expect(getNextMonth(new Date("2022-01-01"))).toEqual(
      new Date("2022-02-01")
    );

    expect(getNextMonth(new Date("2022-12-20"))).toEqual(
      new Date("2023-01-20")
    );
  });

  it("returns next year", () => {
    expect(getNextYear(new Date("2022-01-01"))).toEqual(new Date("2023-01-01"));
    expect(getNextYear(new Date("2022-12-31"))).toEqual(new Date("2023-12-31"));
  });

  it("returns previous day", () => {
    expect(getPreviousDay(new Date("2022-01-01"))).toEqual(
      new Date("2021-12-31")
    );

    expect(getPreviousDay(new Date("2022-01-31"))).toEqual(
      new Date("2022-01-30")
    );
  });

  it("returns previous month", () => {
    expect(getPreviousMonth(new Date("2022-01-01"))).toEqual(
      new Date("2021-12-01")
    );

    expect(getPreviousMonth(new Date("2022-12-20"))).toEqual(
      new Date("2022-11-20")
    );
  });

  it("returns previous year", () => {
    expect(getPreviousYear(new Date("2022-01-01"))).toEqual(
      new Date("2021-01-01")
    );
    expect(getPreviousYear(new Date("2022-12-31"))).toEqual(
      new Date("2021-12-31")
    );
  });

  it("returns week labels", () => {
    expect(getWeekDays(0, "en-US")).toEqual([
      ["Sun", "Sunday"],
      ["Mon", "Monday"],
      ["Tue", "Tuesday"],
      ["Wed", "Wednesday"],
      ["Thu", "Thursday"],
      ["Fri", "Friday"],
      ["Sat", "Saturday"]
    ]);

    expect(getWeekDays(1, "en-US")).toEqual([
      ["Mon", "Monday"],
      ["Tue", "Tuesday"],
      ["Wed", "Wednesday"],
      ["Thu", "Thursday"],
      ["Fri", "Friday"],
      ["Sat", "Saturday"],
      ["Sun", "Sunday"]
    ]);
  });

  it("returns year", () => {
    expect(getYear(new Date("2022-01-01"))).toEqual(2022);
  });

  it("returns whether date is in range", () => {
    expect(
      isDateInRange(new Date("2022-01-01"), {
        from: new Date("2022-01-01"),
        to: new Date("2022-01-01")
      })
    ).toEqual(true);

    expect(
      isDateInRange(new Date("2022-01-01"), {
        from: new Date("2021-01-01"),
        to: new Date("2022-02-01")
      })
    ).toEqual(true);

    expect(
      isDateInRange(new Date("2022-01-01"), {
        from: new Date("2022-02-01"),
        to: new Date("2021-01-01")
      })
    ).toEqual(true);

    expect(
      isDateInRange(new Date("2022-01-01"), {
        from: new Date("2022-01-02"),
        to: new Date("2022-02-01")
      })
    ).toEqual(false);
  });

  it("returns wheather dates are same day", () => {
    expect(isSameDay(new Date("2022-01-01"), new Date("2022-01-01"))).toEqual(
      true
    );

    expect(isSameDay(new Date("2022-01-01"), new Date("2021-01-01"))).toEqual(
      false
    );

    expect(isSameDay(new Date("2022-01-02"), new Date("2022-01-01"))).toEqual(
      false
    );
  });

  it("subs days of date", () => {
    expect(subDays(new Date("2022-01-01"), 1)).toEqual(new Date("2021-12-31"));
    expect(subDays(new Date("2022-01-11"), 10)).toEqual(new Date("2022-01-01"));
    expect(subDays(new Date("2022-03-02"), 60)).toEqual(new Date("2022-01-01"));
    expect(subDays(new Date("2023-01-01"), 365)).toEqual(
      new Date("2022-01-01")
    );
    expect(subDays(new Date("2022-01-01"), -1)).toEqual(new Date("2022-01-02"));
  });

  it("handles min-date and max-date", () => {
    expect(dateIsWithinUpperBounds(new Date("2023-01-15"))).toEqual(true);
    expect(
      dateIsWithinUpperBounds(new Date("2023-01-15"), "2023-01-15")
    ).toEqual(true);
    expect(
      dateIsWithinUpperBounds(new Date("2023-01-16"), "2023-01-15")
    ).toEqual(false);
    expect(dateIsWithinBounds(new Date("2023-01-15"))).toEqual(true);
    expect(dateIsWithinBounds(new Date("2023-01-15"), "2023-01-14")).toEqual(
      true
    );
    expect(dateIsWithinBounds(new Date("2023-01-15"), "2023-01-15")).toEqual(
      true
    );
    expect(dateIsWithinBounds(new Date("2023-01-15"), "2023-01-17")).toEqual(
      false
    );
    expect(
      dateIsWithinBounds(new Date("2023-01-25"), "2023-01-17", "2023-01-30")
    ).toEqual(true);
    expect(
      dateIsWithinBounds(new Date("2023-01-17"), "2023-01-17", "2023-01-30")
    ).toEqual(true);
    expect(dateIsWithinBounds(new Date("2023-01-15"))).toEqual(true);
    expect(
      dateIsWithinBounds(new Date("2023-01-15"), undefined, "2023-01-30")
    ).toEqual(true);
    expect(
      dateIsWithinBounds(new Date("2023-01-30"), "2023-01-17", "2023-01-30")
    ).toEqual(true);
    expect(
      dateIsWithinBounds(new Date("2023-01-15"), undefined, "2023-01-13")
    ).toEqual(false);
    expect(
      dateIsWithinBounds(new Date("2023-01-14"), undefined, "2023-01-13")
    ).toEqual(false);
  });

  it("can disable months", () => {
    expect(monthIsDisabled(2, 1999, undefined, undefined)).toBeFalsy();
    expect(monthIsDisabled(0, 2023, "2023-01-01", undefined)).toBeFalsy();
    expect(monthIsDisabled(0, 2023, "2022-12-31", undefined)).toBeFalsy();
    expect(monthIsDisabled(11, 2022, "2023-01-01", undefined)).toBeTruthy();
    expect(monthIsDisabled(2, 2023, "2023-01-31", undefined)).toBeFalsy();
    expect(monthIsDisabled(2, 1999, "2023-01-31", undefined)).toBeTruthy();
    expect(monthIsDisabled(2, 1999, undefined, "2023-12-12")).toBeFalsy();
    expect(monthIsDisabled(11, 2023, undefined, "2023-12-12")).toBeFalsy();
    expect(monthIsDisabled(0, 2024, undefined, "2023-12-12")).toBeTruthy();
    expect(monthIsDisabled(0, 2024, "1999-02-02", "2023-12-12")).toBeTruthy();
    expect(monthIsDisabled(0, 2024, "1999-02-02", "2024-12-12")).toBeFalsy();
  });
});
