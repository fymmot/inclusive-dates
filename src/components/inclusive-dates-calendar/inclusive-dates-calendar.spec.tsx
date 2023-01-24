import { newSpecPage, SpecPage } from "@stencil/core/testing";
import {
  getDaysOfMonth,
  getISODateString,
  getMonth,
  getWeekDays,
  getYear
} from "../../utils/utils";
import { InclusiveDatesCalendar } from "./inclusive-dates-calendar";

function getDisplayedDates(page: SpecPage) {
  return Array.from(
    page.root.querySelectorAll<HTMLTableCellElement>(
      ".inclusive-dates-calendar__date"
    )
  ).map((el) => +(el.children[0] as HTMLElement).innerText);
}

function getSelectedMonth(page: SpecPage) {
  return +Array.from(
    page.root
      .querySelector<HTMLSelectElement>(
        ".inclusive-dates-calendar__month-select"
      )
      .querySelectorAll("option")
  )
    .find((option) => option.getAttribute("selected") === "")
    .getAttribute("value");
}

function getSelectedYear(page: SpecPage) {
  return +page.root.querySelector<HTMLInputElement>(
    ".inclusive-dates-calendar__year-select"
  ).value;
}

function getWeekdaysHeader(page: SpecPage) {
  return Array.from(
    page.root.querySelectorAll<HTMLTableCellElement>(
      ".inclusive-dates-calendar__weekday"
    )
  ).map((el) => el.innerText);
}

function triggerKeyDown(page: SpecPage, code: string) {
  page.root
    .querySelector(".inclusive-dates-calendar__calendar")
    .dispatchEvent(new KeyboardEvent("keydown", { code }));
}

describe("inclusive-dates-calendar", () => {
  it("initially shows the current month", async () => {
    const page = await newSpecPage({
      components: [InclusiveDatesCalendar],
      html: `<inclusive-dates-calendar></inclusive-dates-calendar>`,
      language: "en"
    });

    const selectedMonth = getSelectedMonth(page);
    const selectedYear = getSelectedYear(page);
    const displayedDates = getDisplayedDates(page);

    expect(selectedMonth).toBe(getMonth(new Date()));
    expect(selectedYear).toBe(getYear(new Date()));

    expect(displayedDates).toEqual(
      getDaysOfMonth(new Date(), true, 7).map((date) => date.getDate())
    );
  });

  it("shows configured start date", async () => {
    const page = await newSpecPage({
      components: [InclusiveDatesCalendar],
      html: `<inclusive-dates-calendar></inclusive-dates-calendar>`,
      language: "en"
    });

    page.root.startDate = new Date("1989-05-16");
    await page.waitForChanges();

    const selectedMonth = getSelectedMonth(page);
    const selectedYear = getSelectedYear(page);

    expect(selectedMonth).toBe(5);
    expect(selectedYear).toBe(1989);
  });

  it("shows weekday header", async () => {
    const page = await newSpecPage({
      components: [InclusiveDatesCalendar],
      html: `<inclusive-dates-calendar></inclusive-dates-calendar>`,
      language: "en"
    });

    const weekdaysHeader1 = getWeekdaysHeader(page);

    expect(weekdaysHeader1).toEqual(
      // Results in double weekday names due to screen reader text
      getWeekDays(0, "en-US").map((weekday) => `${weekday[0]}${weekday[1]}`)
    );

    page.root.setAttribute("first-day-of-week", "1");
    await page.waitForChanges();

    const weekdaysHeader2 = getWeekdaysHeader(page);

    expect(weekdaysHeader2).toEqual(
      // Results in double weekday names due to screen reader text
      getWeekDays(1, "en-US").map((weekday) => `${weekday[0]}${weekday[1]}`)
    );

    page.root.setAttribute("locale", "de-DE");
    await page.waitForChanges();

    const weekdaysHeader3 = getWeekdaysHeader(page);

    expect(weekdaysHeader3).toEqual(
      // Results in double weekday names due to screen reader text
      getWeekDays(1, "de-DE").map((weekday) => `${weekday[0]}${weekday[1]}`)
    );
  });

  it("fires selectDate events", async () => {
    const page = await newSpecPage({
      components: [InclusiveDatesCalendar],
      html: `<inclusive-dates-calendar></inclusive-dates-calendar>`,
      language: "en"
    });

    const spy = jest.fn();

    page.root.startDate = new Date("2022-01-01");
    page.root.addEventListener("selectDate", spy);

    await page.waitForChanges();

    page.root
      .querySelector<HTMLTableCellElement>(".inclusive-dates-calendar__date")
      .click();

    triggerKeyDown(page, "ArrowRight");
    triggerKeyDown(page, "Space");

    triggerKeyDown(page, "ArrowDown");
    triggerKeyDown(page, "Enter");

    triggerKeyDown(page, "ArrowUp");
    triggerKeyDown(page, "Enter");

    triggerKeyDown(page, "ArrowLeft");
    triggerKeyDown(page, "Enter");

    expect(spy.mock.calls[0][0].detail).toEqual("2021-12-26");
    expect(spy.mock.calls[1][0].detail).toEqual("2021-12-27");
    expect(spy.mock.calls[2][0].detail).toEqual("2022-01-03");
    expect(spy.mock.calls[3][0].detail).toEqual("2021-12-27");
    expect(spy.mock.calls[4][0].detail).toEqual("2021-12-26");

    page.root.setAttribute("range", "true");
    await page.waitForChanges();

    page.root
      .querySelector<HTMLTableCellElement>(".inclusive-dates-calendar__date")
      .click();

    triggerKeyDown(page, "ArrowRight");
    triggerKeyDown(page, "Space");

    expect(spy.mock.calls[5][0].detail).toEqual(undefined);
    expect(spy.mock.calls[6][0].detail).toEqual(["2021-11-28"]);
    expect(spy.mock.calls[7][0].detail).toEqual(["2021-11-28", "2021-11-29"]);

    page.root
      .querySelector<HTMLTableCellElement>(".inclusive-dates-calendar__date")
      .click();

    expect(spy.mock.calls[6][0].detail).toEqual(["2021-11-28"]);
  });

  /*it("gives correct screen reader labels in range mode", async () => {
    const page = await newSpecPage({
      components: [InclusiveDatesCalendar],
      html: `<inclusive-dates-calendar range="true"></inclusive-dates-calendar>`,
      language: "en"
    });

    const spy = jest.fn();

    page.root.startDate = new Date("2022-01-01");
    page.root.addEventListener("selectDate", spy);

    await page.waitForChanges();

    let currentDate = page.root.querySelector<HTMLTableCellElement>(
      ".inclusive-dates-calendar__date"
    );
    expect(currentDate.innerText).toContain("choose as start date");

    currentDate.click();

    triggerKeyDown(page, "ArrowRight");
    triggerKeyDown(page, "Space");

    expect(spy.mock.calls[0][0].detail).toEqual(["2021-12-26"]);

    triggerKeyDown(page, "ArrowRight");
    triggerKeyDown(page, "Enter");

    await page.waitForChanges();

    currentDate = page.root.querySelector<HTMLTableCellElement>(
      ".inclusive-dates-calendar__date--current"
    );

    expect(currentDate.innerText).toContain("Selected date");
    expect(spy.mock.calls[1][0].detail).toEqual(["2021-12-26", "2021-12-27"]);

    triggerKeyDown(page, "ArrowDown");

    await page.waitForChanges();

    currentDate = page.root.querySelector<HTMLTableCellElement>(
      ".inclusive-dates-calendar__date--current"
    );

    expect(currentDate.innerText).toContain("selected date");
  });*/

  it("highlights current date with keyboard selection", async () => {
    const page = await newSpecPage({
      components: [InclusiveDatesCalendar],
      html: `<inclusive-dates-calendar></inclusive-dates-calendar>`,
      language: "en"
    });

    page.root.startDate = new Date("2022-01-01");

    await page.waitForChanges();

    triggerKeyDown(page, "ArrowRight");
    await page.waitForChanges();

    expect(
      page.root.querySelector(".inclusive-dates-calendar__date--current")
        .children[0].innerHTML
    ).toBe("2");

    triggerKeyDown(page, "ArrowRight");
    await page.waitForChanges();

    expect(
      page.root.querySelector(".inclusive-dates-calendar__date--current")
        .children[0].innerHTML
    ).toBe("3");

    triggerKeyDown(page, "ArrowDown");
    await page.waitForChanges();

    expect(
      page.root.querySelector(".inclusive-dates-calendar__date--current")
        .children[0].innerHTML
    ).toBe("10");

    triggerKeyDown(page, "ArrowLeft");
    await page.waitForChanges();

    expect(
      page.root.querySelector(".inclusive-dates-calendar__date--current")
        .children[0].innerHTML
    ).toBe("9");

    triggerKeyDown(page, "ArrowUp");
    await page.waitForChanges();

    expect(
      page.root.querySelector(".inclusive-dates-calendar__date--current")
        .children[0].innerHTML
    ).toBe("2");

    triggerKeyDown(page, "End");
    await page.waitForChanges();

    expect(
      page.root.querySelector(".inclusive-dates-calendar__date--current")
        .children[0].innerHTML
    ).toBe("31");

    triggerKeyDown(page, "Home");
    await page.waitForChanges();

    expect(
      page.root.querySelector(".inclusive-dates-calendar__date--current")
        .children[0].innerHTML
    ).toBe("1");

    triggerKeyDown(page, "PageDown");
    await page.waitForChanges();

    expect(
      page.root.querySelector(".inclusive-dates-calendar__date--current")
        .children[0].innerHTML
    ).toBe("1");

    triggerKeyDown(page, "PageUp");
    await page.waitForChanges();

    expect(
      page.root.querySelector(".inclusive-dates-calendar__date--current")
        .children[0].innerHTML
    ).toBe("1");
  });

  it("resets value after range prop is changed", async () => {
    const page = await newSpecPage({
      components: [InclusiveDatesCalendar],
      html: `<inclusive-dates-calendar></inclusive-dates-calendar>`,
      language: "en"
    });

    const spy = jest.fn();

    page.root.addEventListener("selectDate", spy);
    page.root.value = new Date("1989-05-16");

    page.root.setAttribute("range", "true");

    expect(page.root.value).toBeUndefined();
    expect(spy.mock.calls[0][0].detail).toBeUndefined();
  });

  it("disables dates", async () => {
    const page = await newSpecPage({
      components: [InclusiveDatesCalendar],
      html: `<inclusive-dates-calendar></inclusive-dates-calendar>`,
      language: "en"
    });

    const spy = jest.fn();

    page.root.addEventListener("selectDate", spy);
    page.root.setAttribute("start-date", "2022-01-01");
    page.root.disableDate = (date: Date) =>
      getISODateString(date) === "2022-01-01";

    await page.waitForChanges();

    const dateCell = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>(
        ".inclusive-dates-calendar__date"
      )
    ).find((el) => el.dataset.date === "2022-01-01");

    dateCell.click();

    expect(dateCell.getAttribute("aria-disabled")).toBe("true");
    expect(spy).not.toHaveBeenCalled();
  });

  it("respects min date", async () => {
    const page = await newSpecPage({
      components: [InclusiveDatesCalendar],
      html: `<inclusive-dates-calendar min-date="2022-01-05"></inclusive-dates-calendar>`,
      language: "en"
    });

    const spy = jest.fn();

    page.root.addEventListener("selectDate", spy);
    page.root.setAttribute("start-date", "2022-01-15");

    await page.waitForChanges();

    const disabledDateCell = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>(
        ".inclusive-dates-calendar__date"
      )
    ).find((el) => el.dataset.date === "2022-01-04");

    let nonDisabledDateCell = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>(
        ".inclusive-dates-calendar__date"
      )
    ).find((el) => el.dataset.date === "2022-01-15");

    disabledDateCell.click();

    expect(disabledDateCell.getAttribute("aria-disabled")).toBe("true");
    expect(spy).not.toHaveBeenCalled();

    nonDisabledDateCell.click();
    expect(nonDisabledDateCell.getAttribute("aria-disabled")).toBe("false");
    expect(spy).toHaveBeenCalled();

    nonDisabledDateCell = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>(
        ".inclusive-dates-calendar__date"
      )
    ).find((el) => el.dataset.date === "2022-01-05");
    expect(nonDisabledDateCell.getAttribute("aria-disabled")).toBe("false");
  });

  it("respects max date", async () => {
    const page = await newSpecPage({
      components: [InclusiveDatesCalendar],
      html: `<inclusive-dates-calendar max-date="2022-01-29"></inclusive-dates-calendar>`,
      language: "en"
    });

    const spy = jest.fn();

    page.root.addEventListener("selectDate", spy);
    page.root.setAttribute("start-date", "2022-01-15");

    await page.waitForChanges();

    const disabledDateCell = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>(
        ".inclusive-dates-calendar__date"
      )
    ).find((el) => el.dataset.date === "2022-01-30");

    let nonDisabledDateCell = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>(
        ".inclusive-dates-calendar__date"
      )
    ).find((el) => el.dataset.date === "2022-01-20");

    disabledDateCell.click();

    expect(disabledDateCell.getAttribute("aria-disabled")).toBe("true");
    expect(spy).not.toHaveBeenCalled();

    nonDisabledDateCell.click();
    expect(nonDisabledDateCell.getAttribute("aria-disabled")).toBe("false");

    nonDisabledDateCell = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>(
        ".inclusive-dates-calendar__date"
      )
    ).find((el) => el.dataset.date === "2022-01-29");
    expect(nonDisabledDateCell.getAttribute("aria-disabled")).toBe("false");
  });

  it("changes months", async () => {
    const page = await newSpecPage({
      components: [InclusiveDatesCalendar],
      html: `<inclusive-dates-calendar show-hidden-title="true" start-date="2022-02-01" min-date="2022-02-01" max-date="2022-05-30"></inclusive-dates-calendar>`,
      language: "en"
    });

    const spy = jest.fn();
    page.root.addEventListener("changeMonth", spy);

    const monthSelect = page.root.querySelector<HTMLSelectElement>(
      ".inclusive-dates-calendar__month-select"
    );

    const header = page.root.querySelector<HTMLElement>(
      ".inclusive-dates-calendar__header"
    );

    const previousMonthButton = page.root.querySelector<HTMLButtonElement>(
      ".inclusive-dates-calendar__previous-month-button"
    );

    const nextMonthButton = page.root.querySelector<HTMLButtonElement>(
      ".inclusive-dates-calendar__next-month-button"
    );

    expect(header.innerText.startsWith("February")).toBeTruthy();

    monthSelect.value = "5";
    monthSelect.dispatchEvent(new Event("change"));

    await page.waitForChanges();

    expect(header.innerText.startsWith("May")).toBeTruthy();
    expect(spy.mock.calls[0][0].detail).toEqual({ month: 5, year: 2022 });

    previousMonthButton.click();
    await page.waitForChanges();

    expect(header.innerText.startsWith("April")).toBeTruthy();
    expect(spy.mock.calls[1][0].detail).toEqual({ month: 4, year: 2022 });

    nextMonthButton.click();
    await page.waitForChanges();

    expect(header.innerText.startsWith("May")).toBeTruthy();
    expect(spy.mock.calls[2][0].detail).toEqual({ month: 5, year: 2022 });

    nextMonthButton.click(); // Should not work - max date has been set
    await page.waitForChanges();

    expect(header.innerText.startsWith("May")).toBeTruthy();
    expect(spy.mock.calls[2][0].detail).toEqual({ month: 5, year: 2022 });
    expect(previousMonthButton.getAttribute("disabled")).toEqual(null);

    monthSelect.value = "2";
    monthSelect.dispatchEvent(new Event("change"));
    await page.waitForChanges();

    previousMonthButton.click(); // Should not work - min date has been set
    monthSelect.dispatchEvent(new Event("change"));
    await page.waitForChanges();

    expect(header.innerText.startsWith("February")).toBeTruthy();
    // expect(previousMonthButton.getAttribute("disabled")).toEqual("");
  });

  it("changes year", async () => {
    const page = await newSpecPage({
      components: [InclusiveDatesCalendar],
      html: `<inclusive-dates-calendar show-hidden-title="true" show-year-stepper="true" start-date="2022-01-01" max-date="2025-12-31" min-date="1988"></inclusive-dates-calendar>`,
      language: "en"
    });

    const spy = jest.fn();
    page.root.addEventListener("changeMonth", spy);

    const yearSelect = page.root.querySelector<HTMLInputElement>(
      ".inclusive-dates-calendar__year-select"
    );

    const header = page.root.querySelector<HTMLElement>(
      ".inclusive-dates-calendar__header"
    );

    const previousYearButton = page.root.querySelector<HTMLButtonElement>(
      ".inclusive-dates-calendar__previous-year-button"
    );

    const nextYearButton = page.root.querySelector<HTMLButtonElement>(
      ".inclusive-dates-calendar__next-year-button"
    );

    expect(header.innerText.includes("2022")).toBeTruthy();

    yearSelect.value = "1989";
    yearSelect.dispatchEvent(new Event("change"));

    await page.waitForChanges();

    expect(header.innerText.includes("1989")).toBeTruthy();
    expect(spy.mock.calls[0][0].detail).toEqual({ month: 1, year: 1989 });

    previousYearButton.click();
    await page.waitForChanges();

    expect(header.innerText.includes("1988")).toBeTruthy();
    expect(spy.mock.calls[1][0].detail).toEqual({ month: 1, year: 1988 });

    nextYearButton.click();
    await page.waitForChanges();

    expect(header.innerText.includes("1989")).toBeTruthy();
    expect(spy.mock.calls[2][0].detail).toEqual({ month: 1, year: 1989 });

    yearSelect.value = "2025";
    yearSelect.dispatchEvent(new Event("change"));
    await page.waitForChanges();

    nextYearButton.click();
    await page.waitForChanges();

    expect(header.innerText.includes("2026")).toBeFalsy();
    expect(nextYearButton.getAttribute("aria-disabled")).toBe("");

    yearSelect.value = "1988";
    yearSelect.dispatchEvent(new Event("change"));
    await page.waitForChanges();

    previousYearButton.click();
    await page.waitForChanges();

    expect(header.innerText.includes("1987")).toBeFalsy();
    expect(previousYearButton.getAttribute("aria-disabled")).toBe("");
  });

  it("jumps to current month", async () => {
    const page = await newSpecPage({
      components: [InclusiveDatesCalendar],
      html: `<inclusive-dates-calendar show-hidden-title="true" show-today-button="true" start-date="1989-01-01"></inclusive-dates-calendar>`,
      language: "en"
    });

    const todayButton = page.root.querySelector<HTMLButtonElement>(
      ".inclusive-dates-calendar__today-button"
    );

    const header = page.root.querySelector<HTMLElement>(
      ".inclusive-dates-calendar__header"
    );

    const today = new Date();

    expect(header.innerText.includes("January 1989")).toBeTruthy();

    todayButton.click();
    await page.waitForChanges();

    expect(
      header.innerText.includes(
        Intl.DateTimeFormat("en-US", {
          month: "long",
          year: "numeric"
        }).format(today)
      )
    ).toBeTruthy();
  });

  it("clears its value", async () => {
    const page = await newSpecPage({
      components: [InclusiveDatesCalendar],
      html: `<inclusive-dates-calendar show-clear-button="true" start-date="2022-01-01"></inclusive-dates-calendar>`,
      language: "en"
    });

    const spy = jest.fn();

    const clearButton = page.root.querySelector<HTMLButtonElement>(
      ".inclusive-dates-calendar__clear-button"
    );

    page.root.addEventListener("selectDate", spy);

    page.root
      .querySelector<HTMLTableCellElement>(".inclusive-dates-calendar__date")
      .click();

    expect(spy.mock.calls[0][0].detail).toBe("2021-12-26");

    clearButton.click();
    await page.waitForChanges();

    expect(spy.mock.calls[1][0].detail).toBe(undefined);
  });

  it("can be disabled", async () => {
    const page = await newSpecPage({
      components: [InclusiveDatesCalendar],
      html: `<inclusive-dates-calendar disabled></inclusive-dates-calendar>`,
      language: "en"
    });

    const spy = jest.fn();

    page.root.startDate = new Date("2022-01-01");
    page.root.addEventListener("selectDate", spy);
    page.root.addEventListener("changeMonth", spy);

    await page.waitForChanges();

    page.root
      .querySelector<HTMLTableCellElement>(".inclusive-dates-calendar__date")
      .click();

    triggerKeyDown(page, "ArrowRight");
    triggerKeyDown(page, "Space");

    expect(
      page.root.children[0].classList.contains(
        "inclusive-dates-calendar--disabled"
      )
    ).toBeTruthy();

    expect(spy).not.toHaveBeenCalled();
  });
});
