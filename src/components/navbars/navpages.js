import { LitElement, html, css } from 'lit';

// Define the component class
export class NavBreadcrumb extends LitElement {

  // Define reactive properties and state using the static properties getter
  static get properties() {
    return {
      /**
       * Array of names corresponding to the path segments to display.
       * e.g., ['level1', 'level2', 'id'] for a path like /products/category/123
       * Defaults to an empty array.
       */
      paramNames: { type: Array, default: [] }, // Use default instead of class field

      /**
       * The number of segments from the end that should not be clickable/navigable.
       * Defaults to 1 (disabling the last segment). Set to 0 for all segments clickable.
       */
      disabledSegmentsFromEnd: { type: Number, default: 1 }, // Use default instead of class field

      /**
       * Internal state holding the parsed segments to display.
       * Marked as state, initialized in constructor.
       */
      _segments: { state: true } // Mark as state, remove class field
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
      /* Base style for all segments */
      .segment {
        margin: 0 4px; /* Space around segments */
        white-space: nowrap; /* Prevent segments from breaking lines */
      }

      /* Style for clickable segments (links) */
      .segment:not(.disabled) {
        cursor: pointer;
        color: #007bff; /* Standard link color */
        text-decoration: none;
      }
      .segment:not(.disabled):hover {
        text-decoration: underline;
      }
      .segment:not(.disabled):active {
         color: #0056b3; /* Darker color when active */
      }

      .segment:first-child {
          margin-left: 0; /* No left margin on the first one */
      }

      /* Style for disabled (non-clickable) segments */
      .segment.disabled {
        cursor: default;
        color: #555; /* Less prominent color */
        text-decoration: none; /* Ensure no underline */
        font-weight: bold; /* Optionally make it bold */
        pointer-events: none; /* Prevent click events completely */
      }

      .separator {
        margin: 0 4px; /* Space around separator */
        color: #555;
        white-space: nowrap; /* Prevent separator from breaking lines */
      }
    `;
  }

  // Initialize state in the constructor BEFORE super(), as recommended
  constructor() {
    super();
    // Initialize state properties defined with { state: true }
    this._segments = [];
     // Bound method for event listener to maintain 'this' context
    this._updateSegmentsBound = this._updateSegments.bind(this);
  }


  connectedCallback() {
    super.connectedCallback();
    // Start listening for popstate immediately
    window.addEventListener('popstate', this._updateSegmentsBound);
    // Initial call to _updateSegments is done in firstUpdated
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up the event listener
    window.removeEventListener('popstate', this._updateSegmentsBound);
  }

  // This lifecycle method runs after the element's first update/render
  // and after properties have been set from the initial DOM attributes/properties.
  firstUpdated(changedProperties) {
      super.firstUpdated(changedProperties);
      // Call _updateSegments() here for the first time, after properties are ready
      this._updateSegments();
  }

  // willUpdate is still a standard lifecycle method, useful for reacting to property changes
  willUpdate(changedProperties) {
    // Only re-parse segments if the paramNames property itself changes
    // This ensures that if paramNames updates AFTER the first render,
    // the segments are re-calculated based on the new paramNames and current URL.
    if (changedProperties.has('paramNames')) {
      this._updateSegments();
    }
    // Note: _updateSegments is also called by the popstate listener for URL changes
    // Changes to disabledSegmentsFromEnd automatically cause a re-render,
    // and the render method correctly uses the new value.
  }

  /**
   * Parses the current window location pathname based on paramNames.
   * Populates the internal _segments state.
   */
   _updateSegments() {
    // Access paramNames using 'this', it's now reactive via Lit
    if (!Array.isArray(this.paramNames)) {
        console.warn('nav-breadcrumb: paramNames property is not an array.', this.paramNames);
        this._segments = []; // Clear segments if paramNames is invalid
        return;
    }

    const path = window.location.pathname;
    // Split the path, filter out empty strings (e.g., from leading/trailing slashes)
    const parts = path.split('/').filter(Boolean);
    const segments = [];

    // Match path parts with provided paramNames up to the minimum length
    const maxLength = Math.min(parts.length, this.paramNames.length);

    for (let i = 0; i < maxLength; i++) {
      segments.push({
        name: this.paramNames[i],
        value: parts[i],
        index: i // Store the index
      });
    }

    // Assign to _segments. Lit detects this change because _segments is { state: true }
    this._segments = segments;
  }

  render() {
    // Access _segments using 'this', it's now reactive via Lit
    // Access disabledSegmentsFromEnd using 'this', it's now reactive via Lit
    if (!Array.isArray(this._segments) || this._segments.length === 0) {
      return html``; // Render nothing if no segments
    }

    const numSegments = this._segments.length;
    // Ensure disabledSegmentsFromEnd is treated as a number and isn't negative
    const numDisabled = Math.max(0, this.disabledSegmentsFromEnd || 0); // Handle potential non-numeric or null values

    return html`
      <div class="breadcrumb" aria-label="Breadcrumb">
        ${this._segments.map((segment, index) => {
            // Determine if the segment should be clickable based on disabledSegmentsFromEnd
            const isClickable = index < numSegments - numDisabled;
            // Construct the path up to this segment's index
            const segmentPath = '/' + this._segments.slice(0, index + 1).map(s => s.value).join('/');

            return html`
                ${index > 0 ? html`<span class="separator" aria-hidden="true">/</span>` : ''}
                ${isClickable
                    ? html`
                        <a
                            class="segment"
                            href="${segmentPath}"
                            @click=${(e) => { // Add a click handler to prevent default and use pushState
                                e.preventDefault(); // Prevent full page reload
                                window.history.pushState({}, '', segmentPath);
                                // Manually trigger segment update after history change
                                this._updateSegments();
                            }}
                            aria-label="Navigate to ${segment.name}: ${segment.value}"
                        >
                            ${segment.value}
                        </a>
                      `
                    : html`
                         <span
                           class="segment disabled"
                           aria-current="${index === numSegments - 1 ? 'page' : null}"
                           aria-label="${segment.name}: ${segment.value}"
                           tabindex="-1"
                         >
                           ${segment.value}
                         </span>
                      `
                }
            `;
        })}
      </div>
    `;
  }
}

customElements.define('nav-breadcrumb', NavBreadcrumb);