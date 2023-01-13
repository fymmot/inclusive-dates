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
import * as chrono from "chrono-node";
import { announce } from "@react-aria/live-announcer";

import { getISODateString } from "../../utils/utils";
import { MonthChangedEventDetails } from "../inclusive-dates-calendar/inclusive-dates-calendar";
import { ChronoOptions } from "./inclusive-dates.type";
export interface InclusiveDatesLabels {
  selected?: string;
  openCalendar?: string;
  calendar?: string;
  errorMessage?: string;
}

const defaultLabels: InclusiveDatesLabels = {
  selected: "selected",
  openCalendar: "Open calendar",
  calendar: "calendar",
  errorMessage: "We could not find a matching date"
};

@Component({
  scoped: true,
  shadow: false,
  styleUrl: "inclusive-dates.css",
  tag: "inclusive-dates"
})
export class InclusiveDates {
  @Element() el: HTMLElement;

  @Prop() locale?: string = navigator?.language || "en-US";
  @Prop() disableDate?: HTMLInclusiveDatesCalendarElement["disableDate"];
  @Prop() elementClassName?: string = "inclusive-dates";
  @Prop() disabled?: boolean = false;
  @Prop() nextMonthButtonContent?: string;
  @Prop() nextYearButtonContent?: string;
  @Prop() showYearStepper?: boolean = false;
  @Prop() showMonthStepper?: boolean = true;
  @Prop() showClearButton?: boolean = true;
  @Prop() showTodayButton?: boolean = true;
  @Prop({ attribute: "input-should-format" }) formatInputOnAccept?: boolean =
    true;
  @Prop() showKeyboardHint?: boolean = true;
  @Prop() useStrictDateParsing?: boolean = false;
  @Prop() labels?: InclusiveDatesLabels = defaultLabels;
  @Prop() startDate?: string = getISODateString(new Date());
  // A unique ID for the datepicker. Mandatory for accessibility
  @Prop({ reflect: true }) id: string;
  @Prop() firstDayOfWeek?: number = 1; // Monday
  @Prop() label?: string = "Choose a date";
  @Prop() placeholder?: string = `Try "tomorrrow" or "in ten days"`;
  @Prop() quickButtons?: string[] = [
    "Yesterday",
    "Today",
    "Tomorrow",
    "In 10 days"
  ];
  @Prop() todayButtonContent?: string;
  @Prop({ mutable: true }) value?: string;
  @Prop({ mutable: true }) hasError?: boolean = false;

  @State() internalValue: string;
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
    if (!this.chronoSupportedLocale && this.quickButtons.length > 0)
      console.warn(
        `inclusive-dates: The chosen locale "${this.locale}" is not supported by Chrono.js. Quick date buttons have been hidden because they will not work.`
      );
  }

  // External method to parse text string using Chrono.js and (optionally) set as value.
  @Method()
  async parseDate(
    text: string,
    shouldSetValue = true,
    chronoOptions: ChronoOptions = undefined
  ) {
    const parsedDate = await this.chronoParseDate(text, chronoOptions);
    if (shouldSetValue) {
      if (parsedDate instanceof Date) {
        this.updateValue(parsedDate);
      } else this.errorState = true;
    }
    return {
      date:
        parsedDate instanceof Date
          ? parsedDate.toISOString().slice(0, 10)
          : undefined
    };
  }

  private chronoParseDate = async (
    dateString: string,
    options?: ChronoOptions
  ): Promise<Date> => {
    // Assign default values if no options object provided
    if (!options) {
      options = {
        referenceDate: new Date(),
        useStrict: false,
        locale: this.locale.slice(0, 2),
        customExpressions: []
      };
    }
    // Destructure options object
    let { referenceDate, useStrict, locale, customExpressions } = options;

    // Assign defaults if not provided
    referenceDate = referenceDate || new Date();
    useStrict = useStrict || false;
    locale = locale || this.locale.slice(0, 2);
    customExpressions = customExpressions || [];

    // Return if Chrono is not supported
    if (!this.chronoSupportedLocale) {
      if (isValidISODate(dateString)) return new Date(dateString);
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

    function isValidISODate(dateString) {
      var isoFormat = /^\d{4}-\d{2}-\d{2}$/;
      if (dateString.match(isoFormat) == null) {
        return false;
      } else {
        var d = new Date(dateString);
        return !isNaN(d.getTime());
      }
    }
    let parsedDate;
    if (useStrict)
      parsedDate = await chrono[locale].strict.parseDate(
        dateString,
        referenceDate,
        {
          forwardDate: true
        }
      );
    else
      parsedDate = await custom.parseDate(dateString, referenceDate, {
        forwardDate: true
      });
    return parsedDate;
  };

  private updateValue(newValue: Date) {
    this.pickerRef.value = newValue;
    this.internalValue = newValue.toISOString().slice(0, 10);
    this.errorState = false;
    this.selectDate.emit(this.internalValue);
    announce(
      `${Intl.DateTimeFormat(this.locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(newValue)} ${this.labels.selected}`,
      "polite"
    );
  }

  private handleCalendarButtonClick = async () => {
    await this.modalRef.setTriggerElement(this.calendarButtonRef);
    if ((await this.modalRef.getState()) === false) await this.modalRef?.open();
    else if ((await this.modalRef.getState()) === true)
      await this.modalRef?.close();
  };

  private handleQuickButtonClick = async (event: MouseEvent) => {
    const parsedDate = await this.chronoParseDate(
      (event.target as HTMLButtonElement).innerText
    );
    if (parsedDate) {
      this.updateValue(parsedDate);
      if (document.activeElement !== this.inputRef) {
        this.formatInput(true, false);
      }
    }
  };

  private handleChangedMonths = (newMonth: MonthChangedEventDetails) => {
    announce(
      `${Intl.DateTimeFormat(this.locale, {
        month: "long",
        year: "numeric"
      }).format(new Date(`${newMonth.year}-${newMonth.month}`))}`,
      "assertive"
    );
  };
  private handleChange = async (event) => {
    if (event.target.value.length === 0) {
      this.internalValue = "";
      this.pickerRef.value = null;
      this.selectDate.emit(this.internalValue);
      return (this.errorState = false);
    }
    const parsedDate = await this.chronoParseDate(event.target.value);
    if (parsedDate instanceof Date) {
      this.updateValue(parsedDate);
      this.formatInput(true, false);
    } else this.errorState = true;
  };

  private formatInput(enabled: boolean, useInputValue = true) {
    if (this.formatInputOnAccept === false || enabled === false) {
      if (this.internalValue) this.inputRef.value = this.internalValue;
      return;
    }
    if (
      this.internalValue &&
      this.formatInputOnAccept === true &&
      this.errorState === false
    ) {
      this.inputRef.value = Intl.DateTimeFormat(this.locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(
        new Date(useInputValue ? this.inputRef.value : this.internalValue)
      );
    } else if (
      this.internalValue &&
      this.internalValue.length > 0 &&
      this.errorState === false
    )
      this.inputRef.value = this.internalValue;
  }

  private handlePickerSelection(newValue: string) {
    this.modalRef.close();
    this.inputRef.value = newValue;
    this.internalValue = newValue;
    this.errorState = false;
    if (document.activeElement !== this.inputRef) {
      this.formatInput(true, false);
    }
    announce(
      `${Intl.DateTimeFormat(this.locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(new Date(newValue))} ${this.labels.selected}!`,
      "polite"
    );
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

  @Watch("value")
  watchValue() {
    if (Boolean(this.value)) {
      this.internalValue = this.value;
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
            {this.labels.errorMessage}
          </div>
        )}
      </Host>
    );
  }
}
