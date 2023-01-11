import {
  Component,
  Event,
  EventEmitter,
  h,
  Host,
  Listen,
  Method,
  Prop,
  State
} from "@stencil/core";
import "@a11y/focus-trap";
import { hideOthers } from "aria-hidden";

/**
 * @slot slot - The dialog content
 */
@Component({
  shadow: true,
  styleUrl: "inclusive-dates-modal.css",
  tag: "inclusive-dates-modal"
})
export class InclusiveDatesModal {
  // Mandatory for accessibility
  @Prop() label!: string;
  @State() closing = false;
  @State() showing = false;
  @Event() opened: EventEmitter;
  @Event() closed: EventEmitter;

  private triggerElement: HTMLElement;
  private el: HTMLElement;
  private undo: () => void;

  /**
   * Open the dialog.
   */
  @Method()
  async open() {
    this.showing = true;
    this.undo = hideOthers(this.el);
    this.opened.emit(undefined);
  }

  /**
   * Close the dialog.
   */
  @Method()
  async close() {
    this.showing = false;
    this.closed.emit(undefined);
    this.undo();
    if (this.triggerElement) this.triggerElement.focus();
  }
  @Method()
  async getState() {
    return this.showing;
  }

  @Method()
  async setTriggerElement(element: HTMLElement) {
    this.triggerElement = element;
  }

  onKeyDown = (event: KeyboardEvent) => {
    if (event.code === "Escape") {
      this.close();
    }
  };

  @Listen("click", { capture: true, target: "window" })
  handleClick(event) {
    if (this.showing && !this.el.contains(event.target as Node)) {
      this.close();
    }
  }

  render() {
    return (
      <Host
        showing={this.showing}
        ref={(r) => {
          this.el = r;
        }}
      >
        {this.showing && (
          <div
            part="body"
            onKeyDown={this.onKeyDown}
            role="dialog"
            tabindex={-1}
            aria-hidden={!this.showing}
            aria-label={this.label}
            aria-modal={this.showing}
          >
            <focus-trap>
              <div part="content">
                <slot />
              </div>
            </focus-trap>
          </div>
        )}
      </Host>
    );
  }
}
