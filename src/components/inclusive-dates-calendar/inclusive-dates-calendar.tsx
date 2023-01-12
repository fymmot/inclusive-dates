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
import {
  addDays,
  getDaysOfMonth,
  getFirstOfMonth,
  getISODateString,
  getLastOfMonth,
  getMonth,
  getMonths,
  getNextDay,
  getNextMonth,
  getNextYear,
  getPreviousDay,
  getPreviousMonth,
  getPreviousYear,
  getWeekDays,
  getYear,
  isDateInRange,
  isSameDay,
  subDays
} from "../../utils/utils";

export type InclusiveDatesCalendarLabels = {
  clearButton: string;
  monthSelect: string;
  nextMonthButton: string;
  nextYearButton: string;
  picker: string;
  previousMonthButton: string;
  previousYearButton: string;
  todayButton: string;
  yearSelect: string;
  keyboardHint: string;
  selected: string;
};

const defaultLabels: InclusiveDatesCalendarLabels = {
  clearButton: "Clear value",
  monthSelect: "Select month",
  nextMonthButton: "Next month",
  nextYearButton: "Next year",
  picker: "Choose date",
  previousMonthButton: "Previous month",
  previousYearButton: "Previous year",
  todayButton: "Show today",
  yearSelect: "Select year",
  keyboardHint: "Keyboard commands",
  selected: "Selected date"
};

export interface MonthChangedEventDetails {
  month: number;
  year: number;
}

@Component({
  scoped: true,
  shadow: false,
  styleUrl: "inclusive-dates-calendar.css",
  tag: "inclusive-dates-calendar"
})
export class InclusiveDatesCalendar {
  @Element() el: HTMLElement;

  @Prop() clearButtonContent?: string;
  @Prop() disabled?: boolean = false;
  @Prop() modalIsOpen?: boolean = false;

  @Prop() disableDate?: (date: Date) => boolean = () => false;
  @Prop() elementClassName?: string = "inclusive-dates-calendar";
  @Prop() firstDayOfWeek?: number = 0;
  @Prop() range?: boolean = false;
  @Prop() labels?: InclusiveDatesCalendarLabels = defaultLabels;
  @Prop() locale?: string = navigator?.language || "en-US";
  @Prop() nextMonthButtonContent?: string;
  @Prop() nextYearButtonContent?: string;
  @Prop() previousMonthButtonContent?: string;
  @Prop() previousYearButtonContent?: string;
  @Prop() showClearButton?: boolean = false;
  @Prop() showMonthStepper?: boolean = true;
  @Prop() showTodayButton?: boolean = true;
  @Prop() showYearStepper?: boolean = false;
  @Prop() showKeyboardHint?: boolean = false;
  @Prop() showHiddenTitle?: boolean = true;
  @Prop() startDate?: string = getISODateString(new Date());
  @Prop() todayButtonContent?: string;
  @Prop({ mutable: true }) value?: Date | Date[];

  @State() currentDate: Date;
  @State() hoveredDate: Date;
  @State() weekdays: string[][];

  @Event() selectDate: EventEmitter<string | string[] | undefined>;
  @Event() changeMonth: EventEmitter<MonthChangedEventDetails>;

  private moveFocusAfterMonthChanged: Boolean;
  private moveFocusOnModalOpen: Boolean;

  componentWillLoad() {
    this.init();
  }

  @Watch("modalIsOpen")
  watchModalIsOpen() {
    if (this.modalIsOpen === true) {
      this.moveFocusOnModalOpen = true;
    }
  }
  @Watch("firstDayOfWeek")
  watchFirstDayOfWeek() {
    this.updateWeekdays();
  }

  @Watch("locale")
  watchLocale() {
    if (!Boolean(this.locale)) {
      this.locale = navigator?.language || "en-US";
    }
    this.updateWeekdays();
  }

  @Watch("range")
  watchRange() {
    this.value = undefined;
    this.selectDate.emit(undefined);
  }

  @Watch("startDate")
  watchStartDate() {
    this.currentDate = this.startDate ? new Date(this.startDate) : new Date();
  }

  @Watch("value")
  watchValue() {
    if (Boolean(this.value)) {
      if (Array.isArray(this.value) && this.value.length >= 1) {
        this.currentDate = this.value[0];
      } else if (this.value instanceof Date) {
        this.currentDate = this.value;
      }
    }
  }

  componentDidRender() {
    if (this.moveFocusAfterMonthChanged) {
      this.focusDate(this.currentDate);
      this.moveFocusAfterMonthChanged = false;
    }
    if (this.moveFocusOnModalOpen) {
      // Timeout added to stop VoiceOver from crashing Safari when openin the calendar. TODO: Investigate a neater solution
      setTimeout(() => {
        this.focusDate(this.currentDate);
        this.moveFocusOnModalOpen = false;
      }, 100);
    }
  }

  private init = () => {
    this.currentDate = this.startDate ? new Date(this.startDate) : new Date();
    this.updateWeekdays();
  };

  private updateWeekdays() {
    this.weekdays = getWeekDays(
      this.firstDayOfWeek === 0 ? 7 : this.firstDayOfWeek,
      this.locale
    );
  }

  private getClassName(element?: string) {
    return Boolean(element)
      ? `${this.elementClassName}__${element}`
      : this.elementClassName;
  }

  private getCalendarRows(): Date[][] {
    const daysOfMonth = getDaysOfMonth(
      this.currentDate,
      true,
      this.firstDayOfWeek === 0 ? 7 : this.firstDayOfWeek
    );

    const calendarRows: Date[][] = [];

    for (let i = 0; i < daysOfMonth.length; i += 7) {
      const row = daysOfMonth.slice(i, i + 7);
      calendarRows.push(row);
    }

    return calendarRows;
  }

  private getTitle() {
    if (!Boolean(this.currentDate)) {
      return;
    }
    return Intl.DateTimeFormat(this.locale, {
      month: "long",
      year: "numeric"
    }).format(this.currentDate);
  }

  private focusDate(date: Date) {
    this.el
      .querySelector<HTMLTableCellElement>(
        `[data-date="${getISODateString(date)}"]`
      )
      ?.focus();
  }

  private updateCurrentDate(date: Date, moveFocus?: boolean) {
    const month = date.getMonth();
    const year = date.getFullYear();

    const monthChanged =
      month !== this.currentDate.getMonth() ||
      year !== this.currentDate.getFullYear();

    if (monthChanged) {
      this.changeMonth.emit({ month: getMonth(date), year: getYear(date) });

      if (moveFocus) {
        this.moveFocusAfterMonthChanged = true;
      }
    }

    this.currentDate = date;

    if (moveFocus) {
      this.focusDate(this.currentDate);
    }
  }

  private onSelectDate(date: Date) {
    if (this.disableDate(date)) {
      return;
    }

    if (this.isRangeValue(this.value)) {
      const newValue =
        this.value?.[0] === undefined || this.value.length === 2
          ? [date]
          : [this.value[0], date];

      if (newValue.length === 2 && newValue[0] > newValue[1]) {
        newValue.reverse();
      }

      const isoValue =
        newValue[1] === undefined
          ? [getISODateString(newValue[0])]
          : [getISODateString(newValue[0]), getISODateString(newValue[1])];

      this.value = newValue;
      this.selectDate.emit(isoValue);
    } else {
      if (this.value?.getTime() === date.getTime()) {
        return;
      }

      this.value = date;
      this.selectDate.emit(getISODateString(date));
    }
  }

  // @ts-ignore
  private isRangeValue(value: Date | Date[]): value is Date[] {
    return this.range;
  }

  private nextMonth = () => {
    this.updateCurrentDate(getNextMonth(this.currentDate));
  };

  private nextYear = () => {
    this.updateCurrentDate(getNextYear(this.currentDate));
  };

  private previousMonth = () => {
    this.updateCurrentDate(getPreviousMonth(this.currentDate));
  };

  private previousYear = () => {
    this.updateCurrentDate(getPreviousYear(this.currentDate));
  };

  private showToday = () => {
    this.updateCurrentDate(new Date());
  };

  private clear = () => {
    this.value = undefined;
    this.selectDate.emit(undefined);
  };

  private onClick = (event: Event) => {
    if (this.disabled) {
      return;
    }

    const target = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-date]"
    );

    if (!Boolean(target)) {
      return;
    }

    const date = new Date(target.dataset.date);

    this.updateCurrentDate(date);
    this.onSelectDate(date);
  };

  private onMonthSelect = (event: Event) => {
    const month = +(event.target as HTMLSelectElement).value - 1;
    const date = new Date(this.currentDate);

    date.setMonth(month);

    this.updateCurrentDate(date);
  };

  private onYearSelect = (event: Event) => {
    const year = +(event.target as HTMLSelectElement).value;
    const date = new Date(this.currentDate);

    date.setFullYear(year);

    this.updateCurrentDate(date);
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (this.disabled) {
      return;
    }

    if (event.code === "ArrowLeft") {
      event.preventDefault();
      this.updateCurrentDate(getPreviousDay(this.currentDate), true);
    } else if (event.code === "ArrowRight") {
      event.preventDefault();
      this.updateCurrentDate(getNextDay(this.currentDate), true);
    } else if (event.code === "ArrowUp") {
      event.preventDefault();
      this.updateCurrentDate(subDays(this.currentDate, 7), true);
    } else if (event.code === "ArrowDown") {
      event.preventDefault();
      this.updateCurrentDate(addDays(this.currentDate, 7), true);
    } else if (event.code === "PageUp") {
      event.preventDefault();

      if (event.shiftKey) {
        this.updateCurrentDate(getPreviousYear(this.currentDate), true);
      } else {
        this.updateCurrentDate(getPreviousMonth(this.currentDate), true);
      }
    } else if (event.code === "PageDown") {
      event.preventDefault();

      if (event.shiftKey) {
        this.updateCurrentDate(getNextYear(this.currentDate), true);
      } else {
        this.updateCurrentDate(getNextMonth(this.currentDate), true);
      }
    } else if (event.code === "Home") {
      event.preventDefault();
      this.updateCurrentDate(getFirstOfMonth(this.currentDate), true);
    } else if (event.code === "End") {
      event.preventDefault();
      this.updateCurrentDate(getLastOfMonth(this.currentDate), true);
    } else if (event.code === "Space" || event.code === "Enter") {
      event.preventDefault();
      this.onSelectDate(this.currentDate);
    }
  };

  private onMouseEnter = (event: MouseEvent) => {
    if (this.disabled) {
      return;
    }

    const date = new Date(
      (event.target as HTMLElement).closest("td").dataset.date
    );

    this.hoveredDate = date;
  };

  private onMouseLeave = () => {
    this.hoveredDate = undefined;
  };

  render() {
    const showFooter =
      this.showTodayButton || this.showClearButton || this.showKeyboardHint;

    return (
      <Host>
        <div
          aria-disabled={String(this.disabled)}
          class={{
            [this.getClassName()]: true,
            [`${this.getClassName()}--disabled`]: this.disabled
          }}
        >
          <div class={this.getClassName("header")}>
            {this.showHiddenTitle && (
              <span
                aria-atomic="true"
                aria-live="polite"
                class="visually-hidden"
              >
                {this.getTitle()}
              </span>
            )}

            {this.showYearStepper && (
              <button
                aria-label={this.labels.previousYearButton}
                class={this.getClassName("previous-year-button")}
                disabled={this.disabled}
                innerHTML={this.previousYearButtonContent || undefined}
                onClick={this.previousYear}
                type="button"
              >
                <svg
                  fill="none"
                  height="24"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <polyline points="11 17 6 12 11 7"></polyline>
                  <polyline points="18 17 13 12 18 7"></polyline>
                </svg>
              </button>
            )}
            {this.showMonthStepper && (
              <button
                aria-label={this.labels.previousMonthButton}
                class={this.getClassName("previous-month-button")}
                disabled={this.disabled}
                innerHTML={this.previousMonthButtonContent || undefined}
                onClick={this.previousMonth}
                type="button"
              >
                <svg
                  fill="none"
                  height="24"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            )}
            <span class={this.getClassName("current-month")}>
              <select
                aria-label={this.labels.monthSelect}
                class={this.getClassName("month-select")}
                disabled={this.disabled}
                name="month"
                onChange={this.onMonthSelect}
              >
                {getMonths(this.locale).map((month, index) => (
                  <option
                    key={month}
                    selected={this.currentDate.getMonth() === index}
                    value={index + 1}
                  >
                    {month}
                  </option>
                ))}
              </select>
              <input
                aria-label={this.labels.yearSelect}
                class={this.getClassName("year-select")}
                disabled={this.disabled}
                max={9999}
                min={1}
                name="year"
                onChange={this.onYearSelect}
                type="number"
                value={this.currentDate.getFullYear()}
              />
            </span>
            {this.showMonthStepper && (
              <button
                aria-label={this.labels.nextMonthButton}
                class={this.getClassName("next-month-button")}
                disabled={this.disabled}
                innerHTML={this.nextMonthButtonContent || undefined}
                onClick={this.nextMonth}
                type="button"
              >
                <svg
                  fill="none"
                  height="24"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            )}
            {this.showYearStepper && (
              <button
                aria-label={this.labels.nextYearButton}
                class={this.getClassName("next-year-button")}
                disabled={this.disabled}
                innerHTML={this.nextYearButtonContent || undefined}
                onClick={this.nextYear}
                type="button"
              >
                <svg
                  fill="none"
                  height="24"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <polyline points="13 17 18 12 13 7"></polyline>
                  <polyline points="6 17 11 12 6 7"></polyline>
                </svg>
              </button>
            )}
          </div>

          <div class={this.getClassName("body")}>
            <table
              class={this.getClassName("calendar")}
              onKeyDown={this.onKeyDown}
              role="grid"
              aria-label={this.getTitle()}
            >
              <thead class={this.getClassName("calendar-header")}>
                <tr class={this.getClassName("weekday-row")}>
                  {this.weekdays.map((weekday) => (
                    <th
                      role="columnheader"
                      abbr={weekday[1]}
                      class={this.getClassName("weekday")}
                      key={weekday[0]}
                      scope="col"
                    >
                      <span aria-hidden="true">{weekday[0]}</span>
                      <span class="visually-hidden">{weekday[1]}</span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {this.getCalendarRows().map((calendarRow) => {
                  const rowKey = `row-${calendarRow[0].getMonth()}-${calendarRow[0].getDate()}`;

                  return (
                    <tr class={this.getClassName("calendar-row")} key={rowKey}>
                      {calendarRow.map((day) => {
                        const isCurrent = isSameDay(day, this.currentDate);

                        const isOverflowing =
                          day.getMonth() !== this.currentDate.getMonth();

                        const isSelected = Array.isArray(this.value)
                          ? isSameDay(day, this.value[0]) ||
                            isSameDay(day, this.value[1])
                          : isSameDay(day, this.value);

                        const isInRange = !this.isRangeValue
                          ? false
                          : isDateInRange(day, {
                              from: this.value?.[0],
                              to:
                                this.value?.[1] ||
                                this.hoveredDate ||
                                this.currentDate
                            });

                        const isToday = isSameDay(day, new Date());

                        const isDisabled = this.disableDate(day);

                        const cellKey = `cell-${day.getMonth()}-${day.getDate()}`;

                        const className = {
                          [this.getClassName("date")]: true,
                          [this.getClassName("date--current")]: isCurrent,
                          [this.getClassName("date--disabled")]: isDisabled,
                          [this.getClassName("date--overflowing")]:
                            isOverflowing,
                          [this.getClassName("date--today")]: isToday,
                          [this.getClassName("date--selected")]: isSelected,
                          [this.getClassName("date--in-range")]: isInRange
                        };

                        const Tag = isSelected
                          ? "strong"
                          : isToday
                          ? "em"
                          : "span";

                        return (
                          <td
                            aria-disabled={String(isDisabled)}
                            aria-selected={isSelected ? "true" : undefined}
                            class={className}
                            data-date={getISODateString(day)}
                            key={cellKey}
                            onClick={this.onClick}
                            onMouseEnter={this.onMouseEnter}
                            onMouseLeave={this.onMouseLeave}
                            role="gridcell"
                            tabIndex={
                              isSameDay(day, this.currentDate) && !this.disabled
                                ? 0
                                : -1
                            }
                          >
                            <Tag aria-hidden="true">{day.getDate()}</Tag>
                            <span class="visually-hidden">
                              {`${
                                isSelected ? `${this.labels.selected}, ` : ""
                              }${Intl.DateTimeFormat(this.locale, {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                              }).format(day)}`}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {showFooter && (
            <div class={this.getClassName("footer")}>
              <div class={this.getClassName("footer-buttons")}>
                {this.showTodayButton && (
                  <button
                    class={this.getClassName("today-button")}
                    disabled={this.disabled}
                    innerHTML={this.todayButtonContent || undefined}
                    onClick={this.showToday}
                    type="button"
                  >
                    {this.labels.todayButton}
                  </button>
                )}
                {this.showClearButton && (
                  <button
                    class={this.getClassName("clear-button")}
                    disabled={this.disabled}
                    innerHTML={this.clearButtonContent || undefined}
                    onClick={this.clear}
                    type="button"
                  >
                    {this.labels.clearButton}
                  </button>
                )}
              </div>
              {this.showKeyboardHint &&
                !window.matchMedia("(pointer: coarse)").matches && (
                  <button
                    type="button"
                    onClick={() => alert("Todo: Add Keyboard helper!")}
                    class={this.getClassName("keyboard-hint")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="1em"
                      width="1em"
                      viewBox="0 0 48 48"
                      fill="currentColor"
                    >
                      <path d="M7 38q-1.2 0-2.1-.925Q4 36.15 4 35V13q0-1.2.9-2.1.9-.9 2.1-.9h34q1.2 0 2.1.9.9.9.9 2.1v22q0 1.15-.9 2.075Q42.2 38 41 38Zm0-3h34V13H7v22Zm8-3.25h18v-3H15Zm-4.85-6.25h3v-3h-3Zm6.2 0h3v-3h-3Zm6.15 0h3v-3h-3Zm6.2 0h3v-3h-3Zm6.15 0h3v-3h-3Zm-24.7-6.25h3v-3h-3Zm6.2 0h3v-3h-3Zm6.15 0h3v-3h-3Zm6.2 0h3v-3h-3Zm6.15 0h3v-3h-3ZM7 35V13v22Z" />
                    </svg>
                    {this.labels.keyboardHint}
                  </button>
                )}
            </div>
          )}
        </div>
      </Host>
    );
  }
}
