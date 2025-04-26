import { html, css, LitElement, CSSResult } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
import { repeat } from 'lit/directives/repeat.js';


export class BaseRecoveryCodeInput extends LitElement {
  length: number;
  allowedChars: 'numeric' | 'alphanumeric';
  label: string;
  disabled: boolean;
  private _selectedIndices: Set<number> = new Set();
  private _code: string[];
  private _inputs: HTMLInputElement[];
  validationState: 'default' | 'loading' | 'correct' | 'incorrect';
  private _originallyDisabled: boolean;
  private _selectionAnchorIndex: number | null = null;
  static get properties() {
    return {
      length: { type: Number },
      allowedChars: { type: String, attribute: 'allowed-chars' },
      label: { type: String },
      disabled: { type: Boolean, reflect: true },
      _code: { type: Array, state: true },
      _inputs: { state: false },
      validationState: { type: String, reflect: true, attribute: 'validation-state' },
      _originallyDisabled: { state: false },
      _selectedIndices: { type: Set, state: true },
      _selectionAnchorIndex: { type: Number, state: true },
    };
    }

  static get styles(): CSSResult {
    return css`
            :host {
                display: inline-block;
                --rc-b-c: var(--rc-b-c-l, 1px solid #28a745);
                --rc-b-i: var(--rc-b-i-l, 1px solid #dc3545);
                --rc-b-l: var(--rc-b-l-l, 1px solid #ccc);
                --rc-g: var(--rc-g-l, 8px);
                --rc-w: var(--rc-w-l, 40px);
                --rc-h: var(--rc-h-l, 50px);
                --rc-fs: var(--rc-fs-l, 1.5em);
                --rc-b: var(--rc-b-l, 1px solid #ccc);
                --rc-br: var(--rc-br-l, 4px);
                --rc-bf: var(--rc-bf-l, 1px solid #007bff);
                --rc-bff: var(--rc-bf-l, 1px solid  #007baf);
                --rc-ta: var(--rc-ta-l, center);
                --rc-cc: var(--rc-cc-l, auto);
                --rc-dbg: var(--rc-dbg-l, #e9ecef);
                --rc-dop: var(--rc-dop-l, 0.7);
            }

            .w {
                display: flex;
                gap: var(--rc-g);
                outline: none;
            }

            input {
                width: var(--rc-w);
                height: var(--rc-h);
                font-size: var(--rc-fs);
                text-align: var(--rc-ta);
                border: var(--rc-b);
                border-radius: var(--rc-br);
                padding: 0; margin: 0; box-sizing: border-box;
                caret-color: var(--rc-cc);
                transition: border-color 0.2s ease-in-out, background-color 0.2s ease-in-out;
                outline: none;
            }

            :host([validation-state="correct"]) input {
                border: var(--rc-b-c);
            }
            :host([validation-state="correct"]) input:focus {
                 border: var(--rc-b-c);
            }

            :host([validation-state="incorrect"]) input {
                border: var(--rc-b-i);
            }
            :host([validation-state="incorrect"]) input:focus {
                 border: var(--rc-b-i);
            }

            :host(:not([validation-state])) input:focus,
            :host([validation-state="default"]) input:focus {
                border: var(--rc-bf);
            }
            .selected {
              border:  var(--rc-bff);
            }
            input:disabled {
                background-color: var(--rc-dbg);
                opacity: var(--rc-dop);
                cursor: not-allowed;
                border-color: #ced4da;
            }
        `;
  }

  constructor() {
    super();
    this.length = 6;
    this.allowedChars = 'numeric';
    this.label = 'Código de Verificación';
    this.disabled = false;
    this._code = Array(this.length).fill('');
    this._inputs = [];
    this.validationState = 'default';
    this._originallyDisabled = this.disabled;
    this._selectedIndices = new Set(); // Initialize state
    this._selectionAnchorIndex = null; // Initialize state
  }

  willUpdate(changedProperties: PropertyValues<this>): void {
    // Note: super.willUpdate() is generally not needed unless extending another LitElement base class that uses it.
    if (changedProperties.has('length')) {
      this._updateCodeArray();
      this._clearSelectionState(); // Clear selection if length changes
    }

    // Handle validation state changes and associated disabled state
    if (changedProperties.has('validationState')) {
      const oldState = changedProperties.get('validationState') as 'default' | 'loading' | 'correct' | 'incorrect';
      if (this.validationState === 'loading') {
        if (oldState !== 'loading') {
          this._originallyDisabled = this.disabled;
        }
        this.disabled = true;
      } else if (oldState === 'loading') {
        this.disabled = this._originallyDisabled;
      }
    }

    // Handle external changes to 'disabled' property
    if (changedProperties.has('disabled')) {
      if (this.validationState === 'loading') {
        // If disabled changes externally *while* loading, update the stored original state
        // But keep the component effectively disabled because it's loading
        this._originallyDisabled = this.disabled;
        this.disabled = true;
      } else {
        // If disabled changes when not loading, update the baseline
        this._originallyDisabled = this.disabled;
        if (this.disabled) {
          // If component becomes disabled, clear any selection
          this._clearSelectionState();
        }
      }
    }
  }


  firstUpdated(): void {
    this._inputs = Array.from(this.renderRoot.querySelectorAll('input'));
    this._originallyDisabled = this.disabled; // Capture initial disabled state
  }

  updated(changedProperties: PropertyValues<this>): void {
    // Note: super.updated() is generally not needed unless extending another LitElement base class that uses it.
    if (changedProperties.has('length')) {
        // Query inputs again after render if length changed
        this._inputs = Array.from(this.renderRoot.querySelectorAll('input'));
    }
    // If the selection indices change, explicitly trigger the visual update
    // This might be slightly redundant if a full re-render happens, but ensures consistency.
    if (changedProperties.has('_selectedIndices' as keyof BaseRecoveryCodeInput)) {
        this._updateSelectionVisuals();
    }
    // If disabled state changes, ensure visuals are correct
    if (changedProperties.has('disabled')) {
        this._updateSelectionVisuals(); // Disabled inputs shouldn't show as selected
    }
  }



  /**
   * Sets the validation/loading state of the component.
   * @param newState - The new state to apply.
   */
  setState(newState: 'default' | 'loading' | 'correct' | 'incorrect'): void {
    const validStates: ('default' | 'loading' | 'correct' | 'incorrect')[] = ['default', 'loading', 'correct', 'incorrect'];
    if (validStates.includes(newState)) {
      this.validationState = newState;
    } else {
      console.warn(`RecoveryCodeInput: Invalid state "${newState}". Using "default".`);
      this.validationState = 'default';
    }
  }


  reset(): void {
    this.clear(); // Clear the value
    this.setState('default'); // Reset visual/logical state
  }

  // --- Public API (Existing) ---
  clear(): void {
    this._code = Array(this.length).fill('');
    this._inputs.forEach(input => input.value = '');
    this._clearSelectionState(); // Also clear selection on reset/clear
    this._notifyChange();
    if (!this.disabled && this._inputs.length > 0) {
       this._inputs[0]?.focus();
    }
}



  // --- Internal Logic ---
  private _updateCodeArray(): void {
    const currentCode = this._code?.join('') || ''; // Handle potential initial undefined
    const newCode = Array(this.length).fill('');
    for (let i = 0; i < Math.min(this.length, currentCode.length); i++) {
      newCode[i] = currentCode[i];
    }
    // Only assign if different to avoid unnecessary updates
    if (this._code?.join('') !== newCode.join('')) {
      this._code = newCode;
    }
  }

  get value(): string {
    return this._code.join('');
  }

  private _getPattern(): string {
    return this.allowedChars === 'numeric' ? '[0-9]' : '[A-Za-z0-9]';
  }

  private _getRegexFilter(): RegExp {
    return this.allowedChars === 'numeric' ? /[^0-9]/g : /[^A-Za-z0-9]/g;
  }

  private _handleInput(e: InputEvent, index: number): void {
    if (this.disabled) return;

    // Any direct input clears selection
    this._clearSelectionState();
    if (this.validationState === 'correct' || this.validationState === 'incorrect') {
        this.setState('default');
    }

    const input = e.target as HTMLInputElement;
    let value = input.value;
    value = value.replace(this._getRegexFilter(), '').toUpperCase().slice(0, 1);
    input.value = value; // Update visual

    // Update internal state if changed
    if (this._code[index] !== value) {
        const newCode = [...this._code];
        newCode[index] = value;
        this._code = newCode; // State update triggers re-render
        this._notifyChange();
    }

    // Auto-focus next
    if (value && index < this.length - 1) {
        this._inputs[index + 1]?.focus();
    }

    this._checkCompletion();
}

private _handleKeydown(e: KeyboardEvent, index: number): void {
  if (this.disabled && e.key !== 'Tab') return;

  const hasSelection = this._selectedIndices.size > 0;
  // --- Meta Keys (Ctrl+A) ---
  if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!this.disabled) {
        this._selectAllInputs();
        // colocamos el focus en el primer input
      this._inputs[0]?.focus();
      }
      return;
  }
  //_handlePaste -- Meta Keys (Ctrl+V) ---
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    if (index > 0) this._inputs[index - 1]?.focus();
} else if (e.key === 'ArrowRight') {
    e.preventDefault();
    if (index < this.length - 1) this._inputs[index + 1]?.focus();
}
  // --- Delete/Backspace ---
  if (e.key) {
      if (this.disabled) return;

      if (this.validationState === 'correct' || this.validationState === 'incorrect') {
          this.setState('default');
      }

      if (hasSelection) {
        if ((e.ctrlKey || e.metaKey)){
          return;
        }
          e.preventDefault();
          this._clearSelectedInputs(e.key); // Use the corrected method
      } else {
          // Original single-input logic
          const input = e.target as HTMLInputElement;
          if (e.key === 'Backspace') {
              if (!input.value && index > 0) {
                  e.preventDefault();
                  this._inputs[index - 1]?.focus();
              } else if (input.value) {
                  // If value exists, backspace will clear it. Let _handleInput manage state.
                  // Ensure state is updated if value becomes empty
                  if (this._code[index] !== '') {
                       const newCode = [...this._code];
                       newCode[index] = '';
                       this._code = newCode; // Trigger update
                       this._notifyChange();
                  }
              }
          } else if (e.key === 'Delete' && input.value) {
               if (this._code[index] !== '') {
                   const newCode = [...this._code];
                   newCode[index] = '';
                   this._code = newCode; // Trigger update
                   this._notifyChange();
               }
              // No focus change on delete
          }
      }
      return; // Handled delete/backspace
  }

  // --- Clear selection on typing or non-modifier navigation ---
  const isModifier = e.shiftKey || e.ctrlKey || e.metaKey || e.altKey;
  const isNavigation = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key);
  const isChar = e.key.length === 1;

  if (hasSelection && !isModifier && (isChar || isNavigation)) {
       this._clearSelectionState();
  }

  // --- Arrow Navigation ---

}


  private _selectAllInputs(): void {
    if (this.disabled) return;
    const newSelectedIndices = new Set<number>();
    for (let i = 0; i < this.length; i++) {
      newSelectedIndices.add(i);
    }
    // Assigning a new Set triggers the update
    this._selectedIndices = newSelectedIndices;
    this._selectionAnchorIndex = 0; // Set anchor
    
}


  private _hasSelectedInputs(): boolean {
    return this._inputs.some(input =>
      input.selectionStart !== input.selectionEnd ||
      document.activeElement === input
    );
  }

  private _clearSelectedInputs(inputString?: string): void {
    // If disabled or no selection, there's nothing to clear or type over.
    // This method is only called from _handleKeydown when hasSelection is true.
    if (this.disabled || this._selectedIndices.size === 0) {
        return;
    }

    // Determine if a character should be inserted after clearing
    const isCharacterToInsert = inputString && inputString.length === 1 && inputString !== ' ' && inputString.toLowerCase() !== 'backspace';
    let sanitizedChar = '';
    if (isCharacterToInsert) {
        sanitizedChar = inputString.replace(this._getRegexFilter(), '').toUpperCase().slice(0, 1);
    }

    const newCode = [...this._code];
    let changed = false;
    let firstClearedIndex = this.length; // Index of the first input that was cleared

    // 1. Clear the content of all selected inputs
    // Iterate over the *internal* selection state (sorted indices for predictable focus)
    const sortedSelectedIndices = Array.from(this._selectedIndices).sort((a, b) => a - b);

    sortedSelectedIndices.forEach(index => {
        if (newCode[index] !== '') {
            newCode[index] = '';
            changed = true;
        }
        if (this._inputs[index]) {
            this._inputs[index].value = ''; // Clear visual input
        }
        // The first index in the sorted list is the first cleared index
        if (firstClearedIndex === this.length) {
             firstClearedIndex = index;
        }
    });

    // Determine the index where focus should go *after* the operation
    let focusIndex = firstClearedIndex; // Default focus is the first cleared input

    // 2. If a valid character was provided, insert it into the first cleared input
    // Only insert if there was at least one input cleared (i.e., firstClearedIndex is not this.length)
    if (sanitizedChar && firstClearedIndex < this.length) {
        const insertIndex = firstClearedIndex; // Insert at the first cleared position
        if (newCode[insertIndex] !== sanitizedChar) {
            newCode[insertIndex] = sanitizedChar;
            changed = true;
        }
        if (this._inputs[insertIndex]) {
            this._inputs[insertIndex].value = sanitizedChar; // Update visual
        }
        // Focus the next input after insertion
        focusIndex = insertIndex + 1;
    }

    // 3. Clear the selection state *after* using it
    const hadSelection = this._selectedIndices.size > 0; // Check before clearing state
    this._selectedIndices = new Set();
    this._selectionAnchorIndex = null;

    // 4. Update state and notify if changes occurred
    if (changed) {
        this._code = newCode; // Update internal code state (triggers update)
        this._notifyChange();
    }

    // 5. Set focus
    // Ensure focus index is within bounds.
    // If focusIndex is >= length, focus the last input.
    const finalFocusIndex = Math.min(focusIndex, this.length - 1);

    if (hadSelection && this.length > 0) { // Only attempt focus if there was a selection and inputs exist
         setTimeout(() => {
             // Ensure the calculated index is valid before focusing
             if (finalFocusIndex >= 0) { // finalFocusIndex will be at most length - 1 due to Math.min
                 this._inputs[finalFocusIndex]?.focus();
             }
         }, 0);
    } else {
      this._inputs[0]?.focus();
    }

    // Check completion after potential insertion
    if (sanitizedChar) {
        this._checkCompletion();
    }

}

  private _handleFocus(e: FocusEvent, index: number): void {
    const input = e.target as HTMLInputElement;
    input.select();
    if (this._selectionAnchorIndex === null || !this._selectedIndices.has(index)) {

    }
  }

  private _handlePaste(e: ClipboardEvent, startIndex: number): void {
    const hasSelection = this._selectedIndices.size > 0
    // Reset state on paste
    if (this.validationState === 'correct' || this.validationState === 'incorrect') {
      this.setState('default');
    }
    e.preventDefault();
    const pastedData = e.clipboardData?.getData('text') || '';
    if (!pastedData || this.disabled) return;

    const sanitized = pastedData.replace(this._getRegexFilter(), '').toUpperCase();
    let currentInputIndex = startIndex;
    const newCode = [...this._code];
    let changed = false;

    for (let i = 0; i < sanitized.length && currentInputIndex < this.length; i++) {
      const char = sanitized[i];
      if (newCode[currentInputIndex] !== char) {
        newCode[currentInputIndex] = char;
        if (this._inputs[currentInputIndex]) {
          this._inputs[currentInputIndex].value = char;
        }
        changed = true;
      }
      currentInputIndex++;
    }

    if (changed) {
      this._code = newCode;
      this._notifyChange();
    }

    const focusIndex = Math.min(currentInputIndex, this.length - 1);
    // Use setTimeout to allow the DOM to update before focusing
    setTimeout(() => {
      this._inputs[focusIndex]?.focus();
      this._inputs[focusIndex]?.select();
    }, 0);

    this._checkCompletion();
  }

  private _notifyChange(): void {
    this._emitE('code-change', { value: this.value });
    this._emitE('change', { value: this.value });
  }

  private _checkCompletion(): void {
    if (this.value.length === this.length && this.validationState !== 'loading') {
      this._emitE('code-complete', { value: this.value });
      this._emitE('submit', { value: this.value });
    }
  }

  private _emitE(name: string, data: any): void {
    this.dispatchEvent(new CustomEvent(name, {
      detail: data,
      bubbles: true,
      composed: true
    }));
  }

  // --- Render ---
  render(): TemplateResult {
    const indices = Array.from({ length: this.length }, (_, i) => i);
    // Input type should generally be 'text' for better compatibility with patterns and non-numeric chars
    // inputmode provides the keyboard hint.
    const inputType = 'text'; //'tel'; // 'tel' can sometimes be better for OTPs
    const inputMode = this.allowedChars === 'numeric' ? 'numeric' : 'text';
    const isInvalid = this.validationState === 'incorrect';
    const isLoading = this.validationState === 'loading';

    return html`
          <div
              class="w"
              role="group"
              aria-label=${this.label || `Código de verificación de ${this.length} dígitos`}
              aria-busy=${isLoading ? 'true' : 'false'}
              aria-disabled=${this.disabled ? 'true' : 'false'}
          >
              ${repeat(
      indices,
      (index) => index, // Key function
      (index) => html`
                      <input
                          part="input input-${index}"
                          class=${this._selectedIndices.has(index) ? 'selected' : ''}
                          type="${inputType}"
                          inputmode="${inputMode}"
                          pattern="${this._getPattern()}"
                          maxlength="1"
                          aria-label=${`Dígito ${index + 1} de ${this.length}${this._selectedIndices.has(index) ? ', seleccionado' : ''}`}
                          aria-invalid=${isInvalid ? 'true' : 'false'}
                          .value=${this._code[index] ?? ''}
                          ?disabled=${this.disabled}
                          @input=${(e: InputEvent) => this._handleInput(e, index)}
                          @keydown=${(e: KeyboardEvent) => this._handleKeydown(e, index)}
                          @focus=${(e: FocusEvent) => this._handleFocus(e, index)}
                          @paste=${(e: ClipboardEvent) => this._handlePaste(e, index)}
                          @mousedown=${(e: MouseEvent) => this._handleMouseDown(e, index)}
                          autocomplete="one-time-code"
                      />
                  `
    )}
          </div>
      `;
  }

  private _handleMouseDown(e: MouseEvent, index: number): void {
    if (this.disabled) return;

    if (e.shiftKey && this._selectionAnchorIndex !== null) {
        e.preventDefault(); // Prevent default text selection drag behavior

        const start = Math.min(this._selectionAnchorIndex, index);
        const end = Math.max(this._selectionAnchorIndex, index);
        const newSelectedIndices = new Set<number>();
        for (let i = start; i <= end; i++) {
            newSelectedIndices.add(i);
        }
        // Assigning the new set triggers state update and re-render
        this._selectedIndices = newSelectedIndices;
        // Focus will naturally go to the clicked element (index) due to the click itself.

    } else {
        // Regular click (no shift or no anchor) - clear existing selection
        this._clearSelectionState(); // Clears indices and anchor, triggers update
        // Set the anchor for potential future shift-clicks/drags
        this._selectionAnchorIndex = index; // Triggers update
        // Focus happens naturally from the click.
    }
}



  private _updateSelectionVisuals(): void {
    if (!this._inputs || this._inputs.length === 0) return; // Guard against calls before firstUpdated
    this._inputs.forEach((input, index) => {
        // Add 'selected' class only if the index is in the set AND the input is not disabled
        if (this._selectedIndices.has(index) && !this.disabled) {
            input.classList.add('selected');
        } else {
            input.classList.remove('selected');
        }
    });
}
private _clearSelectionState(): void {
  // Only update state and visuals if there *was* a selection
  if (this._selectedIndices.size > 0) {
      this._selectedIndices = new Set(); // This assignment triggers Lit update due to state:true
      // No need to call _updateSelectionVisuals directly here,
      // Lit's update cycle triggered by the state change will handle it via updated() or re-render.
  }
  // Only update anchor if it was set
  if (this._selectionAnchorIndex !== null) {
      this._selectionAnchorIndex = null; // This assignment triggers Lit update
  }
}
}
export class StyledRecoveryCodeInput extends BaseRecoveryCodeInput {
  static get styles() {
    return css`
          ${super.styles}
          :host {
              --rc-b-c-l: 2px solid purple;
              --rc-b-i-l: 2px solid orange;
              --rc-g-l: 12px;
              --rc-b-l: 2px solid darkblue;
              --rc-br-l: 0;
              --rc-bf-l: 2px solid skyblue;
              --rc-w-l: 45px;
          }
          input {
              font-weight: bold;
              background-color: rgb(75, 127, 173);
          }
          input:focus {
              background-color: rgb(87, 151, 219);
          }
          :host([validation-state="incorrect"]) input {
              background-color: #fff0f0;
              color: darkred;
          }
          :host([validation-state="correct"]) input {
              background-color: #f0fff0;
              color: darkgreen;
          }
      `;
  }
}

// Define el custom element para la versión estilizada
if (!customElements.get('styled-recovery-code-input')) {
  customElements.define('styled-recovery-code-input', StyledRecoveryCodeInput);
}
// Definir el custom element base
if (!customElements.get('base-recovery-code-input')) {
  customElements.define('base-recovery-code-input', BaseRecoveryCodeInput);
}
declare global {
  interface HTMLElementTagNameMap {
    "styled-recovery-code-input": StyledRecoveryCodeInput,
    'base-recovery-code-input': BaseRecoveryCodeInput
  }
}

