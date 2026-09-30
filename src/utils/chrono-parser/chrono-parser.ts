import {
  ChronoOptions,
  ChronoParsedDate,
  ChronoParsedRange
} from "./chrono-parser.type";
import * as chrono from "chrono-node";
import {
  dateIsWithinBounds,
  dateIsWithinLowerBounds,
  dateIsWithinUpperBounds,
  extractDates,
  isValidISODate,
  removeTimezoneOffset
} from "../utils";
import { ParsedResult } from "chrono-node";

export interface ChronoParserInstance {
  casual: chrono.Chrono;
  strict: chrono.Chrono;
}

// Regional English configuration:
// Chrono provides little-endian parsing via chrono.en.GB.
// For casual parsing, we build a Chrono instance with createCasualConfiguration(true)
// which uses the exact same little-endian date parser as chrono.en.GB alongside
// casual relative date parsers (e.g. "today", "tomorrow").
// For strict parsing, we build a Chrono instance with createConfiguration(true, true).
const gbCasual =
  typeof chrono.en?.createCasualConfiguration === "function"
    ? new chrono.Chrono(chrono.en.createCasualConfiguration(true))
    : chrono.en.GB;

const gbStrict =
  typeof chrono.en?.createConfiguration === "function"
    ? new chrono.Chrono(chrono.en.createConfiguration(true, true))
    : chrono.en.GB;

export const isRegionalEnglishLocale = (locale: string): boolean => {
  if (!locale) return false;
  const normalized = locale.toLowerCase().replace(/_/g, "-");
  if (!normalized.startsWith("en-")) return false;
  // US and territories use middle-endian (MM/DD/YYYY)
  const usLocales = [
    "en-us",
    "en-pr",
    "en-vi",
    "en-gu",
    "en-as",
    "en-mp",
    "en-um"
  ];
  return !usLocales.includes(normalized);
};

export const isChronoSupportedLocale = (locale?: string): boolean => {
  if (!locale) return false;
  const normalized = locale.toLowerCase().replace(/_/g, "-");
  const lang = normalized.split("-")[0];
  return ["en", "fr", "ru", "pt", "ja", "nl", "de", "es", "zh"].includes(lang);
};

export const getChronoParser = (
  locale?: string
): ChronoParserInstance | null => {
  if (!locale) {
    return {
      casual: chrono.en.casual,
      strict: chrono.en.strict
    };
  }

  if (isRegionalEnglishLocale(locale)) {
    return {
      casual: gbCasual,
      strict: gbStrict
    };
  }

  const normalized = locale.toLowerCase().replace(/_/g, "-");
  const lang = normalized.split("-")[0];

  if (lang in chrono && (chrono as any)[lang]?.casual) {
    return {
      casual: (chrono as any)[lang].casual,
      strict: (chrono as any)[lang].strict
    };
  }

  return null;
};

export const chronoParseDate = async (
  dateString: string,
  options?: ChronoOptions
): Promise<ChronoParsedDate> => {
  // Assign default values if no options object provided
  if (!options) {
    options = {
      referenceDate: removeTimezoneOffset(new Date()),
      useStrict: false,
      locale: "en",
      customExpressions: [],
      minDate: undefined,
      maxDate: undefined
    };
  }

  // Destructure options object
  let {
    referenceDate = removeTimezoneOffset(new Date()),
    useStrict = false,
    locale = "en",
    customExpressions = [],
    minDate = undefined,
    maxDate = undefined
  } = options;

  const parser = getChronoParser(locale);

  // Return if Chrono is not supported
  if (!parser) {
    if (isValidISODate(dateString))
      return { value: removeTimezoneOffset(new Date(dateString)) };
    else return null;
  }
  const custom = parser.casual.clone();
  customExpressions.forEach((expression) =>
    custom.parsers.push({
      pattern: () => expression.pattern,
      extract: () => {
        return expression.match;
      }
    })
  );

  let parsedDate;
  if (useStrict)
    parsedDate = await parser.strict.parseDate(
      dateString,
      {
        instant: referenceDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      {
        forwardDate: true
      }
    );
  else {
    parsedDate = await custom.parseDate(
      dateString,
      {
        instant: referenceDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      {
        forwardDate: true
      }
    );
  }

  if (parsedDate instanceof Date) {
    if (dateIsWithinBounds(parsedDate, minDate, maxDate))
      return { value: parsedDate };
    else if (
      parsedDate instanceof Date &&
      !dateIsWithinLowerBounds(parsedDate, minDate)
    ) {
      return { value: null, reason: "minDate" };
    } else if (
      parsedDate instanceof Date &&
      !dateIsWithinUpperBounds(parsedDate, maxDate)
    ) {
      return { value: null, reason: "maxDate" };
    }
  } else return { value: null, reason: "invalid" };
};

export const chronoParseRange = async (
  dateString: string,
  options?: ChronoOptions
): Promise<ChronoParsedRange> => {
  // Assign default values if no options object provided
  if (!options) {
    options = {
      referenceDate: removeTimezoneOffset(new Date()),
      useStrict: false,
      locale: "en",
      customExpressions: [],
      minDate: undefined,
      maxDate: undefined
    };
  }

  // Destructure options object
  let {
    referenceDate = removeTimezoneOffset(new Date()),
    useStrict = false,
    locale = "en",
    customExpressions = [],
    minDate = undefined,
    maxDate = undefined
  } = options;

  const parser = getChronoParser(locale);

  // Return if Chrono is not supported
  if (!parser) {
    const possibleDates = extractDates(dateString);
    possibleDates.filter((dateString) => isValidISODate(dateString));
    if (possibleDates.length > 0)
      return {
        value: {
          start: removeTimezoneOffset(new Date(possibleDates[0])),
          end: possibleDates[1]
            ? removeTimezoneOffset(new Date(possibleDates[1]))
            : undefined
        }
      };
    else return null;
  }
  const custom = parser.casual.clone();
  customExpressions.forEach((expression) =>
    custom.parsers.push({
      pattern: () => expression.pattern,
      extract: () => {
        return expression.match;
      }
    })
  );

  let parsedRange: ParsedResult[];
  if (useStrict)
    parsedRange = await parser.strict.parse(
      dateString,
      {
        instant: referenceDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      {
        forwardDate: true
      }
    );
  else {
    parsedRange = custom.parse(
      dateString,
      {
        instant: referenceDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      {
        forwardDate: true
      }
    );
  }
  let startDate: Date;
  let endDate: Date;

  if (
    parsedRange.length > 0 &&
    parsedRange[0].start &&
    parsedRange[0].start.date() instanceof Date
  )
    startDate = parsedRange[0].start.date();
  if (
    parsedRange.length > 0 &&
    parsedRange[0].end &&
    parsedRange[0].end.date() instanceof Date
  )
    endDate = parsedRange[0].end.date();

  const returnValue = { value: { start: null, end: null } };

  if (startDate instanceof Date || endDate instanceof Date) {
    if (startDate && dateIsWithinBounds(startDate, minDate, maxDate))
      returnValue.value.start = startDate;
    if (endDate && dateIsWithinBounds(endDate, minDate, maxDate))
      returnValue.value.end = endDate;
    if (returnValue.value.start !== null || returnValue.value.end !== null)
      return returnValue;
    else return { value: null, reason: "rangeOutOfBounds" };
  } else return { value: null, reason: "invalid" };
};
