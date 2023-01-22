import {
  ChronoOptions,
  ChronoParsedDate,
  ChronoParsedRange,
  supportedChronoLocales
} from "./chrono-parser.type";
import * as chrono from "chrono-node";
import {
  dateIsWithinBounds,
  dateIsWithinLowerBounds,
  dateIsWithinUpperBounds,
  isValidISODate,
  removeTimezoneOffset
} from "../utils";
import { ParsedResult } from "chrono-node";

const supportedChronoLocales = ["en", "fr", "ru", "pt", "ja", "nl"];

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

  const chronoSupportedLocale = supportedChronoLocales.includes(locale);

  // Return if Chrono is not supported
  if (!chronoSupportedLocale) {
    if (isValidISODate(dateString))
      return { value: removeTimezoneOffset(new Date(dateString)) };
    else return null;
  }
  const custom = chrono[locale as supportedChronoLocales].casual.clone();
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
    parsedDate = await chrono[locale].strict.parseDate(
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

  const chronoSupportedLocale = supportedChronoLocales.includes(locale);

  // Return if Chrono is not supported
  if (!chronoSupportedLocale) {
    if (isValidISODate(dateString))
      return {
        value: {
          start: removeTimezoneOffset(new Date(dateString)),
          end: undefined
        }
      };
    else return null;
  }
  const custom = chrono[locale as supportedChronoLocales].casual.clone();
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
    parsedRange = await chrono[locale].strict.parse(
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

  if (
    parsedRange[0].start &&
    parsedRange[0].start.date() instanceof Date &&
    parsedRange[0].end &&
    parsedRange[0].end.date() instanceof Date
  ) {
    const startDate = parsedRange[0].start.date();
    const endDate = parsedRange[0].end.date();
    if (
      dateIsWithinBounds(startDate, minDate, maxDate) &&
      dateIsWithinBounds(endDate, minDate, maxDate)
    )
      return { value: { start: startDate, end: endDate } };
    else return { value: null, reason: "rangeOutOfBounds" };
  } else return { value: null, reason: "invalid" };
};
