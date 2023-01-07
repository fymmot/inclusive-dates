import { Component, Element, Event, EventEmitter, h, Host, Prop, State, Watch } from '@stencil/core';
import * as chrono from 'chrono-node';
import {
  getISODateString
} from '../../utils/utils';

@Component({
  scoped: true,
  shadow: false,
  styleUrl: 'wc-input.css',
  tag: 'wc-input'
})

export class WCInput {
  @Element() el: HTMLElement;

  @Prop() locale?: string = navigator?.language || 'en-US';
  @Prop() nextMonthButtonContent?: string;
  @Prop() nextYearButtonContent?: string;
  @Prop() startDate?: string = getISODateString(new Date());
  @Prop() todayButtonContent?: string;
  @Prop({ mutable: true }) value?: string;

  @State() currentDate: Date;
  @State() internalValue: string

  @Event() selectDate: EventEmitter<string | string[] | undefined>;

  private modalRef?: HTMLA11yModalElement;
  private inputRef?: HTMLInputElement;
  private calendarButtonRef?: HTMLButtonElement;
  // private calendarRef?: HTMLWcDatepickerElement


  clickHandler = async () => {
    await this.modalRef.setTriggerElement(this.calendarButtonRef)
   if (await this.modalRef.getState() === false)
     await this.modalRef?.open();
   else if (await this.modalRef.getState() === true)
     await this.modalRef?.close();
  }

  /*setNewDate = async (newDate: string) => {
    // await this.calendarRef.setValue(newDate);
  }*/

  componentDidLoad() {
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
  }
  private handleChange(event) {
    const parsedDate = chrono.parseDate(event.target.value, new Date(),{forwardDate: true});
    if (parsedDate instanceof Date) {
      this.internalValue = parsedDate.toISOString().slice(0, 10)
      event.target.value = parsedDate.toISOString().slice(0, 10)
    }
  }

  render() {
    return (
      <Host>
        <label>
        Choose a date
        <input type='text' ref={(r) => this.inputRef = r} onChange={this.handleChange}/>
      </label>
        <button
          ref={(r) => this.calendarButtonRef = r}
          onClick={this.clickHandler}
        >Open calendar</button>
        {this.internalValue}
        <a11y-modal label="Calendar" hideLabel={true} ref={el => (this.modalRef = el)} onOpened={()=>{console.log(`onOpenModal: ${this.internalValue}`)}}>
          <wc-datepicker onSelectDate={(event)=> this.handlePickerSelection(event.detail as string)}/>
        </a11y-modal>
      </Host>
    )
  }
}
