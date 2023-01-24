import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Method,
  Prop,
  State,
  Watch
} from "@stencil/core";
import { announce } from "@react-aria/live-announcer";

import { getISODateString, removeTimezoneOffset } from "../../utils/utils";
import { MonthChangedEventDetails } from "../inclusive-dates-calendar/inclusive-dates-calendar";
import {
  ChronoOptions,
  ChronoParsedDateString
} from "../../utils/chrono-parser/chrono-parser.type";
import {
  chronoParseDate,
  chronoParseRange
} from "../../utils/chrono-parser/chrono-parser";

export interface InclusiveDatesLabels {
  selected?: string;
  openCalendar?: string;
  calendar?: string;
  errorMessage?: string;
  invalidDateError?: string;
  maxDateError?: string;
  minDateError?: string;
  rangeOutOfBoundsError?: string;
  to?: string;
  startDate?: string;
}

const defaultLabels: InclusiveDatesLabels = {
  selected: "selected",
  openCalendar: "Open calendar",
  calendar: "calendar",
  invalidDateError: "We could not find a matching date",
  minDateError: `Please fill in a date after `,
  maxDateError: `Please fill in a date before `,
  rangeOutOfBoundsError: `Please enter a valid range of dates`,
  to: "to",
  startDate: "Start date"
};

@Component({
  scoped: true,
  shadow: false,
  styleUrl: "inclusive-dates.css",
  tag: "inclusive-dates"
})
export class InclusiveDates {
  @Element() el: HTMLElement;
  // A unique ID for the datepicker. Mandatory for accessibility
  @Prop({ reflect: true }) id: string;
  // Current value of the datepicker
  @Prop({ mutable: true }) value?: string | string[];
  // Enable or disable range mode
  @Prop() range?: boolean = false;
  // A label for the text field
  @Prop() label: string = this.range
    ? "Choose a date range (any way you like)"
    : "Choose a date (any way you like)";
  // A placeholder for the text field
  @Prop() placeholder?: string = this.range
    ? `Try "June 8 to 12"`
    : `Try "tomorrrow" or "in ten days"`;
  // Locale used for internal translations and date parsing
  @Prop() locale?: string = navigator?.language || "en-US";
  // If the datepicker is disabled
  @Prop() disabled?: boolean = false;
  // Earliest accepted date (YYYY-MM-DD)
  @Prop() minDate?: string;
  // Latest accepted date (YYYY-MM-DD)
  @Prop() maxDate?: string;
  // Which date to be displayed when calendar is first opened
  @Prop() startDate?: string = getISODateString(new Date());
  // Reference date used for Chrono date parsing. Equals "today"
  @Prop() referenceDate?: string = getISODateString(new Date());
  // Enable or disable strict Chrono date parsing
  @Prop() useStrictDateParsing?: boolean = false;
  // Labels used for internal translations
  @Prop() labels?: InclusiveDatesLabels = defaultLabels;
  // Current error state of the input field
  @Prop({ mutable: true }) hasError?: boolean = false;
  // Text label for next month button
  @Prop() nextMonthButtonContent?: string;
  // Text label for next year button
  @Prop() nextYearButtonContent?: string;
  // Show or hide the next/previous year buttons
  @Prop() showYearStepper?: boolean = false;
  // Show or hide the next/previous month buttons
  @Prop() showMonthStepper?: boolean = true;
  // Show or hide the clear button
  @Prop() showClearButton?: boolean = true;
  // Show or hide the today button
  @Prop() showTodayButton?: boolean = true;
  // Enable or disable input field formatting for accepted dates (eg. "Tuesday May 2, 2021" instead of "2021-05-02")
  @Prop({ attribute: "input-should-format" }) formatInputOnAccept?: boolean =
    true;
  // Show or hide the keyboard hints
  @Prop() showKeyboardHint?: boolean = true;
  // Function to disable individual dates
  @Prop() disableDate?: HTMLInclusiveDatesCalendarElement["disableDate"];
  // Component name used to generate CSS classes
  @Prop() elementClassName?: string = "inclusive-dates";
  // Which day that should start the week (0 is sunday, 1 is monday)
  @Prop() firstDayOfWeek?: number = 1; // Monday
  // Quick buttons with dates displayed under the text field
  @Prop() quickButtons?: string[] = this.range
    ? ["Monday to Wednesday", "July 5 to 10"]
    : ["Yesterday", "Today", "Tomorrow", "In 10 days"];
  // Text content for the today button in the calendar
  @Prop() todayButtonContent?: string;

  @State() internalValue: string | string[];
  @State() errorState: boolean = this.hasError;
  @State() disabledState: boolean = this.disabled;

  @Event() selectDate: EventEmitter<string | string[] | undefined>;

  private modalRef?: HTMLInclusiveDatesModalElement;
  private inputRef?: HTMLInputElement;
  private calendarButtonRef?: HTMLButtonElement;
  private pickerRef?: HTMLInclusiveDatesCalendarElement;
  private chronoSupportedLocale = ["en", "ja", "fr", "nl", "ru", "pt"].includes(
    this.locale.slice(0, 2)
  );
  private errorMessage = "";

  componentDidLoad() {
    if (!this.id) {
      console.error(
        'inclusive-dates: The "id" prop is required for accessibility'
      );
    }
    if (!this.chronoSupportedLocale)
      console.warn(
        `inclusive-dates: The chosen locale "${this.locale}" is not supported by Chrono.js. Date parsing has been disabled`
      );
  }

  // External method to parse text string using Chrono.js and (optionally) set as value.
  @Method()
  async parseDate(
    text: string,
    shouldSetValue = true,
    chronoOptions: ChronoOptions = undefined
  ): Promise<ChronoParsedDateString> {
    const parsedDate = await chronoParseDate(text, {
      locale: this.locale.slice(0, 2),
      minDate: this.minDate,
      maxDate: this.minDate,
      referenceDate: removeTimezoneOffset(new Date(this.referenceDate)),
      ...chronoOptions
    });
    if (shouldSetValue) {
      if (parsedDate && parsedDate.value instanceof Date) {
        this.updateValue(parsedDate.value);
      } else this.errorState = true;
    }
    return {
      value:
        parsedDate && parsedDate.value instanceof Date
          ? getISODateString(parsedDate.value)
          : undefined,
      reason: parsedDate && parsedDate.reason ? parsedDate.reason : undefined
    };
  }

  // @ts-ignore
  private isRangeValue(value: string | string[]): value is Date[] {
    if (
      Array.isArray(value) &&
      new Date(value[0]) instanceof Date &&
      new Date(value[1]) instanceof Date
    )
      return this.range;
  }

  private updateValue(newValue: Date | Date[]) {
    // Range
    if (Array.isArray(newValue)) {
      this.internalValue = newValue.map((date) => getISODateString(date));
    }
    // Single
    else {
      this.internalValue = getISODateString(newValue);
    }
    this.pickerRef.value = newValue;
    this.errorState = false;
    this.selectDate.emit(this.internalValue);
    this.announceDateChange(this.internalValue);
  }

  private handleCalendarButtonClick = async () => {
    await customElements.whenDefined("inclusive-dates-modal");
    await this.modalRef.setTriggerElement(this.calendarButtonRef);
    if ((await this.modalRef.getState()) === false) await this.modalRef?.open();
    else if ((await this.modalRef.getState()) === true)
      await this.modalRef?.close();
  };

  private handleQuickButtonClick = async (event: MouseEvent) => {
    const parser = this.range ? chronoParseRange : chronoParseDate;
    const parsedDate = await parser(
      (event.target as HTMLButtonElement).innerText,
      {
        locale: this.locale.slice(0, 2),
        minDate: this.minDate,
        maxDate: this.maxDate,
        referenceDate: removeTimezoneOffset(new Date(this.referenceDate))
      }
    );
    if (parsedDate) {
      // Single date
      if (parsedDate.value instanceof Date) {
        this.updateValue(parsedDate.value);
        if (document.activeElement !== this.inputRef) {
          this.formatInput(true, false);
        }
      } else {
        // Date range
        const newValue = [];
        if (parsedDate.value.start instanceof Date) {
          newValue.push(parsedDate.value.start);
        }
        if (parsedDate.value && parsedDate.value.end instanceof Date)
          newValue.push(parsedDate.value.end);
        this.updateValue(newValue);
        this.formatInput(true, false);
      }
    }
  };

  private handleChangedMonths = (newMonth: MonthChangedEventDetails) => {
    announce(
      `${Intl.DateTimeFormat(this.locale, {
        month: "long",
        year: "numeric"
      }).format(
        removeTimezoneOffset(new Date(`${newMonth.year}-${newMonth.month}`))
      )}`,
      "assertive"
    );
  };
  private handleChange = async (event) => {
    if (this.range) {
      this.errorState = false;
      if (event.target.value.length === 0) {
        this.internalValue = "";
        this.pickerRef.value = null;
        return this.selectDate.emit(this.internalValue);
      }
      const parsedRange = await chronoParseRange(event.target.value, {
        locale: this.locale.slice(0, 2),
        minDate: this.minDate,
        maxDate: this.maxDate,
        referenceDate: removeTimezoneOffset(new Date(this.referenceDate))
      });
      const newValue = [];
      if (parsedRange.value && parsedRange.value.start instanceof Date)
        newValue.push(parsedRange.value.start);
      if (parsedRange.value && parsedRange.value.end instanceof Date)
        newValue.push(parsedRange.value.end);
      this.updateValue(newValue);
      this.formatInput(true, false);

      if (newValue.length === 0) {
        this.errorState = true;
        this.errorMessage = {
          invalid: this.labels.invalidDateError,
          rangeOutOfBounds: this.labels.rangeOutOfBoundsError
        }[parsedRange.reason];
      }
    } else {
      this.errorState = false;
      if (event.target.value.length === 0) {
        this.internalValue = "";
        this.pickerRef.value = null;
        return this.selectDate.emit(this.internalValue);
      }
      const parsedDate = await chronoParseDate(event.target.value, {
        locale: this.locale.slice(0, 2),
        minDate: this.minDate,
        maxDate: this.maxDate,
        referenceDate: removeTimezoneOffset(new Date(this.referenceDate))
      });
      if (parsedDate && parsedDate.value instanceof Date) {
        this.updateValue(parsedDate.value);
        this.formatInput(true, false);
      } else if (parsedDate) {
        this.errorState = true;
        this.internalValue = null;
        let maxDate = undefined;
        let minDate = undefined;
        if (this.maxDate) {
          maxDate = this.maxDate
            ? removeTimezoneOffset(new Date(this.maxDate))
            : undefined;
          maxDate.setDate(maxDate.getDate() + 1);
        }
        if (this.minDate) {
          minDate = this.minDate
            ? removeTimezoneOffset(new Date(this.minDate))
            : undefined;
          minDate.setDate(minDate.getDate() - 1);
        }
        this.errorMessage = parsedDate.reason;
        this.errorMessage = {
          // TODO: Add locale date formatting to these messages
          minDate: minDate
            ? `${this.labels.minDateError} ${getISODateString(minDate)}`
            : "",
          maxDate: maxDate
            ? `${this.labels.maxDateError} ${getISODateString(maxDate)}`
            : "",
          invalid: this.labels.invalidDateError
        }[parsedDate.reason];
      }
    }
  };

  private formatInput(enabled: boolean, useInputValue = true) {
    if (this.formatInputOnAccept === false || enabled === false) {
      if (this.internalValue) {
        if (this.internalValue.length === 0) return;
        this.inputRef.value = this.internalValue
          .toString()
          .replace(",", ` ${this.labels.to} `);
      }
      return;
    }
    if (
      this.internalValue &&
      this.formatInputOnAccept === true &&
      this.errorState === false
    ) {
      if (Array.isArray(this.internalValue)) {
        if (this.internalValue.length === 0) return; // Range date is invalid, leave the text field as is
        let output = "";
        this.internalValue.forEach((value, index) => {
          return (output += `${
            index === 1 ? ` ${this.labels.to} ` : ""
          }${Intl.DateTimeFormat(this.locale, {
            day: "numeric",
            month: "short",
            year: "numeric"
          }).format(
            removeTimezoneOffset(
              new Date(useInputValue ? this.inputRef.value : value)
            )
          )}`);
        });
        this.inputRef.value = output;
      } else {
        this.inputRef.value = Intl.DateTimeFormat(this.locale, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
        }).format(
          removeTimezoneOffset(
            new Date(useInputValue ? this.inputRef.value : this.internalValue)
          )
        );
      }
    } else if (
      this.internalValue &&
      this.internalValue.length > 0 &&
      this.errorState === false
    )
      this.inputRef.value = this.internalValue.toString();
  }

  private handlePickerSelection(newValue: string | string[]) {
    if (this.isRangeValue(newValue)) {
      if (newValue.length === 2) this.modalRef.close();
      this.internalValue = newValue;
      this.errorState = false;
      if (document.activeElement !== this.inputRef) {
        this.formatInput(true, false);
      }
      this.announceDateChange(this.internalValue);
    } else {
      this.modalRef.close();
      this.inputRef.value = newValue as string;
      this.internalValue = newValue as string;
      this.errorState = false;
      if (document.activeElement !== this.inputRef) {
        this.formatInput(true, false);
      }
      this.announceDateChange(this.internalValue);
    }
  }

  private announceDateChange(newValue: string | string[]) {
    let content = "";
    if (Array.isArray(newValue)) {
      if (newValue.length === 1) {
        content += `${this.labels.startDate} `;
      }
      newValue.forEach(
        (value, index) =>
          (content += `${
            index === 1 ? ` ${this.labels.to} ` : ""
          }${Intl.DateTimeFormat(this.locale, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
          }).format(removeTimezoneOffset(new Date(value)))}`)
      );
    } else
      content = Intl.DateTimeFormat(this.locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(removeTimezoneOffset(new Date(newValue)));
    if (content.length === 0) return;
    content += ` ${this.labels.selected}`;
    const contentNoCommas = content.replace(/\,/g, "");
    announce(contentNoCommas, "polite");
  }

  @Watch("hasError")
  watchHasError(newValue) {
    this.hasError = newValue;
  }
  @Watch("locale")
  watchLocale(newValue) {
    this.locale = newValue;
  }

  @Watch("label")
  watchLabel(newValue) {
    this.label = newValue;
  }

  @Watch("disabled")
  watchDisabled(newValue) {
    this.disabledState = newValue;
    this.disabled = newValue;
  }
  @Watch("range")
  watchRange(newValue) {
    this.range = newValue;
  }

  @Watch("minDate")
  watchMinDate(newValue) {
    this.minDate = newValue;
  }

  @Watch("maxDate")
  watchMaxDate(newValue) {
    this.maxDate = newValue;
  }

  @Watch("value")
  watchValue() {
    if (Boolean(this.value) && !this.isRangeValue(this.value)) {
      this.internalValue = this.value as string;
    }
  }

  private getClassName(element?: string) {
    return Boolean(element)
      ? `${this.elementClassName}__${element}`
      : this.elementClassName;
  }

  render() {
    return (
      <Host>
        <label
          htmlFor={this.id ? `${this.id}-input` : undefined}
          class={this.getClassName("label")}
        >
          {this.label}
        </label>
        <br />
        <div class={this.getClassName("input-container")}>
          <input
            disabled={this.disabledState}
            id={this.id ? `${this.id}-input` : undefined}
            type="text"
            placeholder={this.placeholder}
            class={this.getClassName("input")}
            ref={(r) => (this.inputRef = r)}
            onChange={this.handleChange}
            onFocus={() => this.formatInput(false)}
            onBlur={() => this.formatInput(true, false)}
            aria-describedby={this.errorState ? `${this.id}-error` : undefined}
            aria-invalid={this.errorState}
          />
          <button
            ref={(r) => (this.calendarButtonRef = r)}
            onClick={this.handleCalendarButtonClick}
            class={this.getClassName("calendar-button")}
            disabled={this.disabledState}
          >
            {this.labels.openCalendar}
          </button>
        </div>
        <inclusive-dates-modal
          label={this.labels.calendar}
          ref={(el) => (this.modalRef = el)}
          onOpened={() => {
            this.pickerRef.modalIsOpen = true;
          }}
          onClosed={() => {
            this.pickerRef.modalIsOpen = false;
          }}
        >
          <inclusive-dates-calendar
            range={this.range}
            locale={this.locale}
            onSelectDate={(event) =>
              this.handlePickerSelection(event.detail as string)
            }
            onChangeMonth={(event) =>
              this.handleChangedMonths(event.detail as MonthChangedEventDetails)
            }
            ref={(el) => (this.pickerRef = el)}
            startDate={this.startDate}
            firstDayOfWeek={this.firstDayOfWeek}
            showHiddenTitle={true}
            disabled={this.disabledState}
            showMonthStepper={this.showMonthStepper}
            showYearStepper={this.showYearStepper}
            showClearButton={this.showClearButton}
            showKeyboardHint={this.showKeyboardHint}
            minDate={this.minDate}
            maxDate={this.maxDate}
          />
        </inclusive-dates-modal>
        {this.quickButtons?.length > 0 && this.chronoSupportedLocale && (
          <div
            class={this.getClassName("quick-group")}
            role="group"
            aria-label="Quick selection"
          >
            {this.quickButtons.map((buttonText) => {
              return (
                <button
                  class={this.getClassName("quick-button")}
                  onClick={this.handleQuickButtonClick}
                  disabled={this.disabledState}
                >
                  {buttonText}
                </button>
              );
            })}
          </div>
        )}

        {this.errorState && (
          <div
            class={this.getClassName("input-error")}
            id={this.id ? `${this.id}-error` : undefined}
            role="status"
          >
            {this.errorMessage}
          </div>
        )}
      </Host>
    );
  }
}
