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
import { MonthChangedEventDetails } from "../wc-datepicker/wc-datepicker";
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
  @Prop() disableDate?: HTMLWcDatepickerElement["disableDate"];
  @Prop() disabled?: boolean = false;
  @Prop() nextMonthButtonContent?: string;
  @Prop() nextYearButtonContent?: string;
  @Prop() showYearStepper?: boolean = false;
  @Prop() showMonthStepper?: boolean = true;
  @Prop() showClearButton?: boolean = true;
  @Prop() showTodayButton?: boolean = true;
  @Prop() formatInputOnAccept?: boolean = true;
  @Prop() showKeyboardInstructions?: boolean = true;
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
  private pickerRef?: HTMLWcDatepickerElement;
  private chronoSupportedLocale = ["en", "jp", "fr", "nl", "ru", "pt"].includes(
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

  // External method to parse text string using Chrono.js and set as value.
  @Method()
  async parseDate(text: string, shouldSetValue = true) {
    const parsedDate = await this.chronoParseDate(text);
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

  private updateValue(newValue: Date) {
    this.pickerRef.value = newValue;
    this.internalValue = newValue.toISOString().slice(0, 10);
    this.errorState = false;
    if (document.activeElement !== this.inputRef) {
      this.formatInput(true);
    }
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
    await this.modalRef.setAnchorElement(this.inputRef);
    if ((await this.modalRef.getState()) === false) await this.modalRef?.open();
    else if ((await this.modalRef.getState()) === true)
      await this.modalRef?.close();
  };

  private chronoParseDate = async (
    dateString: string,
    referenceDate = new Date(),
    useStrict = false,
    locale: string = this.locale.slice(0, 2),
    customExpressions: {
      pattern: RegExp;
      match: { month: number; day: number };
    }[] = []
  ): Promise<Date> => {
    const custom = this.chronoSupportedLocale
      ? chrono[locale].casual.clone()
      : chrono.casual.clone();
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
    if (!this.chronoSupportedLocale) {
      if (isValidISODate(dateString)) return new Date(dateString);
      else return null;
    }
    let parsedDate;
    if (useStrict)
      parsedDate = await chrono.strict.parseDate(dateString, referenceDate, {
        forwardDate: true
      });
    else
      parsedDate = await custom.parseDate(dateString, referenceDate, {
        forwardDate: true
      });
    return parsedDate;
  };
  private handleQuickButtonClick = async (event: MouseEvent) => {
    const parsedDate = await this.chronoParseDate(
      (event.target as HTMLButtonElement).innerText
    );
    if (parsedDate) {
      this.updateValue(parsedDate);
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
    if (event.target.value.length === 0) return (this.errorState = false);
    const parsedDate = await this.chronoParseDate(event.target.value);
    if (parsedDate instanceof Date) {
      this.updateValue(parsedDate);
    } else this.errorState = true;
  };

  private formatInput(state: boolean) {
    if (
      state &&
      this.internalValue &&
      this.formatInputOnAccept === true &&
      this.errorState === false
    ) {
      this.inputRef.value = Intl.DateTimeFormat(this.locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(new Date(this.internalValue));
    } else if (
      this.internalValue &&
      this.internalValue.length > 0 &&
      this.errorState === false
    )
      this.inputRef.value = this.internalValue;
  }

  private handlePickerSelection(newValue: string) {
    this.inputRef.value = newValue;
    this.internalValue = newValue;
    this.modalRef.close();
    this.errorState = false;
    if (document.activeElement !== this.inputRef) {
      this.formatInput(true);
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
  watchHasError() {
    this.errorState = this.hasError;
  }

  @Watch("locale")
  watchLocale() {
    console.log(this.locale);
  }

  @Watch("disabled")
  watchDisabled() {
    this.disabledState = this.disabled;
  }

  @Watch("value")
  watchValue() {
    if (Boolean(this.value)) {
      this.internalValue = this.value;
    }
  }

  render() {
    return (
      <Host>
        <label
          htmlFor={this.id ? `${this.id}-input` : undefined}
          class="wc-datepicker__label"
        >
          {this.label}
        </label>
        <br />
        <div class="wc-datepicker__input-container">
          <input
            disabled={this.disabledState}
            id={this.id ? `${this.id}-input` : undefined}
            type="text"
            placeholder={this.placeholder}
            class="wc-datepicker__input"
            ref={(r) => (this.inputRef = r)}
            onChange={this.handleChange}
            onFocus={() => this.formatInput(false)}
            onBlur={() => this.formatInput(true)}
            aria-describedby={this.errorState ? `${this.id}-error` : undefined}
            aria-invalid={this.errorState}
          />
          <button
            ref={(r) => (this.calendarButtonRef = r)}
            onClick={this.handleCalendarButtonClick}
            class="wc-datepicker__calendar-button"
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
          <wc-datepicker
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
            showHiddenTitle={false}
            disabled={this.disabledState}
            showMonthStepper={this.showMonthStepper}
            showYearStepper={this.showYearStepper}
            showClearButton={this.showClearButton}
            showKeyboardInstructions={this.showKeyboardInstructions}
          />
        </inclusive-dates-modal>
        {this.quickButtons?.length > 0 && this.chronoSupportedLocale && (
          <div
            class="wc-datepicker__quick-group"
            role="group"
            aria-label="Quick selection"
          >
            {this.quickButtons.map((buttonText) => {
              return (
                <button
                  class="wc-datepicker__quick-button"
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
            class="wc-datepicker__input-error"
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
