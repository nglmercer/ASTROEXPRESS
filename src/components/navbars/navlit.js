import { LitElement, html, css } from 'lit';

export class PaginationNav extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: Arial, sans-serif;
      --button-bg: var(--dark-mode, #f0f0f0);
      --button-border: var(--dark-mode, #ccc);
      --button-hover: var(--dark-mode, #e0e0e0);
      --text-color: var(--dark-mode, #000);
    }
    button {
      background: var(--button-bg);
      border: 1px solid var(--button-border);
      border-radius: 4px;
      padding: 5px 10px;
      cursor: pointer;
      transition: background 0.2s;
      color: var(--text-color);
    }
    button:hover {
      background: var(--button-hover);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .indicator {
      min-width: 50px;
      text-align: center;
      color: var(--text-color);
    }
  `;

  static properties = {
    /**
     * The current page number (1-indexed).
     */
    currentPage: { type: Number, default: 1 },

    /**
     * The total number of pages. Use 0 or null if unknown.
     */
    totalPages: { type: Number, default: 0 },

    /**
     * Indicates if navigating to the previous page is possible.
     */
    canGoBackward: { type: Boolean, default: false },

    /**
     * Indicates if navigating to the next page is possible.
     */
    canGoForward: { type: Boolean, default: true },

    darkMode: { type: Boolean, default: false }
  };

  constructor() {
    super();
    this.updateStyles();
  }

  updateStyles() {
    this.style.setProperty('--dark-mode', this.darkMode ? '#2d2d2d,#444,#3d3d3d,#fff' : '#f0f0f0,#ccc,#e0e0e0,#000');
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    this.updateStyles();
  }

  async handleBackward() {
    if (this.canGoBackward || !this.totalPages) {
      const newPage = this.currentPage - 1;
      this.dispatch("action", {
        typeEvent: 'backward', page: newPage
      });
    }
  }

  async handleForward() {
    if (this.canGoForward || !this.totalPages) {
      const newPage = this.currentPage + 1;
      this.dispatch("action", {
        typeEvent: 'forward', page: newPage
      });
    }
  }

  dispatch(evname, evdata) {
    this.dispatchEvent(
      new CustomEvent(evname, {
        detail: evdata,
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <button @click=${this.handleBackward}>
        ←
      </button>
      <span class="indicator">
        ${this.currentPage} / ${this.totalPages || '?'}
      </span>
      <button @click=${this.handleForward}>
        →
      </button>
    `;
  }
}

if (window.customElements.get('pagination-nav') === undefined) {
  customElements.define('pagination-nav', PaginationNav);
}
