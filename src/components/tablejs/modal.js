import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js'; // Para atributos opcionales
import { map } from 'lit/directives/map.js';
import { classMap } from 'lit/directives/class-map.js';
function safeParse(value) {
  try {
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      return value;
    }

    if (typeof value === 'string' && (value.trim().startsWith('{') || value.trim().startsWith('['))) {
      try {
        return JSON.parse(value);
      } catch (error) {
        const fixedJson = value
          .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":')
          .replace(/:\s*'([^']+)'/g, ': "$1"');

        return JSON.parse(fixedJson);
      }
    }

    return value;
  } catch (error) {
    console.error("Error al parsear JSON:", error, "Valor recibido:", value);
    return value;
  }
}

export class CDlg extends LitElement {
  static get properties() {
    return {
      title: { type: String, reflect: true },
      description: { type: String, reflect: true },
      theme: { type: String, reflect: true },
      options: { type: Array },
    };
  }

  constructor() {
    super();
    this.title = '';
    this.description = '';
    this.theme = 'light';
    this.options = [];
  }

  static get styles() {
    return css`
      :host {
        --dlg-padding: 1.5rem;
        --dlg-border-radius: 8px;
        --dlg-font-family: system-ui, -apple-system, sans-serif;
        --dlg-title-size: 1.5rem;
        --dlg-title-weight: 600;
        --dlg-desc-size: 1rem;
        --dlg-desc-opacity: 0.8;
        --dlg-desc-max-height: 500px;
        --dlg-button-padding: 0.5rem 1rem;
        --dlg-button-radius: 4px;
        --dlg-button-font-size: 0.875rem;
        --dlg-options-gap: 0.5rem;
        --dlg-slot-margin-top: 1rem;
        --dlg-transition-speed: 0.2s;

        --dlg-text-color: #1a1a1a;
        --dlg-border-color: #e5e5e5;
        --dlg-bg-color: #ffffff;
        --dlg-button-cancel-bg: #e5e5e5;
        --dlg-button-cancel-text: #1a1a1a;
        --dlg-button-cancel-hover-bg: #d9d9d9;

        --dlg-dark-text-color: #ffffff;
        --dlg-dark-border-color: #333333;
        --dlg-dark-bg-color: #2a2a2a;
        --dlg-dark-button-cancel-bg: #444444;
        --dlg-dark-button-cancel-text: #ffffff;
        --dlg-dark-button-cancel-hover-bg: #555555;

        --dlg-button-save-bg: #007bff;
        --dlg-button-save-text: white;
        --dlg-button-save-hover-bg: #0056b3;
        --dlg-button-delete-bg: #dc3545;
        --dlg-button-delete-text: white;
        --dlg-button-delete-hover-bg: #bd2130;

        display: block;
        font-family: var(--dlg-font-family);
      }

      .container {
        padding: var(--dlg-padding);
        border-radius: var(--dlg-border-radius);
        transition: background-color var(--dlg-transition-speed) ease, border-color var(--dlg-transition-speed) ease, color var(--dlg-transition-speed) ease;
        border: 1px solid var(--dlg-border-color);
        background-color: var(--dlg-bg-color);
        color: var(--dlg-text-color);
      }

      .container.dark {
        border-color: var(--dlg-dark-border-color);
        background-color: var(--dlg-dark-bg-color);
        color: var(--dlg-dark-text-color);
      }

      .title {
        font-size: var(--dlg-title-size);
        font-weight: var(--dlg-title-weight);
        margin: 0 0 0.5rem 0;
      }

      .description {
        font-size: var(--dlg-desc-size);
        opacity: var(--dlg-desc-opacity);
        max-height: var(--dlg-desc-max-height);
        overflow-y: auto;
        margin: 0 0 1rem 0;
        white-space: pre-wrap;
        word-wrap: break-word;
      }

      .options {
        display: flex;
        gap: var(--dlg-options-gap);
        flex-wrap: wrap;
        margin-top: var(--dlg-padding);
        justify-content: flex-end;
      }

      ::slotted(*) {
        display: block;
        margin-top: var(--dlg-slot-margin-top);
        margin-bottom: var(--dlg-slot-margin-top);
      }

      button {
        padding: var(--dlg-button-padding);
        border-radius: var(--dlg-button-radius);
        border: none;
        cursor: pointer;
        font-size: var(--dlg-button-font-size);
        font-family: inherit;
        transition: background-color var(--dlg-transition-speed) ease, opacity var(--dlg-transition-speed) ease;
        background-color: transparent;
        color: inherit;
        border: 1px solid transparent;
      }

      button:hover {
         opacity: 0.85;
      }

      .save-btn {
        background-color: var(--dlg-button-save-bg);
        color: var(--dlg-button-save-text);
        border-color: var(--dlg-button-save-bg);
      }
      .save-btn:hover {
        background-color: var(--dlg-button-save-hover-bg);
        border-color: var(--dlg-button-save-hover-bg);
        opacity: 1;
      }

      .cancel-btn {
        background-color: var(--dlg-button-cancel-bg);
        color: var(--dlg-button-cancel-text);
        border-color: var(--dlg-button-cancel-bg);
      }
      .cancel-btn:hover {
        background-color: var(--dlg-button-cancel-hover-bg);
        border-color: var(--dlg-button-cancel-hover-bg);
        opacity: 1;
      }
      .container.dark .cancel-btn {
        background-color: var(--dlg-dark-button-cancel-bg);
        color: var(--dlg-dark-button-cancel-text);
        border-color: var(--dlg-dark-button-cancel-bg);
      }
      .container.dark .cancel-btn:hover {
        background-color: var(--dlg-dark-button-cancel-hover-bg);
        border-color: var(--dlg-dark-button-cancel-hover-bg);
      }

      .delete-btn {
        background-color: var(--dlg-button-delete-bg);
        color: var(--dlg-button-delete-text);
        border-color: var(--dlg-button-delete-bg);
      }
      .delete-btn:hover {
        background-color: var(--dlg-button-delete-hover-bg);
        border-color: var(--dlg-button-delete-hover-bg);
        opacity: 1;
      }
    `;
  }

  render() {
    return html`
      <div class="container ${this.theme}">
        <h2 class="title">${this.title}</h2>
        <pre class="description">${this.description}</pre>
        <slot></slot>
        <div class="options">
          ${this.options.map((opt, i) => 
            html`<button 
              @click=${(e) => this._handleOptionClick(e, i)}
              data-index="${i}"
              class="${opt.class || ''}"
              style="${opt.style || ''}"
            >${opt.label}</button>`
          )}
        </div>
      </div>
    `;
  }

  _handleOptionClick(e, index) {
    if (this.options[index]?.callback && typeof this.options[index].callback === 'function') {
      this.options[index].callback(e);
    } else {
      console.warn(`No valid callback found for option index ${index}`);
    }
  }
}

export class DlgCont extends LitElement {
  static get properties() {
    return {
      visible: { type: Boolean, reflect: true },
      required: { type: Boolean, reflect: true }
    };
  }

  constructor() {
    super();
    this.visible = false;
    this.required = false;
  }

  static get styles() {
    return css`
      :host {
        --dlg-overlay-bg: rgba(0, 0, 0, 0.5);
        --dlg-z-index: 1000;
        --dlg-transition-duration: 0.3s;
        --dlg-content-max-height: 90dvh;
        --dlg-content-border-radius: 16px;
        --dlg-content-padding: 8px;
        --dlg-content-bg: inherit;
        --dlg-content-color: inherit;

        display: block;
        background: inherit;
        color: inherit;
      }

      .dlg-ov {
        position: fixed;
        inset: 0;
        background-color: var(--dlg-overlay-bg);

        display: flex;
        align-items: center;
        justify-content: center;

        z-index: var(--dlg-z-index);

        opacity: 0;
        visibility: hidden;

        transition: opacity var(--dlg-transition-duration) ease,
                    visibility var(--dlg-transition-duration) ease;
      }

      .dlg-cnt {
        max-height: var(--dlg-content-max-height);
        overflow-y: auto;

        background: var(--dlg-content-bg);
        color: var(--dlg-content-color);
        border-radius: var(--dlg-content-border-radius);
        padding: var(--dlg-content-padding);

        transform: scale(0.95);
        transition: transform var(--dlg-transition-duration) ease;
        transition-property: transform;
      }

      .dlg-ov.visible {
        opacity: 1;
        visibility: visible;
      }

      .dlg-ov.visible .dlg-cnt {
        transform: scale(1);
      }
    `;
  }

  render() {
    return html`
      <div class="dlg-ov ${this.visible ? 'visible' : ''}" @click="${this._handleOverlayClick}">
        <div class="dlg-cnt">
          <slot></slot>
        </div>
      </div>
    `;
  }

  _handleOverlayClick(e) {
    if (e.target === e.currentTarget && !this.required) {
      console.log("Overlay click event:", e.target === e.currentTarget,this.required);
      this.hide();
    }
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}



export class CInp extends LitElement {
  static get properties() {
    return {
      type: { type: String, reflect: true },
      id: { type: String, reflect: true },
      name: { type: String, reflect: true },
      // Usamos .value para la propiedad interna, puede ser de cualquier tipo
      value: { type: String }, // El atributo será string, la propiedad puede ser otra cosa
      placeholder: { type: String, reflect: true },
      disabled: { type: Boolean, reflect: true },
      readonly: { type: Boolean, reflect: true },
      darkmode: { type: Boolean, reflect: true },
      // Es mejor manejar options como Array internamente
      options: { type: Array },
      required: { type: Boolean, reflect: true },
      title: { type: String, reflect: true },
      pattern: { type: String, reflect: true },
      _isValid: { type: Boolean, state: true }, // Estado interno para la validez
      _internalValue: { state: true },
      multiple: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    this.type = 'text';
    // Valores por defecto
    this.disabled = false;
    this.readonly = false;
    this.darkmode = false;
    this.options = []; // Inicializar como array vacío
    this.required = false;
    this._isValid = true;
    this.value = ''; // Inicializa value como string vacío
    this._internalValue = ''; // Y el valor interno también
    // id, name, placeholder, title, pattern se inicializan como undefined por defecto
  }

    // Método para manejar cuando el atributo 'options' (string) cambia
    attributeChangedCallback(name, oldVal, newVal) {
        super.attributeChangedCallback(name, oldVal, newVal);
        if (name === 'options' && newVal !== oldVal && typeof newVal === 'string') {
            try {
                this.options = safeParse(newVal); // Parsea el string a Array
            } catch (e) {
                console.error(`Error parsing options attribute for c-inp [${this.id || this.name}]:`, e);
                this.options = []; // Resetea a array vacío en caso de error
            }
        }
        // Actualizar valor interno si 'value' cambia desde el exterior
        if (name === 'value' && newVal !== oldVal) {
             this._internalValue = this._parseValueForInternal(newVal);
        }
    }

   // Hook para actualizar el valor interno cuando la propiedad 'value' cambia
   willUpdate(changedProperties) {
      if (changedProperties.has('value')) {
          // ¡Importante! Adaptar parseo para multiple si value puede ser un array o JSON string
          this._internalValue = this._parseValueForInternal(this.value);
      }
      // Si 'multiple' cambia, quizás necesites convertir el valor interno
      if (changedProperties.has('multiple')) {
          const oldMultiple = changedProperties.get('multiple');
          if (this.multiple && !oldMultiple && !Array.isArray(this._internalValue)) {
              // Cambiando a multiple: convierte valor a array si no lo es
              this._internalValue = (this._internalValue !== null && this._internalValue !== undefined && this._internalValue !== '') ? [String(this._internalValue)] : [];
          } else if (!this.multiple && oldMultiple && Array.isArray(this._internalValue)) {
              // Cambiando a single: toma el primer valor o vacío
              this._internalValue = this._internalValue.length > 0 ? this._internalValue[0] : '';
          }
      }
  }


  _parseValueForInternal(val) {
    if (this.multiple && this.type === 'select') {
        if (Array.isArray(val)) {
            return val.map(String); // Asegura que sean strings
        }
        if (typeof val === 'string') {
            // Intenta parsear si es JSON string o separada por comas, etc.
            // O simplemente trátalo como si fuera una selección única inicial
            try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed.map(String) : [];
            } catch (e) {
                // Si no es JSON, ¿es una sola selección inicial?
                // O considera una convención como 'val1,val2'
                return val ? [String(val)] : []; // Ejemplo simple: un solo valor inicial
            }
        }
        return []; // Default a array vacío
    }
    // ... (tu lógica existente para otros tipos)
    if (this.type === 'checkbox' || this.type === 'switch' || this.type === 'boolean') {
        return String(val).toLowerCase() === 'true';
    }
    if (this.type === 'number') {
        return (val === '' || val === null || val === undefined) ? null : Number(val);
    }
    return val ?? '';
  }


  static get styles() {
    // Tus estilos (con variables CSS mejoradas para defaults)
    return css`
      :host {
        display: block;
        margin: 0.5rem;
        padding: 0.5rem;
        color-scheme: light dark;
        /* Define variables default aquí para que se puedan sobreescribir */
        --inp-border-color: #ccc;
        --inp-disabled-bg: #f5f5f5;
        --inp-disabled-color: #888;
        --inp-slider-bg: #ccc;
        --inp-slider-knob: white;
      }
      :host([darkmode]) {
         /* Sobreescribe variables para dark mode */
        --inp-border-color: #555;
        --inp-disabled-bg: #222;
        --inp-disabled-color: #666;
        --inp-slider-bg: #555;
        --inp-slider-knob: #888;
      }

      /* Elimina el padding del host para que el contenedor interno lo controle */
      :host { padding: 0; }
      .inp-cont {
        display: flex;
        flex-direction: column;
        padding: 0.5rem; /* Mueve el padding aquí */
      }
       label { /* Estilo para mejor alineación de radios/checkboxes */
           display: inline-flex;
           align-items: center;
           margin-right: 10px;
           cursor: pointer;
       }

      input, textarea, select {
        padding: 0.5rem;
        border: 1px solid var(--inp-border-color); /* Usa la variable */
        border-radius: 4px;
        font-size: 14px;
        background-color: inherit;
        color: inherit;
        box-sizing: border-box; /* Importante para consistencia de tamaño */
        margin: 0; /* Resetea márgenes por defecto */
      }
      option {
        color: slategray;
        background-color: #fff;
        text-indent: 0;
      }
      textarea { resize: vertical; min-height: 80px; } /* Ajustado min-height */

      input:disabled, textarea:disabled, select:disabled {
        background-color: var(--inp-disabled-bg); /* Usa la variable */
        cursor: not-allowed;
        color: var(--inp-disabled-color); /* Usa la variable */
        border: 1px solid var(--inp-disabled-color); /* Usa la variable */
      }
      input:read-only, textarea:read-only  {
        background-color: var(--inp-disabled-bg); /* Usa la variable */
        cursor: not-allowed;
        color: var(--inp-disabled-color); /* Usa la variable */
      }

      .sw { position: relative; display: inline-block; width: 60px; height: 30px; }
      .sw input { opacity: 0; width: 0; height: 0; }
      .sldr { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--inp-slider-bg); transition: .4s; border-radius: 34px; }
      .sldr:before { position: absolute; content: ""; height: 22px; width: 22px; left: 4px; bottom: 4px; background-color: var(--inp-slider-knob); transition: .4s; border-radius: 50%; }
      input:checked + .sldr { background-color: #2196F3; }
      input:checked + .sldr:before { transform: translateX(28px); }
      input:not(:read-only):focus,
      textarea:not(:read-only):focus,
      select:focus {
        outline: none;
        border-color: #2196F3;
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
        cursor: auto; /* Reestablece el cursor */
      }
      input:focus,
      textarea:focus,
      select:focus {
        outline: none; /* Elimina el contorno predeterminado del navegador */
      }
      select option:checked {
        background-color: rgb(0, 171, 255);
        color: white;             /* Might work in SOME browsers/OS, often ignored */
        font-weight: bold;        /* Often ignored */
      }
      /* Aplica estilo inválido directamente al host o a un contenedor */
      :host([invalid]) .input-element {
         border-color: red !important; /* Usa !important con cuidado, o aumenta especificidad */
         box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.2) !important;
      }
      /* Opcional: estilo para el host inválido */
       :host([invalid]) {
          /* Puedes añadir un borde al propio host si quieres */
          /* outline: 1px solid red; */
       }
    `;
  }

  render() {
    // El form ya no es necesario para la validación directa del input,
    // pero lo mantenemos por si se quiere usar el evento submit.
    // Añadimos el atributo 'invalid' al host basado en _isValid
    this.toggleAttribute('invalid', !this._isValid);

    return html`
      <form class="val-form" @submit="${this._handleSubmit}" novalidate>
        <div class="inp-cont">
          ${this._renderInput()}
        </div>
        <!-- Botón submit oculto si quieres habilitar submit con Enter -->
         <button type="submit" style="display: none;"></button>
      </form>
    `;
  }

  _renderInput() {
    // Usa ifDefined para atributos opcionales como pattern y title
    // Usa .value=${this._internalValue} para binding de propiedad (más robusto)
    // Usa ?checked para booleanos
    // Añade clase 'input-element' para targetear el estilo inválido
    const commonInputClass = 'input-element';

    switch (this.type) {
      case 'textarea':
        return html`<textarea
          class=${commonInputClass}
          id=${ifDefined(this.id)}
          name=${ifDefined(this.name)}
          .value=${this._internalValue ?? ''}
          placeholder=${ifDefined(this.placeholder)}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?required=${this.required}
          title=${ifDefined(this.title)}
          pattern=${ifDefined(this.pattern)}
          @input=${this._handleInputChange}
          @change=${this._handleInputChange}
        ></textarea>`;

      case 'checkbox':
      case 'switch':
      case 'boolean':
        return html`
          <label class="sw">
            <input
              class=${commonInputClass}
              type="checkbox"
              id=${ifDefined(this.id)}
              name=${ifDefined(this.name)}
              .checked=${Boolean(this._internalValue)}
              ?disabled=${this.disabled}
              ?readonly=${this.readonly}
              ?required=${this.required}
              title=${ifDefined(this.title)}
              @change=${this._handleInputChange}
            >
            <span class="sldr"></span>
          </label>`;

      case 'select':
        console.log(this.multiple, this._internalValue);
        return html`
      <select
        class=${commonInputClass}
        id=${ifDefined(this.id)}
        name=${ifDefined(this.name)}
        .value=${!this.multiple ? (this._internalValue ?? '') : undefined}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?required=${this.required}
        title=${ifDefined(this.title)}
        @change=${this._handleInputChange}
        ?multiple=${this.multiple}
      >
        ${this.options.map(opt => {
          // Add a log here for debugging inside the map
          const isSelected = this.multiple
            ? Array.isArray(this._internalValue) && this._internalValue.includes(String(opt.value))
            : String(opt.value) == String(this._internalValue ?? '');
          // console.log(`Option ${opt.value}, multiple: ${this.multiple}, internalValue: ${JSON.stringify(this._internalValue)}, isSelected: ${isSelected}`); // DEBUG LINE
          return html`
            <option
              value=${opt.value}
              ?selected=${isSelected}
            >${opt.label}</option>
          `;
        })}
      </select>`;

      case 'radio':
         // Los radios individuales no necesitan la clase 'input-element'
         // La validación (required) se aplica al grupo por el name
         // El estado inválido se manejaría en el host
        return html`
          ${this.options.map(opt => html`
            <label>
              <input type="radio"
                id=${`${this.id || this.name}_${opt.value}`}
                name=${ifDefined(this.name)}
                value=${opt.value}
                .checked=${opt.value == this._internalValue}
                ?disabled=${this.disabled}
                ?readonly=${this.readonly}
                ?required=${this.required}
                title=${ifDefined(this.title)}
                @change=${this._handleInputChange}
              >
              ${opt.label}
            </label>
          `)}
        `;

      default: // text, email, number, password, etc.
        return html`
          <input
            class=${commonInputClass}
            type=${this.type === 'string' ? 'text' : this.type}
            id=${ifDefined(this.id)}
            name=${ifDefined(this.name)}
            .value=${this._internalValue ?? ''}
            placeholder=${ifDefined(this.placeholder)}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            ?required=${this.required}
            title=${ifDefined(this.title)}
            pattern=${ifDefined(this.pattern)}
            @input=${this._handleInputChange}
            @change=${this._handleInputChange}
          >`;
    }
  }

  // --- Métodos Principales ---

  _handleInputChange(evt) {
    const inputElement = evt.target;
    let newValue;

    if (this.type === 'select' && this.multiple) {
        // --- Lógica para MULTISELECT ---
        newValue = Array.from(inputElement.selectedOptions).map(option => option.value);
    } else if (this.type === 'radio') {
        // ... (tu lógica de radio)
        const checkedRadio = this.shadowRoot.querySelector(`input[name="${this.name}"]:checked`);
        newValue = checkedRadio ? checkedRadio.value : null; // Mantén null si no hay selección
    } else if (inputElement.type === 'checkbox') {
        // ... (tu lógica de checkbox)
        newValue = inputElement.checked;
    } else {
        // --- Lógica para otros inputs (incluido select simple) ---
        newValue = inputElement.value;
    }

    // Actualiza el valor interno primero
    this._internalValue = this._parseValueForInternal(newValue);
    // Actualiza la propiedad pública 'value' (como string para el atributo)
    this.value = (newValue === null || newValue === undefined) ? '' : String(newValue);


    this.dispatchEvent(new CustomEvent('change', {
      detail: { id: this.id, name: this.name, value: this._internalValue }, // Envía el valor interno (potencialmente tipado)
      bubbles: true,
      composed: true
    }));

    // Valida DESPUÉS de actualizar el valor
    this.isValid();
  }

  _handleSubmit(e) {
    e.preventDefault();
    // Vuelve a validar en el submit por si acaso
    if (this.isValid()) {
      this.dispatchEvent(new CustomEvent('form-submit', {
        detail: { id: this.id, name: this.name, value: this.getVal() },
        bubbles: true,
        composed: true
      }));
    } else {
        // Opcional: Forzar reporte de validación nativo si se quiere
         const input = this._getInternalInputElement();
         input?.reportValidity();
    }
  }

  /** Obtiene el elemento de input interno principal */
  _getInternalInputElement() {
      // Para radio, no hay un único input "principal"
      if (this.type === 'radio') return null;
      return this.shadowRoot.querySelector('.input-element'); // Usa la clase común
  }

  /** Devuelve el valor actual (potencialmente tipado) */
  getVal() {
    // Devuelve el valor interno que ya está parseado
    return this._internalValue;
  }

  /** Verifica la validez del input interno */
  isValid() {
    let valid = true; // Asume válido por defecto
    const inputElement = this._getInternalInputElement();

    if (inputElement) {
        // Usa la validación nativa del propio input
        valid = inputElement.checkValidity();
    } else if (this.type === 'radio' && this.required) {
        // Validación especial para radio buttons requeridos
        const checkedRadio = this.shadowRoot.querySelector(`input[name="${this.name}"]:checked`);
        valid = checkedRadio !== null; // Es válido si alguno está seleccionado
    }
    // Podrías añadir validaciones personalizadas aquí si fuera necesario

    // Actualiza el estado interno (esto disparará el cambio de clase en render)
    this._isValid = valid;

    // console.log(`isValid [${this.id || this.name}]: ${valid}`); // Descomenta para debug
    return valid;
  }


  /** Establece el valor del input */
  setVal(val) {
      this._internalValue = this._parseValueForInternal(val);
      this.value = (val === null || val === undefined) ? '' : String(val);
      // La actualización del input visual ocurrirá en el siguiente ciclo de render
      // porque _internalValue cambió.
      this.requestUpdate(); // Asegura que se repinte si es necesario
      // Valida después de un pequeño delay para asegurar que el DOM se actualizó
      setTimeout(() => this.isValid(), 0);
  }

  /** Resetea el input a su valor por defecto (vacío o false) */
  reset() {
    let defaultVal = '';
     if (this.type === 'checkbox' || this.type === 'switch' || this.type === 'boolean') {
         defaultVal = false;
     } else if (this.type === 'radio') {
          // Desmarcar todos los radios del grupo
         const radioInputs = this.shadowRoot.querySelectorAll(`input[name="${this.name}"]`);
         radioInputs.forEach(r => r.checked = false);
          defaultVal = null; // El valor efectivo es null si ninguno está marcado
     }
    this.setVal(defaultVal);
  }

  /** Establece las opciones para select/radio (espera un Array) */
  setOpts(opts) {
    if (['select', 'radio'].includes(this.type)) {
      this.options = Array.isArray(opts) ? opts : []; // Asegura que sea un array
    }
  }

  /** Obtiene el valor seleccionado en un select */
  getSelOpt() {
    if (this.type === 'select') {
      const select = this._getInternalInputElement();
      return select ? select.value : null;
    }
    return null;
  }
}


customElements.define('c-dlg', CDlg);
customElements.define('dlg-cont', DlgCont);
customElements.define('c-inp', CInp);
class ObjEditFrm extends LitElement {
  static styles = css`
      /* Tus estilos existentes */
      :host {
          display: block; font-family: sans-serif; padding: 15px;
          border: 1px solid #eee; border-radius: 8px;
          background-color: #f9f9f9; margin-bottom: 15px;
      }
      .ef-cont { display: flex; flex-direction: column; gap: 15px; }
      .flds-cont {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 10px 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;
      }
      .fld-wrp { display: flex; flex-direction: column; gap: 4px; }
      label { font-weight: 500; font-size: 0.9em; color: #333; text-transform: capitalize; }
      c-inp { margin: 0; padding: 0; }
      .fld-wrp.inv label { color: #dc3545; }
      .acts { display: flex; justify-content: flex-end; gap: 10px; }
      button {
          padding: 8px 16px; cursor: pointer; border: 1px solid #ccc;
          border-radius: 4px; font-size: 0.95em; transition: all 0.2s;
          background-color: #fff;
      }
      button:hover { filter: brightness(0.95); }
      .sv-btn { background-color: #28a745; color: white; border-color: #28a745; }
      .sv-btn:hover { background-color: #218838; border-color: #1e7e34; }
      .cncl-btn { background-color: #6c757d; color: white; border-color: #6c757d; }
      .cncl-btn:hover { background-color: #5a6268; border-color: #545b62; }
      :host([darkmode]) { background-color: #333; border-color: #555; }
      :host([darkmode]) label { color: #eee; }
      :host([darkmode]) .flds-cont { border-bottom-color: #555; }
      :host([darkmode]) button { background-color: #555; border-color: #777; color: #eee; }
      :host([darkmode]) button:hover { filter: brightness(1.1); }
      :host([darkmode]) c-inp { color-scheme: dark; }

      /* NUEVO: Estilo para ocultar el wrapper del campo */
      .fld-wrp.hidden { display: none; }
  `;

  static properties = {
      itm: { type: Object },
      fCfg: { type: Object },
      cActs: { type: Array },
      darkmode: { type: Boolean, reflect: true },
      _iItm: { state: true },
      _cItm: { state: true },
  };

  constructor() {
      super();
      this.itm = {};
      this._iItm = {};
      this._cItm = {};
      this.fCfg = {};
      this.cActs = [];
      this.darkmode = false;
  }

  willUpdate(changedProperties) {
      if (changedProperties.has('itm')) {
          const newItemCopy = this._deepCopy(this.itm);
          // Solo actualiza si el nuevo item es diferente al actual _cItm
          // Evita bucles si el padre pasa el mismo objeto modificado
          if (JSON.stringify(newItemCopy) !== JSON.stringify(this._cItm)) {
               this._cItm = newItemCopy;
               this._iItm = this._deepCopy(newItemCopy);
               // console.log('ObjEditFrm: willUpdate updated _cItm from itm prop', this._cItm);
          }
      }
  }

  _deepCopy(o) {
      try { return JSON.parse(JSON.stringify(o || {})); }
      catch (e) { console.error('Err deep copy', e); return {}; }
  }

  setConfig(itm = {}, cfg = {}) {
      this.itm = this._deepCopy(itm);
      this.fCfg = cfg || {};
      this.requestUpdate();
  }

  setItem(itm = {}) {
      this.itm = this._deepCopy(itm);
      this.requestUpdate();
  }

  addAct(nm, lbl, cls = '') {
      if (!nm || typeof nm !== 'string' || typeof lbl !== 'string') return;
      this.cActs = [...this.cActs.filter(a => a.nm !== nm), { nm, lbl, cls }];
  }

  validate() {
      let ok = true;
      this.shadowRoot.querySelectorAll('c-inp').forEach(f => {
          const wrp = f.closest('.fld-wrp');
          // *** NUEVO: No validar campos ocultos ***
          if (wrp?.classList.contains('hidden')) {
              wrp?.classList.remove('inv'); // Asegura que no quede marcado como inválido si se oculta
              return;
          }

          let fOk = true;
          if (typeof f.isValid === 'function') fOk = f.isValid();
          else { /* ... fallback ... */ }
          wrp?.classList.toggle('inv', !fOk);
          if (!fOk) ok = false;
      });
      return ok;
  }

  getData() {
      return this._deepCopy(this._cItm);
  }

  reset() {
      this._cItm = this._deepCopy(this._iItm);
      this.requestUpdate();
      this.shadowRoot.querySelectorAll('.fld-wrp.inv').forEach(wrp => wrp.classList.remove('inv'));
       // Limpiar validación de todos los campos (incluso los que ahora estarán ocultos)
       this.shadowRoot.querySelectorAll('c-inp').forEach(f => {
           if(typeof f.isValid === 'function') f.isValid(); // Re-evalúa para quitar error visual si aplica
       });
  }

  _hInpChg(e) {
      if (e.target.tagName !== 'C-INP') return;
      let n, v;
      if (e.detail?.name !== undefined) ({ name: n, value: v } = e.detail);
      else { /* ... fallback ... */
           n = e.target.name;
           if (n && typeof e.target.getVal === 'function') v = e.target.getVal();
      }

      if (n !== undefined) {
           // Comprobar si el valor realmente cambió para evitar re-renders innecesarios
           if (this._cItm[n] !== v) {
              this._cItm = { ...this._cItm, [n]: v };
              // console.log('ObjEditFrm: _cItm updated by input change:', this._cItm);
              // Solo despachar evento si el valor cambió
              this.dispatchEvent(new CustomEvent('fld-chg', { detail: { n, v } }));
           }
           // Siempre limpiar error visual al interactuar
           e.target.closest('.fld-wrp')?.classList.remove('inv');
      }
      console.log("Input:", n, "Value:", v);
  }

  _hSub(e) { e.preventDefault(); this._hSave(); }
  _hActClk(e) { /* ... sin cambios ... */
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === 'save') { /* handled by submit */ }
      else if (act === 'cancel') {
          this.dispatchEvent(new CustomEvent('cancel-edit'));
          this.reset();
      } else {
          this.dispatchEvent(new CustomEvent(act, { detail: this.getData() }));
      }
  }
  _hSave() { /* ... sin cambios ... */
      if (this.validate()) {
          const d = this.getData();
          this._iItm = this._deepCopy(d); // Update initial state on successful save
          this.dispatchEvent(new CustomEvent('save-item', { detail: d }));
      } else {
          const fInv = this.shadowRoot.querySelector('.fld-wrp:not(.hidden).inv c-inp'); // Enfocar primer inválido VISIBLE
          if (fInv) {
              try {
                  if (typeof fInv.focus === 'function') fInv.focus();
                  else fInv.shadowRoot?.querySelector('input, select, textarea')?.focus();
              } catch (e) { console.warn('Cant focus inv fld', e); }
          }
      }
  }

  // --- NUEVO: Helper para comparar valores (maneja booleanos y strings) ---
  _compareValues(actual, expected) {
      if (typeof expected === 'boolean') {
          // Convierte actual a booleano de forma segura ('false', 0, null, undefined son false)
          const actualBool = !(['false', '0', '', null, undefined].includes(String(actual).toLowerCase()) || !actual);
          return actualBool === expected;
      }
       if (actual === null || actual === undefined) {
          return expected === null || expected === undefined || expected === '';
      }
      // Comparación como strings para otros casos (select, radio, text)
      return String(actual) === String(expected);
  }

  // --- NUEVO: Helper para determinar visibilidad ---
    _shouldFieldBeVisible(key, config) {
      const condition = config.showIf;
      if (!condition || !condition.field) {
          return true; // Visible si no hay condición válida
      }

      const triggerField = condition.field;
      const triggerValue = this._cItm?.[triggerField];
      const requiredValue = condition.value;
      const negateCondition = condition.negate === true; // Verifica si se debe negar

      let matchesCondition; // Resultado de la comparación (igualdad)

      if (Array.isArray(requiredValue)) {
          // Verdadero si triggerValue coincide con ALGUNO de los valores requeridos
          matchesCondition = requiredValue.some(val => this._compareValues(triggerValue, val));
      } else {
          // Verdadero si triggerValue coincide con el valor requerido único
          matchesCondition = this._compareValues(triggerValue, requiredValue);
      }

      // Si negate es true, la visibilidad es lo opuesto a la coincidencia
      // Si negate es false, la visibilidad es igual a la coincidencia
      const shouldBeVisible = negateCondition ? !matchesCondition : matchesCondition;

      // console.log(`Field: ${key}, Trigger: ${triggerField}=${triggerValue}, Required: ${JSON.stringify(requiredValue)}, Negate: ${negateCondition}, Matches: ${matchesCondition}, Visible: ${shouldBeVisible}`);

      return shouldBeVisible;
  }


  render() {
      return html`
          <form class="ef-cont" @submit=${this._hSub} novalidate>
              <div class="flds-cont">
                  ${map(Object.entries(this.fCfg || {}), ([k, c]) => {
                      if (c.hidden) return ''; // Sigue respetando hidden global

                      // *** NUEVO: Determinar visibilidad y aplicar clase ***
                      const isVisible = this._shouldFieldBeVisible(k, c);
                      const wrapperClasses = {
                          'fld-wrp': true,
                          hidden: !isVisible
                      };

                      const id = `ef-${k}-${Date.now()}`;
                      const val = this._cItm?.[k];
                      // let valueToPass = val; // c-inp debería manejar tipos via .value

                      // *** NUEVO: Hacer 'required' condicional si el campo es visible ***
                      const isRequired = c.required && isVisible;

                      return html`
                          <div class=${classMap(wrapperClasses)}> 
                              <label for=${id}>${c.label || k}</label>
                              <c-inp
                                  id=${id}
                                  name=${k}
                                  type=${c.type || 'text'}
                                  .value=${val} 
                                  placeholder=${ifDefined(c.placeholder)}
                                  ?required=${isRequired} 
                                  ?disabled=${c.disabled}
                                  ?readonly=${c.readonly}
                                  pattern=${ifDefined(c.pattern)}
                                  title=${ifDefined(c.title)}
                                  min=${ifDefined(c.min)}
                                  max=${ifDefined(c.max)}
                                  step=${ifDefined(c.step)}
                                  rows=${ifDefined(c.rows)}
                                  cols=${ifDefined(c.cols)}
                                  ?multiple=${c.multiple}
                                  .options=${(c.type === 'select' || c.type === 'radio') && Array.isArray(c.options) ? c.options : undefined}
                                  ?darkmode=${this.darkmode}
                                  @change=${this._hInpChg}
                              ></c-inp>
                          </div>
                      `;
                  })}
              </div>
              <div class="acts" @click=${this._hActClk}>
                  <button type="button" class="cncl-btn" data-act="cancel">Cancel</button>
                  <button type="submit" class="sv-btn" data-act="save">Save</button>
                  ${map(this.cActs || [], act => html`
                      <button type="button" data-act=${act.nm} class=${ifDefined(act.cls)}>${act.lbl}</button>
                  `)}
              </div>
          </form>
      `;
  }
}
customElements.define('obj-edit-frm', ObjEditFrm);


class DynObjDisp extends LitElement {
   static styles = css`
      /* Estilos (sin cambios) */
      :host { display: block; font-family: sans-serif; margin-bottom: 15px; }
      .dyn-cont { position: relative; }
      .d-card {
          background-color: #fff; border: 1px solid #eee; border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08); overflow: hidden;
          display: flex; flex-direction: column; transition: box-shadow 0.2s;
      }
      :host([darkmode]) .d-card { background-color: #333; border-color: #555; color: #eee; }
      .d-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
      :host([darkmode]) .d-card:hover { box-shadow: 0 2px 8px rgba(255,255,255,0.1); }
      .d-hdr {
          background-color: #f5f5f5; padding: 12px 16px; font-weight: bold;
          border-bottom: 1px solid #eee; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
      }
      :host([darkmode]) .d-hdr { background-color: #444; border-bottom-color: #555; }
      .d-cont {
          padding: 16px; flex-grow: 1; display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px 15px;
      }
      .d-prop { margin-bottom: 8px; display: flex; flex-direction: column; gap: 2px; }
      .d-prop-lbl {
          font-weight: 500; color: #666; font-size: 0.8em;
          text-transform: capitalize; margin-bottom: 2px;
      }
      :host([darkmode]) .d-prop-lbl { color: #bbb; }
      .d-prop-val { word-break: break-word; font-size: 0.95em; }
      .d-prop-val[data-type="boolean"], .d-prop-val[data-type="switch"], .d-prop-val[data-type="checkbox"] {
          font-style: italic; color: #333;
      }
      :host([darkmode]) .d-prop-val[data-type="boolean"], :host([darkmode]) .d-prop-val[data-type="switch"], :host([darkmode]) .d-prop-val[data-type="checkbox"] {
           color: #ddd;
      }
      .d-acts {
          padding: 10px 16px; display: flex; justify-content: flex-end;
          gap: 8px; background-color: #fafafa; border-top: 1px solid #eee;
      }
      :host([darkmode]) .d-acts { background-color: #3a3a3a; border-top-color: #555; }
      .d-acts button {
          padding: 6px 12px; cursor: pointer; border: 1px solid #ccc;
          border-radius: 4px; font-size: 0.9em; transition: all 0.2s;
          background-color: #fff;
      }
      .d-acts button:hover { filter: brightness(0.95); }
      :host([darkmode]) .d-acts button { background-color: #555; border-color: #777; color: #eee; }
      :host([darkmode]) .d-acts button:hover { filter: brightness(1.1); }
      .ed-btn { background-color: #CCE5FF; border-color: #b8daff; color: #004085; }
      .del-btn { background-color: #F8D7DA; color: #721c24; border-color: #f5c6cb; }
      :host([darkmode]) .ed-btn { background-color: #0056b3; border-color: #0056b3; color: white; }
      :host([darkmode]) .del-btn { background-color: #b81c2c; border-color: #b81c2c; color: white; }
      obj-edit-frm { display: block; }
  `;

  static properties = {
      mode: { type: String }, // display | edit
      itm: { type: Object },
      fCfg: { type: Object },
      hdrKey: { type: String, attribute: 'hdr-key', reflect: true },
      cActs: { type: Array }, // display mode actions
      darkmode: { type: Boolean, reflect: true },
  };

  constructor() {
      super();
      this.mode = 'display';
      this.itm = {};
      this.fCfg = {};
      // Revisa si quieres el botón delete por defecto o si se añade externamente
      this.cActs = [
           { nm: 'delete', lbl: 'Eliminar', cls: 'del-btn' }
      ];
      this.darkmode = false;
  }

  _deepCopy(o) {
      try { return JSON.parse(JSON.stringify(o || {})); }
      catch (e) { console.error('Err deep copy', e); return {}; }
  }

  setConfig(i = {}, f = {}) {
      this.itm = this._deepCopy(i);
      this.fCfg = f || {};
      this.mode = 'display';
  }

  setItem(i = {}) {
      this.itm = this._deepCopy(i);
       if (this.mode === 'edit') {
          this.requestUpdate();
      }
  }

  addAct(nm, lbl, cls = '') {
      if (!nm || typeof nm !== 'string' || typeof lbl !== 'string') return;
      this.cActs = [...this.cActs.filter(a => a.nm !== nm), { nm, lbl, cls }];
  }
  hideAct(nm) {
    this.hiddenAct(nm);
  }
  hiddenAct(nm) { // Corregido nombre función
      if (!nm || typeof nm !== 'string') return;
      this.cActs = this.cActs.filter(a => a.nm !== nm);
  }

  _formatVal(v, c) {
      const typ = c.type || 'text';
      if (typ === 'boolean' || typ === 'switch' || typ === 'checkbox') {
          return Boolean(v) ? (c.trueLabel || 'Yes') : (c.falseLabel || 'No');
      } else if (typ === 'select' && Array.isArray(c.options)) {
          const opt = c.options.find(o => String(o.value) === String(v));
          return opt ? opt.label : (v ?? '');
      }
      return (v === undefined || v === null) ? '' : String(v);
  }

  _hDispActClk(e) {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const act = btn.dataset.act;
      const detail = this._deepCopy(this.itm);

      if (act === 'edit') {
          this.mode = 'edit';
      } else if (act === 'delete') {
          this.dispatchEvent(new CustomEvent('del-item', { detail }));
      } else {
          this.dispatchEvent(new CustomEvent(act, { detail }));
      }
  }

  _hSave(e) {
      this.itm = this._deepCopy(e.detail);
      this.dispatchEvent(new CustomEvent('item-upd', { detail: this._deepCopy(this.itm) }));
      this.mode = 'display';
  }

  _hCancel() {
      this.mode = 'display';
  }
  _compareValues(actual, expected) {
    if (typeof expected === 'boolean') {
        const actualBool = !(['false', '0', '', null, undefined].includes(String(actual).toLowerCase()) || !actual);
        return actualBool === expected;
    }
     if (actual === null || actual === undefined) {
        return expected === null || expected === undefined || expected === '';
    }
    return String(actual) === String(expected);
}

// --- Helper de visibilidad (duplicado o importado/compartido) ---
 _shouldFieldBeVisible(key, config, currentItem) { // Recibe el item actual
    const condition = config.showIf;
    if (!condition || !condition.field) {
        return true;
    }
    const triggerField = condition.field;
    const triggerValue = currentItem?.[triggerField]; // Usa el item pasado
    const requiredValue = condition.value;
    const negateCondition = condition.negate === true;

    let matchesCondition;
    if (Array.isArray(requiredValue)) {
        matchesCondition = requiredValue.some(val => this._compareValues(triggerValue, val));
    } else {
        matchesCondition = this._compareValues(triggerValue, requiredValue);
    }
    return negateCondition ? !matchesCondition : matchesCondition;
}
  _renderDisp() {
    const hdr = this.hdrKey && this.itm[this.hdrKey] !== undefined ? this.itm[this.hdrKey] : null;
    return html`
        <div class="d-card">
            ${hdr !== null ? html`<div class="d-hdr">${hdr}</div>` : ''}
            <div class="d-cont">
                ${map(Object.entries(this.fCfg || {}), ([k, c]) => {
                    // *** Aplicar lógica de visibilidad también en display ***
                    const isVisible = this._shouldFieldBeVisible(k, c, this.itm);

                    if (c.hidden || k === this.hdrKey || !isVisible) return ''; // Ocultar si no es visible

                    return html`
                        <div class="d-prop">
                            <div class="d-prop-lbl">${c.label || k}</div>
                            <div class="d-prop-val" data-type=${c.type || 'text'}>${this._formatVal(this.itm[k], c)}</div>
                        </div>
                    `;
                })}
            </div>
            <div class="d-acts" @click=${this._hDispActClk}>
                 <button type="button" class="ed-btn" data-act="edit">Edit</button>
                 ${map(this.cActs || [], act => html`
                    <button type="button" data-act=${act.nm} class=${ifDefined(act.cls)}>${act.lbl}</button>
                 `)}
            </div>
        </div>
    `;
}

  _renderEdit() {
      return html`
          <obj-edit-frm
              .fCfg=${this.fCfg}
              .itm=${this.itm}
              .cActs=${[]}
              ?darkmode=${this.darkmode}
              @save-item=${this._hSave}
              @cancel-edit=${this._hCancel}
          ></obj-edit-frm>
      `;
  }

  render() {
      if (!this.itm || !this.fCfg || Object.keys(this.fCfg).length === 0) {
          return html`<p>No item/config.</p>`;
      }
      return html`
          <div class="dyn-cont">
              ${this.mode === 'display' ? this._renderDisp() : this._renderEdit()}
          </div>
      `;
  }
}
customElements.define('dyn-obj-disp', DynObjDisp);
