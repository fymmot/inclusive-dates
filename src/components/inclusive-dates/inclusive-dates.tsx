import { Component, Element, Event, EventEmitter, h, Host, Prop, State, Watch } from '@stencil/core';
import * as chrono from 'chrono-node';
import {announce} from '@react-aria/live-announcer';

import {
  getISODateString
} from '../../utils/utils';

@Component({
  scoped: true,
  shadow: false,
  styleUrl: 'inclusive-dates.css',
  tag: 'inclusive-dates'
})

export class InclusiveDates {
  @Element() el: HTMLElement;

  @Prop() locale?: string = navigator?.language || 'en-US';
  @Prop() nextMonthButtonContent?: string;
  @Prop() nextYearButtonContent?: string;
  @Prop() startDate?: string = getISODateString(new Date());
  @Prop() pickerid!: string
  @Prop() firstDayOfWeek?: number = 1 // Monday
  @Prop() label?: string = "Choose a date (any way you like)"
  @Prop() placeholder?: string = `Try "tomorrrow" or "in ten days"`
  @Prop() todayButtonContent?: string;
  @Prop({ mutable: true }) value?: string;

  @State() currentDate: Date;
  @State() internalValue: string

  @Event() selectDate: EventEmitter<string | string[] | undefined>;

  private modalRef?: HTMLInclusiveDatesModalElement;
  private inputRef?: HTMLInputElement;
  private calendarButtonRef?: HTMLButtonElement;
  private pickerRef?: HTMLWcDatepickerElement
  // private calendarRef?: HTMLWcDatepickerElement


  clickHandler = async () => {
    await this.modalRef.setTriggerElement(this.calendarButtonRef)
    await this.modalRef.setAnchorElement(this.inputRef)
   if (await this.modalRef.getState() === false)
     await this.modalRef?.open();
   else if (await this.modalRef.getState() === true)
     await this.modalRef?.close();
  }
  handleChange = async (event) => {
    const parsedDate = chrono.parseDate(event.target.value, new Date(),{forwardDate: true});
    if (parsedDate instanceof Date) {
      this.internalValue = parsedDate.toISOString().slice(0, 10)
      event.target.value = parsedDate.toISOString().slice(0, 10)
      this.pickerRef.value = parsedDate
      announce(`${Intl.DateTimeFormat(this.locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(parsedDate)} selected!`, 'polite')
    }
  }

  @Watch('locale')
  watchLocale() {
  }

  @Watch('value')
  watchValue() {
    if (Boolean(this.value)) {
        this.currentDate = new Date(this.value);
        this.internalValue = this.value
    }
  }

  private handlePickerSelection(newValue: string){
    this.inputRef.value = newValue;
    this.internalValue = newValue;
    this.modalRef.close()
    announce(`${Intl.DateTimeFormat(this.locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(newValue))} selected!`, 'polite')
  }


  render() {
    return (
      <Host>
        <label htmlFor={`${this.pickerid}-input`} class="wc-datepicker__label">
          {this.label}
        </label>
        <br/>
        <div class="wc-datepicker__input-container">
          <input
            id={`${this.pickerid}-input`}
            type='text'
            placeholder={this.placeholder}
            class="wc-datepicker__input"
            ref={(r) => this.inputRef = r}
            onChange={this.handleChange} />

          <button
            ref={(r) => this.calendarButtonRef = r}
            onClick={this.clickHandler}
            class="wc-datepicker__calendar-button"
          >Open calendar
          </button>
        </div>
        <inclusive-dates-modal label="Calendar" hideLabel={true} ref={el => (this.modalRef = el)} onOpened={()=>{this.pickerRef.modalIsOpen = true}} onClosed={()=>{this.pickerRef.modalIsOpen = false}}>
          <wc-datepicker
            locale={this.locale}
            onSelectDate={(event)=> this.handlePickerSelection(event.detail as string)}
            ref={el => (this.pickerRef = el)}
            startDate={this.startDate}
            firstDayOfWeek={this.firstDayOfWeek}
          />
        </inclusive-dates-modal>
      </Host>
    )
  }
}
