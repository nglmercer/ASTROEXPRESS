import { LitElement, html, css } from 'lit';

// Define a type for a segment for better code clarity
interface Segment {
  name: string;
  value: string;
  index: number; // Add index to easily identify the clicked position
}

// Define the component class
export class NavBreadcrumb extends LitElement {

  // Define reactive properties and state using the static properties getter
  static get properties() {
    return {
      /**
       * Array of names corresponding to the path segments to display.
       * e.g., ['level1', 'level2', 'id'] for a path like /products/category/123
       */
      paramNames: { type: Array }, // Lit handles conversion based on type

      /**
       * Internal state holding the parsed segments to display.
       */
      _segments: { state: true } // Mark as state
    };
  }

  // Define styles using the static styles getter
  static get styles() {
    return css`
      :host {
        display: block;
        font-family: sans-serif;
        font-size: 14px;
        color: #333;
      }
      .breadcrumb {
        display: flex;
        align-items: center;
        padding: 8px 0;
        flex-wrap: wrap; /* Allow wrapping if needed */
      }
      .segment {
        cursor: pointer;
        color: #007bff; /* Standard link color */
        text-decoration: none;
        margin: 0 4px; /* Space around segments */
        white-space: nowrap; /* Prevent segments from breaking lines */
      }
      .segment:hover {
        text-decoration: underline;
      }
      .segment:first-child {
          margin-left: 0; /* No left margin on the first one */
      }
      /* Style for the last segment (not clickable for navigation) */
      .segment:last-child {
        cursor: default;
        color: #555; /* Less prominent color */
        text-decoration: none;
        font-weight: bold; /* Optionally make the last item bold */
      }
      .separator {
        margin: 0 4px; /* Space around separator */
        color: #555;
        white-space: nowrap; /* Prevent separator from breaking lines */
      }
    `;
  }

  // Declare the properties and state variables with their types
  // Provide a default value here as a fallback if no paramNames are ever provided
  paramNames: string[] = [];
  private _segments: Segment[] = [];

  // Bound method for event listener to maintain 'this' context
  private _updateSegmentsBound: () => void = this._updateSegments.bind(this);

  connectedCallback() {
    super.connectedCallback();
    // Start listening for popstate immediately, it can happen anytime
    window.addEventListener('popstate', this._updateSegmentsBound);
    // DO NOT call _updateSegments() here for initial setup, properties might not be ready
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up the event listener
    window.removeEventListener('popstate', this._updateSegmentsBound);
  }

  // This lifecycle method runs after the element's first update/render
  // and after properties have been set from the initial DOM attributes/properties.
  firstUpdated(changedProperties: any) {
      super.firstUpdated(changedProperties);
      // Call _updateSegments() here for the first time
      this._updateSegments();
  }


  // willUpdate is still a standard lifecycle method, useful for subsequent updates
  willUpdate(changedProperties: any) {
    // Only re-parse if paramNames property itself changes after the first render
    if (changedProperties.has('paramNames')) {
      this._updateSegments();
    }
    // Note: _updateSegments is also called by the popstate listener, handling URL changes
  }

  /**
   * Parses the current window location pathname based on paramNames.
   * Populates the internal _segments state.
   */
  private _updateSegments() {
    // Add a check to ensure paramNames is an array before accessing its length
    if (!Array.isArray(this.paramNames)) {
        console.warn('nav-breadcrumb: paramNames property is not an array.', this.paramNames);
        this._segments = []; // Clear segments if paramNames is invalid
        return;
    }

    const path = window.location.pathname;
    // Split the path, filter out empty strings (e.g., from leading/trailing slashes)
    const parts = path.split('/').filter(Boolean);
    const segments: Segment[] = [];

    // Match path parts with provided paramNames up to the minimum length
    const maxLength = Math.min(parts.length, this.paramNames.length);

    for (let i = 0; i < maxLength; i++) {
      segments.push({
        name: this.paramNames[i],
        value: parts[i],
        index: i // Store the index
      });
    }

    this._segments = segments;
    // Lit automatically requests update when state properties change (defined in static properties)
  }

  /**
   * Handles the click event on a segment.
   * Emits a custom event for the parent to handle navigation.
   */
  private _handleSegmentClick(segment: Segment, index: number) {
    // Do not emit event if it's the last segment (current page)
    if (index === this._segments.length - 1) {
      return;
    }

    // Create a custom event.
    // detail contains information about the clicked segment and the path up to that point.
    const event = new CustomEvent('segment-click', {
      detail: {
        name: segment.name,
        value: segment.value,
        index: index,
        // Reconstruct the path string up to the clicked segment (useful for routing)
        path: '/' + this._segments.slice(0, index + 1).map(s => s.value).join('/')
      },
      bubbles: true, // Allow the event to bubble up the DOM tree
      composed: true // Allow the event to pass through the shadow DOM boundary
    });

    // Dispatch the event
    this.dispatchEvent(event);

    console.log(`Segment clicked:`, segment, `Emitted 'segment-click' event with detail:`, event.detail); // For debugging
  }

  render() {
    // Add a check for _segments being an array before checking length, just in case
    if (!Array.isArray(this._segments) || this._segments.length === 0) {
      return html``; // Render nothing if no segments match paramNames or _segments isn't an array
    }

    return html`
      <div class="breadcrumb">
        ${this._segments.map((segment, index) => html`
          ${index > 0 ? html`<span class="separator">></span>` : ''}
          <span
            class="segment ${index < this._segments.length - 1 ? 'clickable' : ''}"
            @click="${() => this._handleSegmentClick(segment, index)}"
             aria-label="Navigate to ${segment.name}: ${segment.value}"
             role="link"
             ?tabindex="${index < this._segments.length - 1 ? 0 : -1}" <!-- Make clickable segments focusable -->
          >
            ${segment.value}
          </span>
        `)}
      </div>
    `;
  }
}

// Register the custom element WITHOUT the @customElement decorator
customElements.define('nav-breadcrumb', NavBreadcrumb);