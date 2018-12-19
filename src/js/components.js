$(document).ready(function(){

  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      :host {
        display: flex;
        flex-wrap: wrap;
      }
      ::slotted(howto-panel) {
        flex-basis: 100%;
      }
    </style>
    <slot name="tab"></slot>
    <slot name="panel"></slot>
  `;


  class UseitInput extends HTMLElement {

    static get observedAttributes() {
      return ['checked', 'disabled'];
    }

    constructor() {
      super(); // always call super() first in the constructor.

      this.attachShadow({mode: 'open'});
      this.shadowRoot.appendChild(template.content.cloneNode(true));

      this.addEventListener('click', e => {
        console.log("Hurra!")
      });
    }
  
    connectedCallback() {
      if (!this.hasAttribute('role'))
        this.setAttribute('role', 'checkbox');


      this._upgradeProperty('checked');
      this._upgradeProperty('disabled');

      this.addEventListener('keyup', this._onKeyUp);
      this.addEventListener('click', this._onClick);
    }

    _upgradeProperty(prop) {
      if (this.hasOwnProperty(prop)) {
        let value = this[prop];
        delete this[prop];
        this[prop] = value;
      }
    }

    disconnectedCallback() {
      this.removeEventListener('keyup', this._onKeyUp);
      this.removeEventListener('click', this._onClick);
    }

    set invalid(value) {
      const isInvalid = Boolean(value);
      if (isInvald)
        this.setAttribute('invalid', '');
      else
        this.removeAttribute('invalid');
    }

    get invalid() {
      return this.hasAttribute('invalid');
    }


  }

window.customElements.define('useit-input', UseitInput);


});