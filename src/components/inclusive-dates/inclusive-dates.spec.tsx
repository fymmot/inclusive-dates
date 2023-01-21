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

/*function getCalendarButton(page: SpecPage): HTMLButtonElement {
  return page.root.querySelector<HTMLButtonElement>(
    ".inclusive-dates__calendar-button"
  );
}
function getModal(page: SpecPage): HTMLInclusiveDatesModalElement {
  return page.root.querySelector<HTMLInclusiveDatesModalElement>(
    "inclusive-dates-modal"
  );
}*/

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

  it;

  it("External date parsing method works", async () => {
    const page = await newSpecPage({
      components: [InclusiveDates],
      html: `<inclusive-dates id="test123" locale="en-US"></inclusive-dates>`,
      language: "en"
    });
    const datepicker = getDatePicker(page);
    const referenceDate = new Date("2023-01-11");

    // Basic dates
    let parsedDate = await datepicker.parseDate("January 15", false, {
      referenceDate: referenceDate
    });
    expect(parsedDate.value).toEqual(`2023-01-15`);
    parsedDate = await datepicker.parseDate("February tenth ", false, {
      referenceDate: referenceDate
    });
    expect(parsedDate.value).toEqual(`2023-02-10`);
  });

  it("Does not parse unsupported locales", async () => {
    const consoleSpy = jest.spyOn(console, "warn");
    const page = await newSpecPage({
      components: [InclusiveDates],
      html: `<inclusive-dates id="test123" locale="sv-SE"></inclusive-dates>`,
      language: "en"
    });
    const datepicker = getDatePicker(page);

    let parsedDate = await datepicker.parseDate("in ten days");
    expect(parsedDate.value).toEqual(undefined);
    parsedDate = await datepicker.parseDate("January 5");
    expect(parsedDate.value).toEqual(undefined);
    expect(consoleSpy).toHaveBeenCalledWith(
      `inclusive-dates: The chosen locale "sv-SE" is not supported by Chrono.js. Date parsing has been disabled`
    );
    consoleSpy.mockClear();
  });

  it("Datepicker still accepts ISO-formatted dates when Chrono.js is not supported", async () => {
    const page = await newSpecPage({
      components: [InclusiveDates],
      html: `<inclusive-dates id="test123" locale="sv-SE"></inclusive-dates>`,
      language: "en"
    });
    const datepicker = getDatePicker(page);

    let parsedDate = await datepicker.parseDate("2023-02-02");
    expect(parsedDate.value).toEqual("2023-02-02");
  });
});
