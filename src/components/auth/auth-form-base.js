// src/lit/auth-form-base.js
import { LitElement, html, css } from 'lit';

// This class serves as a base for login and registration forms,
// containing common properties, styles, and utility methods.
export class AuthFormBase extends LitElement {

  static properties = {
    message: { state: true },      // Common state for displaying messages (errors, info)
    _isSending: { state: true },   // Common state for indicating form submission in progress
  };

  constructor() {
    super();
    this.message = '';
    this._isSending = false;
  }

  // Common styles for form layout, inputs, buttons, etc.
  static styles = css`
    .formLogin { /* Renamed from .formLogin to .authForm to be more generic, but kept original class name for less refactor in HTML */
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
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

    .error-message {
      color: rgb(255, 36, 36);
      text-align: center;
      width: 100%;
      font-weight: bolder;
      margin-top: 10px;
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

        <div class="error-message">
          ${this.message ? html`<p>${this.message}</p>` : ''} <!-- Common error message display -->
        </div>
        <br>

        <div class="center" style="width: 100%;">
          ${this.renderSubmitButton()} <!-- Insert specific submit button -->
        </div>
        <br>

        ${this.renderAdditionalContent()} <!-- Insert specific links or additional elements -->

      </form>
    `;
  }
}