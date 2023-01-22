import { newSpecPage, SpecPage } from "@stencil/core/testing";
import { InclusiveDates } from "./inclusive-dates";

function getDatePicker(page: SpecPage): HTMLInclusiveDatesElement {
  return page.root as HTMLInclusiveDatesElement;
}
function getInput(page: SpecPage): HTMLInputElement {
  return page.root.querySelector<HTMLInputElement>(".inclusive-dates__input");
}
function getLabel(page: SpecPage): HTMLLabelElement {
  return page.root.querySelector<HTMLLabelElement>(".inclusive-dates__label");
}
function getQuickButtons(page: SpecPage): NodeListOf<HTMLButtonElement> {
  return page.root.querySelectorAll<HTMLButtonElement>(
    ".inclusive-dates__quick-button"
  );
}

// function getCalendarButton(page: SpecPage): HTMLButtonElement {
//   return page.root.querySelector<HTMLButtonElement>(
//     ".inclusive-dates__calendar-button"
//   );
// }
//
// function getModal(page: SpecPage): HTMLInclusiveDatesModalElement {
//   return page.root.querySelector<HTMLInclusiveDatesModalElement>(
//     "inclusive-dates-modal"
//   );
// }

describe("inclusive-dates", () => {
  it("Label and input are correctly associated", async () => {
    const consoleSpy = jest.spyOn(console, "error");
    const page = await newSpecPage({
      components: [InclusiveDates],
      html: `<inclusive-dates id="test123"></inclusive-dates>`,
      language: "en"
    });
    const input = getInput(page);
    const label = getLabel(page);
    expect(input.getAttribute("id")).not.toContain("undefined");
    expect(label.getAttribute("htmlFor")).not.toContain("undefined");
    expect(input.getAttribute("id")).toEqual(label.getAttribute("htmlFor"));
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockClear();

    await newSpecPage({
      components: [InclusiveDates],
      html: `<inclusive-dates></inclusive-dates>`,
      language: "en"
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      'inclusive-dates: The "id" prop is required for accessibility'
    );
    consoleSpy.mockClear();
  });

  /*it("Calendar button opens the calendar", async () => {
    const page = await newSpecPage({
      components: [InclusiveDates],
      html: `<inclusive-dates id="test123" locale="sv-SE"></inclusive-dates>`,
      language: "en"
    });
    const modal = getModal(page);
    const calendarButton = getCalendarButton(page);

    calendarButton.click();
    await page.waitForChanges();

    console.log(modal.getState());
  });*/

  it("Datepicker text input parses dates", async () => {
    const page = await newSpecPage({
      components: [InclusiveDates],
      html: `<inclusive-dates id="test123" locale="en" reference-date="2023-01-21" max-date="2034-11-02"
        min-date="1988-12-30"></inclusive-dates>`,
      language: "en"
    });
    const input = getInput(page);

    input.value = "Yesterday";
    input.dispatchEvent(new Event("change"));
    await page.waitForChanges();
    expect(input.value).toContain("January 20, 2023");

    input.value = "In ten days";
    input.dispatchEvent(new Event("change"));
    await page.waitForChanges();
    expect(input.value).toContain("January 31, 2023");

    input.value = "August 8 2004";
    input.dispatchEvent(new Event("change"));
    await page.waitForChanges();
    expect(input.value).toContain("August 8, 2004");

    input.value = "50 years ago"; // Min-date error
    input.dispatchEvent(new Event("change"));
    await page.waitForChanges();
    expect(input.value).toContain("50 years ago");
    expect(input.getAttribute("aria-invalid")).toEqual("");
    expect(
      page.root.querySelectorAll(".inclusive-dates__input-error")
    ).toHaveLength(1);

    input.value = "In 50 years"; // Max-date error
    input.dispatchEvent(new Event("change"));
    await page.waitForChanges();
    expect(input.value).toContain("In 50 years");
    expect(input.getAttribute("aria-invalid")).toEqual("");
    expect(
      page.root.querySelectorAll(".inclusive-dates__input-error")
    ).toHaveLength(1);
  });

  it("Datepicker text input parses date ranges", async () => {
    const page = await newSpecPage({
      components: [InclusiveDates],
      html: `<inclusive-dates id="test123" locale="en" reference-date="2023-01-21" range="true"></inclusive-dates>`,
      language: "en"
    });
    const input = getInput(page);

    input.value = "From today to tomorrow";
    input.dispatchEvent(new Event("change"));
    await page.waitForChanges();
    expect(input.value).toContain("Jan 21, 2023 to Jan 22, 2023");

    input.value = "June to august 1984";
    input.dispatchEvent(new Event("change"));
    await page.waitForChanges();
    expect(input.value).toContain("Jun 1, 1984 to Aug 1, 1984");

    input.value = "Today to 20 days";
    input.dispatchEvent(new Event("change"));
    await page.waitForChanges();
    expect(input.value).toContain("Jan 21, 2023 to Feb 10, 2023");
  });

  it("Quick buttons changes dates", async () => {
    const page = await newSpecPage({
      components: [InclusiveDates],
      html: `<inclusive-dates id="test123" locale="en" reference-date="2023-01-21"></inclusive-dates>`,
      language: "en"
    });
    const input = getInput(page);
    const datePicker = getDatePicker(page);
    datePicker.quickButtons = ["Yesterday", "In ten days"];
    await page.waitForChanges();
    const quickButtons = getQuickButtons(page);
    quickButtons[0].click();
    await page.waitForChanges();
    expect(input.value).toEqual("Friday, January 20, 2023");
    quickButtons[1].click();
    await page.waitForChanges();
    expect(input.value).toEqual("Tuesday, January 31, 2023");
  });

  it("External date parsing method works", async () => {
    const page = await newSpecPage({
      components: [InclusiveDates],
      html: `<inclusive-dates id="test123" locale="en-US" reference-date="2023-01-11"></inclusive-dates>`,
      language: "en"
    });
    const datepicker = getDatePicker(page);
    // Basic dates
    let parsedDate = await datepicker.parseDate("January 15", false);
    expect(parsedDate.value).toEqual(`2023-01-15`);
    parsedDate = await datepicker.parseDate("February tenth ", false);
    expect(parsedDate.value).toEqual(`2023-02-10`);
    parsedDate = await datepicker.parseDate("February second ", false);
    expect(parsedDate.value).toEqual(`2023-02-02`);
  });

  it("Does not parse unsupported locales", async () => {
    const consoleSpy = jest.spyOn(console, "warn");
    const page = await newSpecPage({
      components: [InclusiveDates],
      html: `<inclusive-dates id="test123" locale="sv-SE"></inclusive-dates>`,
      language: "en"
    });
    const input = getInput(page);

    input.value = "om tio dagar";
    input.dispatchEvent(new Event("change"));
    await page.waitForChanges();
    expect(input.value).toContain("om tio dagar");
    expect(consoleSpy).toHaveBeenCalledWith(
      `inclusive-dates: The chosen locale "sv-SE" is not supported by Chrono.js. Date parsing has been disabled`
    );
    consoleSpy.mockClear();
  });

  it("Text field still accepts ISO-formatted dates for non-Chrono locales", async () => {
    const page = await newSpecPage({
      components: [InclusiveDates],
      html: `<inclusive-dates id="test123" locale="sv-SE"></inclusive-dates>`,
      language: "en"
    });
    const input = getInput(page);

    input.value = "2023-02-02";
    input.dispatchEvent(new Event("change"));
    await page.waitForChanges();
    expect(input.value).toContain("2 februari 2023");
  });
});
