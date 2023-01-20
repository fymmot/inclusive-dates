import { ChronoOptions, ChronoParsedDate } from "./chrono-parser.type";
import * as chrono from "chrono-node";
import {
  dateIsWithinBounds,
  dateIsWithinLowerBounds,
  dateIsWithinUpperBounds,
  isValidISODate,
  removeTimezoneOffset
} from "../utils";

export const chronoParseDate = async (
  dateString: string,
  pickerLocale: string,
  chronoSupportedLocale: boolean,
  minDate: HTMLInclusiveDatesElement["minDate"],
  maxDate: HTMLInclusiveDatesElement["maxDate"],
  options?: ChronoOptions
): Promise<ChronoParsedDate> => {
  // Assign default values if no options object provided
  if (!options) {
    options = {
      referenceDate: new Date(),
      useStrict: false,
      locale: pickerLocale.slice(0, 2),
      customExpressions: []
    };
  }
  // Destructure options object
  let { referenceDate, useStrict, locale, customExpressions } = options;

  // Assign defaults if not provided
  referenceDate = referenceDate || removeTimezoneOffset(new Date());
  useStrict = useStrict || false;
  locale = locale || pickerLocale.slice(0, 2);
  customExpressions = customExpressions || [];

  // Return if Chrono is not supported
  if (!chronoSupportedLocale) {
    if (isValidISODate(dateString))
      return { value: removeTimezoneOffset(new Date(dateString)) };
    else return null;
  }
  const custom = chrono[locale].casual.clone();
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
