import {
  Component, Event, EventEmitter,
  h,
  Host,
  Method,
  Prop,
  State
} from '@stencil/core';

/**
 * @slot slot - The dialog content
 */
@Component({
  shadow: true,
  styleUrl: "a11y-modal.css",
  tag: "a11y-modal",
})
export class A11yModal {
  @Prop() hideLabel?: boolean;
  @Prop() label!: string;

  @State() closing = false;

  @State () showing = false;
  @Event() opened: EventEmitter;

  private triggerElement: HTMLElement

  /**
   * Open the dialog.
   */
  @Method()
  async open() {
    console.log(this.triggerElement)
    this.showing = true
    this.opened.emit(undefined)
  }

  /**
   * Close the dialog.
   */
  @Method()
  async close() {
    if (this.closing) {
      return;
    }

    this.closing = true;

    setTimeout(() => {
      this.showing = false
      this.closing = false;
      if (this.triggerElement)
        this.triggerElement.focus()
    }, 150);
  }
  @Method()
  async getState() {
    return this.showing
  }

  @Method()
  async setTriggerElement(element: HTMLElement) {
    this.triggerElement = element
  }

  onKeyDown = (event: KeyboardEvent) => {
    if (event.code === "Escape") {
      this.close();
    }
  };

  private onBackdropClick = () => {
    this.close()
  };

  render() {
    return (
      <Host>
        {this.showing && (
          <div
            aria-describedby="content"
            aria-hidden={!this.showing}
            aria-labelledby={this.hideLabel ? undefined : "label"}
            aria-label={this.hideLabel ? this.label : undefined}
            aria-modal={this.showing}
            onKeyDown={this.onKeyDown}
            role="dialog"
          >
            <div class="dialog__backdrop" onClick={this.onBackdropClick}></div>
            <div class="dialog__body" role="document">
              {!this.hideLabel && (
                <h2 class="dialog__heading" id="label">
                  {this.label}
                </h2>
              )}
              <div class="dialog__content" id="content">
                <slot/>
              </div>
            </div>
          </div>
        )}
      </Host>
    );
  }
}
