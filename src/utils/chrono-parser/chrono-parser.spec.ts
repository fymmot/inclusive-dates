import { chronoParseDate, chronoParseRange } from "./chrono-parser";
import {
  ChronoOptions,
  ChronoParsedDate,
  ChronoParsedRange
} from "./chrono-parser.type";
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

async function parseRangeWithOptions(
  dateString: string,
  options?: ChronoOptions
): Promise<ChronoParsedRange> {
  if (!options)
    options = {
      referenceDate: new Date("2023-01-11")
    };
  const { referenceDate = new Date("2023-01-11") } = options;
  const parsedRange = await chronoParseRange(dateString, {
    referenceDate: referenceDate,
    ...options
  });
  return { value: parsedRange.value, reason: parsedRange.reason };
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

  it("can parse range dates", async () => {
    let parsedRange = await parseRangeWithOptions(
      "from january 25 to january 30"
    );
    expect(
      isSameDay(parsedRange.value.start, new Date("2023-01-25"))
    ).toBeTruthy();
    expect(
      isSameDay(parsedRange.value.end, new Date("2023-01-30"))
    ).toBeTruthy();

    parsedRange = await parseRangeWithOptions("june 1984 - february 1990");
    expect(
      isSameDay(parsedRange.value.start, new Date("1984-06-01"))
    ).toBeTruthy();
    expect(
      isSameDay(parsedRange.value.end, new Date("1990-02-01"))
    ).toBeTruthy();

    parsedRange = await parseRangeWithOptions(
      "june second 2008 - june third 2008"
    );
    expect(
      isSameDay(parsedRange.value.start, new Date("2008-06-02"))
    ).toBeTruthy();
    expect(
      isSameDay(parsedRange.value.end, new Date("2008-06-03"))
    ).toBeTruthy();

    parsedRange = await parseRangeWithOptions("june second 2008");
    expect(
      isSameDay(parsedRange.value.start, new Date("2008-06-02"))
    ).toBeTruthy();
    expect(parsedRange.value.end).toBeNull();
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

  it("correctly parses ambiguous dates based on English regional locales (DD/MM/YYYY vs MM/DD/YYYY)", async () => {
    // Standard English and US English should interpret as MM/DD/YYYY (September 1, 2020)
    let parsedEn = await parseDateWithOptions("9/1/2020", { locale: "en" });
    expect(parsedEn.value.getDate()).toEqual(1);
    expect(isSameDay(parsedEn.value, new Date("2020-09-01"))).toBeTruthy();

    let parsedUS = await parseDateWithOptions("9/1/2020", { locale: "en-US" });
    expect(parsedUS.value.getDate()).toEqual(1);
    expect(isSameDay(parsedUS.value, new Date("2020-09-01"))).toBeTruthy();

    let parsedUSUnderscore = await parseDateWithOptions("9/1/2020", {
      locale: "en_US"
    });
    expect(parsedUSUnderscore.value.getDate()).toEqual(1);
    expect(
      isSameDay(parsedUSUnderscore.value, new Date("2020-09-01"))
    ).toBeTruthy();

    // Regional English locales (UK, AU, NZ, CA, IE, ZA) should interpret as DD/MM/YYYY (January 9, 2020)
    let parsedGB = await parseDateWithOptions("9/1/2020", { locale: "en-GB" });
    expect(parsedGB.value.getDate()).toEqual(9);
    expect(isSameDay(parsedGB.value, new Date("2020-01-09"))).toBeTruthy();

    let parsedGBUnderscore = await parseDateWithOptions("9/1/2020", {
      locale: "en_GB"
    });
    expect(parsedGBUnderscore.value.getDate()).toEqual(9);
    expect(
      isSameDay(parsedGBUnderscore.value, new Date("2020-01-09"))
    ).toBeTruthy();

    let parsedAU = await parseDateWithOptions("9/1/2020", { locale: "en-AU" });
    expect(parsedAU.value.getDate()).toEqual(9);
    expect(isSameDay(parsedAU.value, new Date("2020-01-09"))).toBeTruthy();

    let parsedAUUnderscore = await parseDateWithOptions("9/1/2020", {
      locale: "en_AU"
    });
    expect(parsedAUUnderscore.value.getDate()).toEqual(9);
    expect(
      isSameDay(parsedAUUnderscore.value, new Date("2020-01-09"))
    ).toBeTruthy();

    let parsedNZ = await parseDateWithOptions("9/1/2020", { locale: "en-NZ" });
    expect(parsedNZ.value.getDate()).toEqual(9);
    expect(isSameDay(parsedNZ.value, new Date("2020-01-09"))).toBeTruthy();

    let parsedCA = await parseDateWithOptions("9/1/2020", { locale: "en-CA" });
    expect(parsedCA.value.getDate()).toEqual(9);
    expect(isSameDay(parsedCA.value, new Date("2020-01-09"))).toBeTruthy();

    let parsedIE = await parseDateWithOptions("9/1/2020", { locale: "en-IE" });
    expect(parsedIE.value.getDate()).toEqual(9);
    expect(isSameDay(parsedIE.value, new Date("2020-01-09"))).toBeTruthy();

    let parsedZA = await parseDateWithOptions("9/1/2020", { locale: "en-ZA" });
    expect(parsedZA.value.getDate()).toEqual(9);
    expect(isSameDay(parsedZA.value, new Date("2020-01-09"))).toBeTruthy();

    // Another ambiguous date: 03/04/2022
    let parsedOtherUS = await parseDateWithOptions("03/04/2022", {
      locale: "en-US"
    });
    expect(parsedOtherUS.value.getDate()).toEqual(4);
    expect(isSameDay(parsedOtherUS.value, new Date("2022-03-04"))).toBeTruthy();

    let parsedOtherAU = await parseDateWithOptions("03/04/2022", {
      locale: "en-AU"
    });
    expect(parsedOtherAU.value.getDate()).toEqual(3);
    expect(isSameDay(parsedOtherAU.value, new Date("2022-04-03"))).toBeTruthy();

    let parsedOtherGB = await parseDateWithOptions("03/04/2022", {
      locale: "en-GB"
    });
    expect(parsedOtherGB.value.getDate()).toEqual(3);
    expect(isSameDay(parsedOtherGB.value, new Date("2022-04-03"))).toBeTruthy();
  });

  it("honors regional English date formatting in strict mode", async () => {
    let parsedStrictGB = await parseDateWithOptions("9/1/2020", {
      locale: "en-GB",
      useStrict: true
    });
    expect(parsedStrictGB.value.getDate()).toEqual(9);
    expect(
      isSameDay(parsedStrictGB.value, new Date("2020-01-09"))
    ).toBeTruthy();

    let parsedStrictAU = await parseDateWithOptions("9/1/2020", {
      locale: "en-AU",
      useStrict: true
    });
    expect(parsedStrictAU.value.getDate()).toEqual(9);
    expect(
      isSameDay(parsedStrictAU.value, new Date("2020-01-09"))
    ).toBeTruthy();

    let parsedStrictUS = await parseDateWithOptions("9/1/2020", {
      locale: "en-US",
      useStrict: true
    });
    expect(parsedStrictUS.value.getDate()).toEqual(1);
    expect(
      isSameDay(parsedStrictUS.value, new Date("2020-09-01"))
    ).toBeTruthy();
  });

  it("correctly parses relative dates and ranges in regional English locales", async () => {
    let parsedDate = await parseDateWithOptions("today", { locale: "en-GB" });
    expect(isSameDay(parsedDate.value, new Date("2023-01-11"))).toBeTruthy();

    parsedDate = await parseDateWithOptions("tomorrow", { locale: "en-AU" });
    expect(isSameDay(parsedDate.value, new Date("2023-01-12"))).toBeTruthy();

    parsedDate = await parseDateWithOptions("yesterday", { locale: "en-GB" });
    expect(isSameDay(parsedDate.value, new Date("2023-01-10"))).toBeTruthy();

    parsedDate = await parseDateWithOptions("Twenty second of September", {
      locale: "en-AU"
    });
    expect(isSameDay(parsedDate.value, new Date("2023-09-22"))).toBeTruthy();

    let parsedRange = await parseRangeWithOptions("9/1/2020 - 15/1/2020", {
      locale: "en-GB"
    });
    expect(
      isSameDay(parsedRange.value.start, new Date("2020-01-09"))
    ).toBeTruthy();
    expect(
      isSameDay(parsedRange.value.end, new Date("2020-01-15"))
    ).toBeTruthy();

    parsedRange = await parseRangeWithOptions("9/1/2020 - 15/1/2020", {
      locale: "en-AU"
    });
    expect(
      isSameDay(parsedRange.value.start, new Date("2020-01-09"))
    ).toBeTruthy();
    expect(
      isSameDay(parsedRange.value.end, new Date("2020-01-15"))
    ).toBeTruthy();
  });
});
