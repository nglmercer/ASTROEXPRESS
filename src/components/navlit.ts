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
    currentPage: { type: Number },
    totalPages: { type: Number },
    canGoBackward: { type: Boolean },
    canGoForward: { type: Boolean },
  };

  // Initialize properties
  currentPage = 1;
  totalPages = 0; // Unknown initially
  canGoBackward = false; // Controlled by fetch
  canGoForward = true; // Assume forward is possible until fetch indicates otherwise

  constructor() {
    super();
    // Fetch initial page data when the component is created
  }

  private async handleBackward() {
    if (this.canGoBackward) {
      const newPage = this.currentPage - 1;
      this.dipatch("action", {
        typeEvent: 'backward', page: newPage
      });

    }
  }

  private async handleForward() {
    if (this.canGoForward) {
      const newPage = this.currentPage + 1;
      this.dipatch("action", {
        typeEvent: 'forward', page: newPage
      });
    }
  }
  private dipatch(evname:string, evdata:any) {
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
customElements.define('pagination-nav', PaginationNav);