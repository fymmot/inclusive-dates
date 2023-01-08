import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Prop,
  State,
  Watch
} from "@stencil/core";
import * as chrono from "chrono-node";
import { announce } from "@react-aria/live-announcer";

import { getISODateString } from "../../utils/utils";

@Component({
  scoped: true,
  shadow: false,
  styleUrl: "inclusive-dates.css",
  tag: "inclusive-dates"
})
export class InclusiveDates {
  @Element() el: HTMLElement;

  @Prop() locale?: string = navigator?.language || "en-US";
  @Prop() disabled?: boolean = false;
  @Prop() nextMonthButtonContent?: string;
  @Prop() nextYearButtonContent?: string;
  @Prop() startDate?: string = getISODateString(new Date());
  @Prop() pickerid!: string;
  @Prop() firstDayOfWeek?: number = 1; // Monday
  @Prop() label?: string = "Choose a date (any way you like)";
  @Prop() placeholder?: string = `Try "tomorrrow" or "in ten days"`;
  @Prop() todayButtonContent?: string;
  @Prop({ mutable: true }) value?: string;
  @Prop({ mutable: true }) hasError?: boolean = false;

  @State() currentDate: Date;
  @State() internalValue: string;
  @State() errorState: boolean;

  @Event() selectDate: EventEmitter<string | string[] | undefined>;

  private modalRef?: HTMLInclusiveDatesModalElement;
  private inputRef?: HTMLInputElement;
  private calendarButtonRef?: HTMLButtonElement;
  private pickerRef?: HTMLWcDatepickerElement;
  private quickButtons?: string[] = [
    "Yesterday",
    "Today",
    "Tomorrow",
    "In 10 days"
  ];
  // private calendarRef?: HTMLWcDatepickerElement

  clickHandler = async () => {
    await this.modalRef.setTriggerElement(this.calendarButtonRef);
    await this.modalRef.setAnchorElement(this.inputRef);
    if ((await this.modalRef.getState()) === false) await this.modalRef?.open();
    else if ((await this.modalRef.getState()) === true)
      await this.modalRef?.close();
  };
  handleQuickButtonClick = async (event: MouseEvent) => {
    const parsedDate = await chrono.parseDate(
      (event.target as HTMLButtonElement).innerText,
      new Date(),
      {
        forwardDate: true
      }
    );
    if (parsedDate) {
      this.pickerRef.value = parsedDate;
      this.internalValue = parsedDate.toISOString().slice(0, 10);
      this.errorState = false;
      this.inputRef.value = this.internalValue;
      announce(
        `${Intl.DateTimeFormat(this.locale, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
        }).format(parsedDate)} selected!`,
        "polite"
      );
    }
  };
  handleChange = async (event) => {
    if (event.target.value.length === 0) return (this.errorState = false);
    const parsedDate = chrono.parseDate(event.target.value, new Date(), {
      forwardDate: true
    });
    if (parsedDate instanceof Date && event.target.value.length > 0) {
      this.internalValue = parsedDate.toISOString().slice(0, 10);
      event.target.value = parsedDate.toISOString().slice(0, 10);
      this.pickerRef.value = parsedDate;
      this.errorState = false;
      announce(
        `${Intl.DateTimeFormat(this.locale, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
        }).format(parsedDate)} selected!`,
        "polite"
      );
    } else this.errorState = true;
  };
  @Watch("hasError")
  watchHasError() {
    this.errorState = this.hasError;
  }

  @Watch("locale")
  watchLocale() {}

  @Watch("value")
  watchValue() {
    if (Boolean(this.value)) {
      this.currentDate = new Date(this.value);
      this.internalValue = this.value;
    }
  }

  private handlePickerSelection(newValue: string) {
    this.inputRef.value = newValue;
    this.internalValue = newValue;
    this.modalRef.close();
    this.errorState = false;
    announce(
      `${Intl.DateTimeFormat(this.locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(new Date(newValue))} selected!`,
      "polite"
    );
  }

  render() {
    return (
      <Host>
        <label htmlFor={`${this.pickerid}-input`} class="wc-datepicker__label">
          {this.label}
        </label>
        <br />
        <div class="wc-datepicker__input-container">
          <input
            disabled={this.disabled}
            id={`${this.pickerid}-input`}
            type="text"
            placeholder={this.placeholder}
            class="wc-datepicker__input"
            ref={(r) => (this.inputRef = r)}
            onChange={this.handleChange}
            aria-describedby={
              this.errorState ? `${this.pickerid}-error` : undefined
            }
            aria-invalid={this.errorState}
          />
          <button
            ref={(r) => (this.calendarButtonRef = r)}
            onClick={this.clickHandler}
            class="wc-datepicker__calendar-button"
            disabled={this.disabled}
          >
            Open calendar
          </button>
        </div>
        <inclusive-dates-modal
          label="Calendar"
          hideLabel={true}
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
            ref={(el) => (this.pickerRef = el)}
            startDate={this.startDate}
            firstDayOfWeek={this.firstDayOfWeek}
            showHiddenTitle={false}
            disabled={this.disabled}
          />
        </inclusive-dates-modal>
        {this.quickButtons?.length > 0 && (
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
            id={`${this.pickerid}-error`}
            role="status"
          >
            We could not find a matching date
          </div>
        )}
      </Host>
    );
  }
}
