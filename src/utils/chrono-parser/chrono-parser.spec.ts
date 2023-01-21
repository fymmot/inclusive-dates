import { chronoParseDate } from "./chrono-parser";
import { ChronoOptions, ChronoParsedDate } from "./chrono-parser.type";
import { isSameDay } from "../utils";

async function parseDateWithOptions(
  dateString: string,
  options?: ChronoOptions
): Promise<ChronoParsedDate> {
  if (!options)
    options = {
      referenceDate: new Date("2023-01-11")
    };
  const { referenceDate = new Date("2023-01-11") } = options;
  const parsedDate = await chronoParseDate(dateString, {
    referenceDate: referenceDate,
    ...options
  });
  return { value: parsedDate.value, reason: parsedDate.reason };
}

describe("Chrono date parser", () => {
  it("correctly parses absolute dates in English", async () => {
    let parsedDate = await parseDateWithOptions("January 15");
    expect(isSameDay(parsedDate.value, new Date("2023-01-15"))).toBeTruthy();

    parsedDate = await parseDateWithOptions("February tenth");
    expect(isSameDay(parsedDate.value, new Date("2023-02-10"))).toBeTruthy();

    parsedDate = await parseDateWithOptions("01-10-24");
    expect(isSameDay(parsedDate.value, new Date("2024-01-10"))).toBeTruthy();

    parsedDate = await parseDateWithOptions("01/10/24");
    expect(isSameDay(parsedDate.value, new Date("2024-01-10"))).toBeTruthy();

    parsedDate = await parseDateWithOptions("2024-01-10");
    expect(isSameDay(parsedDate.value, new Date("2024-01-10"))).toBeTruthy();

    parsedDate = await parseDateWithOptions("Twenty second of September");
    expect(isSameDay(parsedDate.value, new Date("2023-09-22"))).toBeTruthy();

    parsedDate = await parseDateWithOptions("June 1984");
    expect(isSameDay(parsedDate.value, new Date("1984-06-01"))).toBeTruthy();

    parsedDate = await parseDateWithOptions(
      "I want to book a ticket on the tenth of september"
    );
    expect(isSameDay(parsedDate.value, new Date("2023-09-10"))).toBeTruthy();
  });

  it("correctly parses relative dates in English", async () => {
    let parsedDate = await parseDateWithOptions("today");
    expect(isSameDay(parsedDate.value, new Date("2023-01-11"))).toBeTruthy();
    expect(isSameDay(parsedDate.value, new Date("2023-01-12"))).toBeFalsy();

    parsedDate = await parseDateWithOptions("tomorrow");
    expect(isSameDay(parsedDate.value, new Date("2023-01-12"))).toBeTruthy();
    expect(isSameDay(parsedDate.value, new Date("2023-01-11"))).toBeFalsy();

    parsedDate = await parseDateWithOptions("yesterday");
    expect(isSameDay(parsedDate.value, new Date("2023-01-10"))).toBeTruthy();
    expect(isSameDay(parsedDate.value, new Date("2023-01-11"))).toBeFalsy();

    parsedDate = await parseDateWithOptions("next year");
    expect(isSameDay(parsedDate.value, new Date("2024-01-11"))).toBeTruthy();

    parsedDate = await parseDateWithOptions("in ten days");
    expect(isSameDay(parsedDate.value, new Date("2023-01-21"))).toBeTruthy();

    parsedDate = await parseDateWithOptions("in ten years");
    expect(isSameDay(parsedDate.value, new Date("2033-01-11"))).toBeTruthy();

    parsedDate = await parseDateWithOptions("in eleven months");
    expect(isSameDay(parsedDate.value, new Date("2023-12-11"))).toBeTruthy();
  });

  it("adapts to different reference dates", async () => {
    let parsedDate = await parseDateWithOptions("today", {
      referenceDate: new Date("2023-02-02")
    });
    expect(isSameDay(parsedDate.value, new Date("2023-02-02"))).toBeTruthy();
  });

  it("can use strict mode", async () => {
    let parsedDate = await parseDateWithOptions("today", { useStrict: true });
    expect(parsedDate.value).toBeNull();
    expect(parsedDate.reason).toEqual("invalid");

    parsedDate = await parseDateWithOptions("June eleven 1984", {
      useStrict: true
    });
    expect(parsedDate.value).toBeNull();
    expect(parsedDate.reason).toEqual("invalid");

    parsedDate = await parseDateWithOptions("Friday", {
      useStrict: true
    });
    expect(parsedDate.value).toBeNull();
    expect(parsedDate.reason).toEqual("invalid");

    parsedDate = await parseDateWithOptions("2023-02-01", {
      useStrict: true
    });
    expect(isSameDay(parsedDate.value, new Date("2023-02-01"))).toBeTruthy();

    parsedDate = await parseDateWithOptions("August 8 2004", {
      useStrict: true
    });
    expect(isSameDay(parsedDate.value, new Date("2004-08-08"))).toBeTruthy();
  });

  it("respects min and max date", async () => {
    let parsedDate = await parseDateWithOptions("july 1999", {
      minDate: "2000-01-01",
      maxDate: "2030-12-31"
    });
    expect(parsedDate.value).toBeNull();
    expect(parsedDate.reason).toEqual("minDate");

    parsedDate = await parseDateWithOptions("in 50 years", {
      minDate: "2000-01-01",
      maxDate: "2030-12-31"
    });
    expect(parsedDate.value).toBeNull();
    expect(parsedDate.reason).toEqual("maxDate");

    parsedDate = await parseDateWithOptions("January 1 2000", {
      minDate: "2000-01-01",
      maxDate: "2030-12-31"
    });
    expect(isSameDay(parsedDate.value, new Date("2000-01-01"))).toBeTruthy();

    parsedDate = await parseDateWithOptions("December 31 2030", {
      minDate: "2000-01-01",
      maxDate: "2030-12-31"
    });
    expect(isSameDay(parsedDate.value, new Date("2030-12-31"))).toBeTruthy();
  });
});
