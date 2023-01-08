/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import {
  MonthChangedEventDetails,
  WCDatepickerLabels
} from "./components/wc-datepicker/wc-datepicker";
export namespace Components {
  interface InclusiveDates {
    firstDayOfWeek?: number;
    label?: string;
    locale?: string;
    nextMonthButtonContent?: string;
    nextYearButtonContent?: string;
    pickerid: string;
    placeholder?: string;
    startDate?: string;
    todayButtonContent?: string;
    value?: string;
  }
  interface InclusiveDatesModal {
    /**
     * Close the dialog.
     */
    close: () => Promise<void>;
    getState: () => Promise<boolean>;
    hideLabel?: boolean;
    label: string;
    /**
     * Open the dialog.
     */
    open: () => Promise<void>;
    setAnchorElement: (element: HTMLElement) => Promise<void>;
    setTriggerElement: (element: HTMLElement) => Promise<void>;
  }
  interface WcDatepicker {
    clearButtonContent?: string;
    disableDate?: (date: Date) => boolean;
    disabled?: boolean;
    elementClassName?: string;
    firstDayOfWeek?: number;
    labels?: WCDatepickerLabels;
    locale?: string;
    modalIsOpen?: boolean;
    nextMonthButtonContent?: string;
    nextYearButtonContent?: string;
    previousMonthButtonContent?: string;
    previousYearButtonContent?: string;
    range?: boolean;
    showClearButton?: boolean;
    showHiddenTitle?: boolean;
    showMonthStepper?: boolean;
    showTodayButton?: boolean;
    showYearStepper?: boolean;
    startDate?: string;
    todayButtonContent?: string;
    value?: Date | Date[];
  }
}
export interface InclusiveDatesCustomEvent<T> extends CustomEvent<T> {
  detail: T;
  target: HTMLInclusiveDatesElement;
}
export interface InclusiveDatesModalCustomEvent<T> extends CustomEvent<T> {
  detail: T;
  target: HTMLInclusiveDatesModalElement;
}
export interface WcDatepickerCustomEvent<T> extends CustomEvent<T> {
  detail: T;
  target: HTMLWcDatepickerElement;
}
declare global {
  interface HTMLInclusiveDatesElement
    extends Components.InclusiveDates,
      HTMLStencilElement {}
  var HTMLInclusiveDatesElement: {
    prototype: HTMLInclusiveDatesElement;
    new (): HTMLInclusiveDatesElement;
  };
  interface HTMLInclusiveDatesModalElement
    extends Components.InclusiveDatesModal,
      HTMLStencilElement {}
  var HTMLInclusiveDatesModalElement: {
    prototype: HTMLInclusiveDatesModalElement;
    new (): HTMLInclusiveDatesModalElement;
  };
  interface HTMLWcDatepickerElement
    extends Components.WcDatepicker,
      HTMLStencilElement {}
  var HTMLWcDatepickerElement: {
    prototype: HTMLWcDatepickerElement;
    new (): HTMLWcDatepickerElement;
  };
  interface HTMLElementTagNameMap {
    "inclusive-dates": HTMLInclusiveDatesElement;
    "inclusive-dates-modal": HTMLInclusiveDatesModalElement;
    "wc-datepicker": HTMLWcDatepickerElement;
  }
}
declare namespace LocalJSX {
  interface InclusiveDates {
    firstDayOfWeek?: number;
    label?: string;
    locale?: string;
    nextMonthButtonContent?: string;
    nextYearButtonContent?: string;
    onSelectDate?: (
      event: InclusiveDatesCustomEvent<string | string[] | undefined>
    ) => void;
    pickerid: string;
    placeholder?: string;
    startDate?: string;
    todayButtonContent?: string;
    value?: string;
  }
  interface InclusiveDatesModal {
    hideLabel?: boolean;
    label: string;
    onClosed?: (event: InclusiveDatesModalCustomEvent<any>) => void;
    onOpened?: (event: InclusiveDatesModalCustomEvent<any>) => void;
  }
  interface WcDatepicker {
    clearButtonContent?: string;
    disableDate?: (date: Date) => boolean;
    disabled?: boolean;
    elementClassName?: string;
    firstDayOfWeek?: number;
    labels?: WCDatepickerLabels;
    locale?: string;
    modalIsOpen?: boolean;
    nextMonthButtonContent?: string;
    nextYearButtonContent?: string;
    onChangeMonth?: (
      event: WcDatepickerCustomEvent<MonthChangedEventDetails>
    ) => void;
    onSelectDate?: (
      event: WcDatepickerCustomEvent<string | string[] | undefined>
    ) => void;
    previousMonthButtonContent?: string;
    previousYearButtonContent?: string;
    range?: boolean;
    showClearButton?: boolean;
    showHiddenTitle?: boolean;
    showMonthStepper?: boolean;
    showTodayButton?: boolean;
    showYearStepper?: boolean;
    startDate?: string;
    todayButtonContent?: string;
    value?: Date | Date[];
  }
  interface IntrinsicElements {
    "inclusive-dates": InclusiveDates;
    "inclusive-dates-modal": InclusiveDatesModal;
    "wc-datepicker": WcDatepicker;
  }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
  export namespace JSX {
    interface IntrinsicElements {
      "inclusive-dates": LocalJSX.InclusiveDates &
        JSXBase.HTMLAttributes<HTMLInclusiveDatesElement>;
      "inclusive-dates-modal": LocalJSX.InclusiveDatesModal &
        JSXBase.HTMLAttributes<HTMLInclusiveDatesModalElement>;
      "wc-datepicker": LocalJSX.WcDatepicker &
        JSXBase.HTMLAttributes<HTMLWcDatepickerElement>;
    }
  }
}