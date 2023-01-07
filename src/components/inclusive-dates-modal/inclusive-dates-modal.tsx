import {
  Component, Event, EventEmitter,
  h,
  Host,
  Method,
  Prop,
  State
} from '@stencil/core';
import "@a11y/focus-trap";
import { hideOthers } from 'aria-hidden';

/**
 * @slot slot - The dialog content
 */
@Component({
  shadow: true,
  styleUrl: "inclusive-dates-modal.css",
  tag: "inclusive-dates-modal",
})
export class InclusiveDatesModal {
  @Prop() hideLabel?: boolean;
  @Prop() label!: string;
  @State() closing = false;
  @State () showing = false;
  @Event() opened: EventEmitter;

  private triggerElement: HTMLElement
  private anchorEl: HTMLElement;
  private bodyRef: HTMLElement
  private containerRef: HTMLElement
  private el: HTMLElement
  private undo: () => void

  /**
   * Open the dialog.
   */
  @Method()
  async open() {
    this.showing = true
    this.undo = hideOthers(this.el)
    this.opened.emit(undefined)
    setTimeout(()=>{
      if (this.containerRef)
      this.containerRef.focus();
    }, 50)
  }

  /**
   * Close the dialog.
   */
  @Method()
  async close() {
    this.showing = false
    this.undo()

    if (this.triggerElement)
      this.triggerElement.focus()
  }
  @Method()
  async getState() {
    return this.showing
  }

  @Method()
  async setTriggerElement(element: HTMLElement) {
    this.triggerElement = element
  }

  @Method()
  async setAnchorElement(element: HTMLElement) {
    this.anchorEl = element
  }

  onKeyDown = (event: KeyboardEvent) => {
    if (event.code === "Escape") {
      this.close();
    }
  };

  private onBackdropClick = () => {
    this.close()
  };

  componentDidRender(){
    if (this.bodyRef && this.anchorEl && this.showing){
      this.bodyRef.style.cssText = `left:${this.anchorEl.getBoundingClientRect().x}px;top:${this.anchorEl.getBoundingClientRect().y + this.anchorEl.offsetHeight}px`
    }
  }

  render() {

    return (
      <Host showing={this.showing} ref={(r) => {this.el = r}} >
        {this.showing && (
          <div
            aria-describedby="content"
            aria-hidden={!this.showing}
            aria-labelledby={this.hideLabel ? undefined : "label"}
            aria-label={this.hideLabel ? this.label : undefined}
            aria-modal={this.showing}
            onKeyDown={this.onKeyDown}
            role="dialog"
            class="dialog__root"
            tabindex={-1}
            ref={(r) => {this.containerRef = r}}
          >
            <focus-trap>
              <div class="dialog__backdrop" onClick={this.onBackdropClick}></div>
              <div class="dialog__body" role="document" ref={(r)=>{this.bodyRef = r}}>
                {!this.hideLabel && (
                  <h2 class="dialog__heading" id="label">
                    {this.label}
                  </h2>
                )}
                <div class="dialog__content" id="content">
                  <slot/>
                </div>
              </div>
            </focus-trap>
          </div>
          )}
      </Host>
    );
  }
}
