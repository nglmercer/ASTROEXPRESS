import { LitElement, html, css } from 'lit';

export class PaginationNav extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: Arial, sans-serif;
    }
    button {
      background: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 5px 10px;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover {
      background: #e0e0e0;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .indicator {
      min-width: 50px;
      text-align: center;
    }
  `;

  static properties = {
    /**
     * The current page number (1-indexed).
     */
    currentPage: { type: Number, default: 1 }, // Use default instead of class field

    /**
     * The total number of pages. Use 0 or null if unknown.
     */
    totalPages: { type: Number, default: 0 }, // Use default instead of class field

    /**
     * Indicates if navigating to the previous page is possible.
     */
    canGoBackward: { type: Boolean, default: false }, // Use default instead of class field

    /**
     * Indicates if navigating to the next page is possible.
     */
    canGoForward: { type: Boolean, default: true }, // Use default instead of class field
  };

  // Remove the class field declarations that shadowed Lit's accessors:
  // currentPage = 1;       <-- REMOVE
  // totalPages = 0;        <-- REMOVE
  // canGoBackward = false; <-- REMOVE
  // canGoForward = true;   <-- REMOVE

  constructor() {
    super();
    // Properties with defaults are initialized by Lit before the constructor runs.
    // If you had state properties ({ state: true }) without defaults,
    // you would initialize them here:
    // this._myInternalState = [];
  }

  // Fix typo: dipatch -> dispatch
  async handleBackward() {
    // Access properties using 'this'. They are now reactive via Lit.
    if (this.canGoBackward) {
      const newPage = this.currentPage - 1;
      this.dispatch("action", { // Corrected method name
        typeEvent: 'backward', page: newPage
      });
    }
  }

  // Fix typo: dipatch -> dispatch
  async handleForward() {
    // Access properties using 'this'. They are now reactive via Lit.
    if (this.canGoForward) {
      const newPage = this.currentPage + 1;
      this.dispatch("action", { // Corrected method name
        typeEvent: 'forward', page: newPage
      });
    }
  }

  // Fix typo: dipatch -> dispatch
  dispatch(evname, evdata) { // Corrected method name
    this.dispatchEvent(
      new CustomEvent(evname, {
        detail: evdata,
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    // Access properties using 'this'. They are now reactive via Lit.
    return html`
      <button
        @click=${this.handleBackward}
        ?disabled=${!this.canGoBackward}>
        ←
      </button>
      <span class="indicator">
        ${this.currentPage} / ${this.totalPages || '?'}
      </span>
      <button
        @click=${this.handleForward}
        ?disabled=${!this.canGoForward}>
        →
      </button>
    `;
  }
}

// Register the custom element
// Using the conditional check from the previous example is good practice
if (window.customElements.get('pagination-nav') === undefined) {
  customElements.define('pagination-nav', PaginationNav);
}