// src/lit/auth-form-base.js
import { LitElement, html, css } from 'lit';

export class AuthFormBase extends LitElement {

  static properties = {
    message: { state: true },      // Common state for displaying messages (errors, info)
    _isSending: { state: true },   // Common state for indicating form submission in progress
    _messagecolor: { state: true },      // Common state for displaying messages (errors, info)
  };

  constructor() {
    super();
    this.message = '';
    this._isSending = false;
    this._messagecolor = 'red';
  }

  // Common styles for form layout, inputs, buttons, etc.
  static styles = css`
    :host {
      --yellow-text: #E5AF05;
    }
    .formLogin { /* Renamed from .formLogin to .authForm to be more generic, but kept original class name for less refactor in HTML */
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .yellow {
      color: var(--yellow-text) !important;
    }
    .text-shadow { /* Moved from register, might be used in login too, or keep specific */
        text-shadow:
          -1px -1px 0 gray,
          1px -1px 0 gray,
          -1px  1px 0 gray,
          1px  1px 0 gray;
    }

    .divCenter {
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      position: relative;
    }

    .formLogin .divCenter > div { /* Keep original class name selector */
      width: 100%;
      max-width: 350px;
    }

    .formLogin input[type="text"], /* Keep original class name selector */
    .formLogin input[type="email"],
    .formLogin input[type="password"] {
      display: block;
      width: 100% !important;
      margin: 10px 0;
      background: #280D3F !important;
      border: none;
      border-radius: 5px;
      padding: 12px 15px;
      box-sizing: border-box;
      color: white !important;
      text-align: center;
      outline: none;
    }

    .formLogin input[type="text"]::placeholder, /* Keep original class name selector */
    .formLogin input[type="email"]::placeholder,
    .formLogin input[type="password"]::placeholder {
      color: rgba(236, 236, 236, 0.692);
      opacity: 1;
    }

    .formLogin button { /* Keep original class name selector */
      background: #bb9517;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 3px;
      font-weight: bold;
      cursor: pointer;
      min-width: 100px;
      transition: background-color 0.2s ease;
    }

    .formLogin button:hover { /* Keep original class name selector */
      background: #a38315;
    }

    .formLogin p { /* Keep original class name selector */
      width: 100%;
      text-align: center;
    }

    .formLogin a { /* Keep original class name selector */
      color: white;
      font-weight: bolder;
      cursor: pointer;
      text-decoration: underline;
    }

    .state-message {
      text-align: center;
      width: 100%;
      font-weight: bolder;
      min-height: 1.2em;
    }

    .center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      width: 100%;
    }

    .max-w-80 { /* Moved from register, might be specific */
      max-width: 80%;
    }

    @media (max-width: 700px) {
      .formLogin .divCenter > div { /* Keep original class name selector */
        width: 85%;
      }

      .formLogin input[type="text"], /* Keep original class name selector */
      .formLogin input[type="email"],
      .formLogin input[type="password"] {
        font-size: 1.1em;
        padding: 10px 12px;
      }

      .formLogin button { /* Keep original class name selector */
        font-size: 1.1em;
        width: 50%;
        padding: 12px 15px;
      }
    }
  `;

  // Utility method for dispatching custom events with bubbles and composed
  dispatchE(name, data) {
    console.log("dispatchE",name)
    this.dispatchEvent(new CustomEvent(name, {
      detail: data,
      bubbles: true,
      composed: true,
    }));
  }

  // Common focus-in handler
  _handleFormFocusIn() {
    this.dispatchE('form-focusin', {});
  }

  // Common focus-out handler
  _handleFormFocusOut(event) {
    const relatedTarget = event.relatedTarget;
    // Check if the focus moved outside the component's shadow DOM
    if (!relatedTarget || !this.shadowRoot.contains(relatedTarget)) {
      this.dispatchE('form-focusout', {});
    } else {
      // Optional: log for debugging if focus stays within the form
      // console.log('Focus stayed within the component.');
    }
  }

  // Common method to dispatch loading state
  _dispatchLoadingState(isLoading) {
    this.dispatchE('loading-state', { loading: isLoading });
  }

  // Abstract methods that derived classes must implement to provide
  // the specific content for their forms.
  renderFormFields() {
    // This method should be implemented by derived classes
    return html``;
  }

  renderSubmitButton() {
    // This method should be implemented by derived classes
    return html``;
  }

  renderAdditionalContent() {
     // This method should be implemented by derived classes
    return html``;
  }

  // The main render method for the base structure.
  // It calls the derived class's methods to insert specific content.
  render() {
    return html`
      <form
        class="formLogin"
        slot="auth-form" 
        @submit=${(e) => e.preventDefault()}
        @focusin=${this._handleFormFocusIn}
        @focusout=${this._handleFormFocusOut}
      >
        <div class="divCenter">
          <div>
            ${this.renderFormFields()} <!-- Insert specific input fields -->
          </div>
        </div>

        <div class="state-message" style="color:${this._messagecolor}">
          ${this.message ? html`<p>${this.message}</p>` : ''} <!-- Common error message display -->
        </div>
        <div class="center" style="width: 100%;">
          ${this.renderSubmitButton()} <!-- Insert specific submit button -->
        </div>
        <br>

        ${this.renderAdditionalContent()} <!-- Insert specific links or additional elements -->

      </form>
    `;
  }
}
export class PasswordField extends LitElement {
  static properties = {
    value: { type: String },
    placeholder: { type: String },
    disabled: { type: Boolean },
    showPassword: { type: Boolean, state: true },
    label: { type: String }
  };

  static styles = css`
    :host {
      display: block;
      font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
      --bg-color: rgb(40, 13, 63);
      --white-font: #fff;
    }
    
    .password-container {
      position: relative;
      width: 100%;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-size: 0.9em;
      color: #555;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    input {
      width: 100%;
      padding: 10px 40px 10px 12px;
      border: 1px solid rgb(40, 13, 63);
      border-radius: 4px;
      text-align: center;
      transition: border-color 0.2s ease;
      background-color: rgb(40, 13, 63);
      color: #fff;
    }

    input:focus {
      outline: none;
      border-color: #646cff;
      box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.2);
    }

    input:disabled {
      background-color: #f5f5f5;
      color: #999;
      cursor: not-allowed;
    }

    .toggle-button {
      position: absolute;
      right: 8px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #555;
      transition: color 0.2s ease;
    }

    .toggle-button:hover {
      color: #646cff;
    }
    
    .toggle-button:focus {
      outline: none;
    }

    @media (prefers-color-scheme: dark) {
      input {
        background-color: rgb(40, 13, 63);
      }
      
      input:disabled {
        background-color: #2a2a2a;
        color: #777;
      }
      
      label {
        color: #ccc;
      }
      
      .toggle-button {
        color: #999;
      }
      
      .toggle-button:hover {
        color: #a4a9ff;
      }
    }
  `;

  constructor() {
    super();
    this.value = "";
    this.placeholder = "Enter password";
    this.disabled = false;
    this.showPassword = false;
  }

  toggleVisibility() {
    this.showPassword = !this.showPassword;
  }

  handleInput(e) {
    this.value = e.target.value;
    this.dispatchEvent(new CustomEvent("change", {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }

  _handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.dispatchEvent(new CustomEvent('submit', {
        bubbles: true,
        composed: true
      }));
    }
  }

  getPassword() {
    return this.value;
  }

  render() {
    return html`
      <div class="password-container">
        <div class="input-wrapper">
          <input
            type="${this.showPassword ? "text" : "password"}"
            id="password"
            .value="${this.value}"
            placeholder="${this.placeholder}"
            ?disabled="${this.disabled}"
            @input="${this.handleInput}"
            @keypress="${this._handleKeyPress}"
          />
          <button
            class="toggle-button"
            @click="${this.toggleVisibility}"
            type="button"
            tabindex="-1"
            ?disabled="${this.disabled}"
            aria-label="${this.showPassword ? 'Hide password' : 'Show password'}"
          >
            ${this.showPassword
              ? html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>`
              : html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                    <line x1="2" y1="2" x2="22" y2="22"></line>
                  </svg>`
            }
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define("password-field", PasswordField);