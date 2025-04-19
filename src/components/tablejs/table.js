import { LitElement, html, css } from 'lit';
import { classMap } from 'lit/directives/class-map.js';

class BaseLitElement extends LitElement {
    static properties = {
        data: { type: Array },
        keys: { type: Array },
        actions: { type: Array },
        // NUEVA Propiedad para modo oscuro
        darkMode: { type: Boolean, reflect: true, attribute: 'darkmode' },
    };

    constructor() {
        super();
        this.data = [];
        this.keys = [];
        this.actions = [];
        this.darkMode = false; // Por defecto, modo claro
    }

    // NUEVO Método para cambiar el modo
    toggleDarkMode() {
        this.darkMode = !this.darkMode;
    }

    // ESTILOS ACTUALIZADOS con Variables CSS
    static styles = css`
        :host {
            display: block;

            /* --- Paleta de Colores (Modo Claro por defecto) --- */
            --text-color-primary: #212529;
            --text-color-secondary: #6c757d;
            --text-color-muted: #868e96;
            --text-color-link: #007bff;
            --text-color-success: #198754;
            --text-color-danger: #dc3545;
            --text-color-info-on-light: #004085; /* Texto azul sobre fondo claro */
            --text-color-danger-on-light: #721c24; /* Texto rojo oscuro sobre fondo claro */
            --text-color-light: #f8f9fa; /* Texto claro sobre fondo oscuro */

            --bg-color-primary: #ffffff;
            --bg-color-secondary: #f8f9fa; /* Fondos sutilmente diferentes */
            --bg-color-tertiary: #e9ecef; /* Hover, etc. */
            --bg-color-table-header: #f2f2f2;
            --bg-color-table-even-row: #f9f9f9;
            --bg-color-button: #ffffff;
            --bg-color-button-hover-brightness: 0.95;
            --bg-color-button-alt: #f0f0f0;
            --bg-color-button-alt-hover: #e0e0e0;
            --bg-color-edit: #e7f3ff; /* Fondo azul claro */
            --bg-color-delete: #f8d7da; /* Fondo rojo claro */

            --border-color-primary: #dee2e6; /* Bordes principales */
            --border-color-secondary: #ced4da; /* Bordes secundarios, botones */
            --border-color-table: #ddd; /* Bordes tabla */
            --border-color-edit: #b8daff; /* Borde azul */
            --border-color-delete: #f5c6cb; /* Borde rojo */

            --shadow-color-soft: rgba(0, 0, 0, 0.08);
            --shadow-color-medium: rgba(0, 0, 0, 0.12);

            /* Transiciones comunes */
            --transition-speed: 0.2s;
            --transition-ease: ease-out;
        }

        /* --- Paleta de Colores (Modo Oscuro) --- */
        :host([darkmode]) {
            --text-color-primary: #e9ecef; /* Texto principal claro */
            --text-color-secondary: #adb5bd; /* Texto secundario grisáceo */
            --text-color-muted: #868e96;
            --text-color-link: #64b5f6; /* Azul más brillante */
            --text-color-success: #81c784; /* Verde más brillante */
            --text-color-danger: #ef9a9a; /* Rojo más brillante */
            --text-color-info-on-light: #ffffff; /* Texto blanco sobre fondo azul */
            --text-color-danger-on-light: #ffffff; /* Texto blanco sobre fondo rojo */
            --text-color-light: #e9ecef; /* Igual que el primario */

            --bg-color-primary: #212529; /* Fondo principal oscuro */
            --bg-color-secondary: #343a40; /* Fondo secundario oscuro */
            --bg-color-tertiary: #495057; /* Hover oscuro */
            --bg-color-table-header: #343a40;
            --bg-color-table-even-row: #2c3034;
            --bg-color-button: #495057; /* Botones más oscuros */
            --bg-color-button-hover-brightness: 1.1; /* Aclarar al hacer hover */
            --bg-color-button-alt: #5a6268;
            --bg-color-button-alt-hover: #6c757d;
            --bg-color-edit: #0056b3; /* Fondo azul más oscuro */
            --bg-color-delete: #c82333; /* Fondo rojo más oscuro */

            --border-color-primary: #495057; /* Bordes gris oscuro */
            --border-color-secondary: #6c757d;
            --border-color-table: #454d55;
            --border-color-edit: #004085;
            --border-color-delete: #a71d2a;

            --shadow-color-soft: rgba(255, 255, 255, 0.05);
            --shadow-color-medium: rgba(255, 255, 255, 0.08);
        }

        /* Estilos base que usan las variables */
        .ctr { /* Contenedor base */
            background-color: var(--bg-color-primary);
            color: var(--text-color-primary);
        }
        .no-data {
            padding: 15px;
            text-align: center;
            color: var(--text-color-secondary);
            background-color: var(--bg-color-secondary);
            border-radius: 4px;
        }
        button {
            cursor: pointer;
            margin: 0 4px;
            padding: 4px 8px;
            border: 1px solid var(--border-color-secondary);
            border-radius: 3px;
            font-size: 0.9em;
            background-color: var(--bg-color-button);
            color: var(--text-color-primary); /* Color de texto para botones normales */
            transition: filter var(--transition-speed) var(--transition-ease), background-color var(--transition-speed) var(--transition-ease);
        }
        button:hover {
            /* Usamos filter brightness para modo claro/oscuro, podría ser cambio directo de color */
            filter: brightness(var(--bg-color-button-hover-brightness));
        }
        .edit-btn {
            background-color: var(--bg-color-edit);
            border-color: var(--border-color-edit);
            color: var(--text-color-info-on-light); /* Texto específico para este fondo */
        }
        .delete-btn {
            background-color: var(--bg-color-delete);
            color: var(--text-color-danger-on-light); /* Texto específico para este fondo */
            border-color: var(--border-color-delete);
        }
    `;

    setData(d = [], k = []) {
        // ... (sin cambios)
        if (!Array.isArray(d) || !Array.isArray(k)) {
            console.error(`${this.constructor.name}: data & keys must be arrays.`);
            this.data = []; this.keys = []; return;
        }
        try {
            this.data = JSON.parse(JSON.stringify(d));
        } catch (e) {
            console.error(`${this.constructor.name}: Error copying data`, e);
            this.data = [];
        }
        this.keys = [...k];
    }

    addItem(item) {
        // ... (sin cambios)
        if (!item || typeof item !== 'object') {
            console.error(`${this.constructor.name}: item must be an object.`, item); return;
        }
        try {
            this.data = [...this.data, JSON.parse(JSON.stringify(item))];
        } catch (e) {
            console.error(`${this.constructor.name}: Error copying item`, e);
        }
    }

    addAction(nm, lbl, cls = '') {
        // ... (sin cambios)
        if (typeof nm !== 'string' || !nm || typeof lbl !== 'string') {
            console.error(`${this.constructor.name}: Invalid action (nm, lbl).`); return;
        }
        this.actions = [...this.actions.filter(a => a.name !== nm), { name: nm, label: lbl, className: cls || '' }];
    }

    _emitEv(actNm, idx) {
        // ... (sin cambios internos, pero el evento que dispara sigue igual)
        if (idx < 0 || idx >= this.data.length) {
            console.warn(`${this.constructor.name}: Invalid index ${idx} for action ${actNm}`); return;
        }
        const item = this.data[idx];
        // *** Sigue disparando 'internal-action' ***
        const detail = {
            originalAction: actNm, // Guardamos el nombre real de la acción
            item: JSON.parse(JSON.stringify(item)),
            index: idx
        };
        try {
            this.dispatchEvent(new CustomEvent('internal-action', { // Evento genérico
                detail,
                bubbles: true,
                composed: true
            }));
        } catch (e) { console.error(`${this.constructor.name}: Error dispatching event internal-action`, e); }
    }

    _renderActionButtons(idx) {
        // ... (sin cambios lógicos, los estilos de botón ahora usan variables)
        let acts = [...this.actions];
        if (this.data.length > 0 || this.keys.length > 0) {
            if (!acts.some(a => a.name === 'edit')) acts.unshift({ name: 'edit', label: 'Editar', className: 'edit-btn' });
            if (!acts.some(a => a.name === 'delete')) acts.push({ name: 'delete', label: 'Eliminar', className: 'delete-btn' });
        }
        return acts.map(act => html`
            <button
                class="${act.className || ''} ${act.name === 'edit' ? 'edit-btn' : ''} ${act.name === 'delete' ? 'delete-btn' : ''}"
                @click=${() => this._emitEv(act.name, idx)}>
                ${act.label}
            </button>
        `);
    }

    render() { throw new Error(`${this.constructor.name} must implement render()`); }
}

// ================================================
// Componente ObjectTableLit (Actualizado para usar variables CSS)
// ================================================
class ObjectTableLit extends BaseLitElement {
    static styles = [
        BaseLitElement.styles, // Hereda estilos base Y variables
        css`
            :host {
                border: 1px solid var(--border-color-primary);
                padding: 10px;
                border-radius: 5px;
                /* El fondo y color principal ya vienen de BaseLitElement :host */
            }
            .ctr { overflow-x: auto; }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
                font-size: 0.95em;
            }
            th, td {
                border: 1px solid var(--border-color-table);
                padding: 8px 10px;
                text-align: left;
                vertical-align: middle;
                white-space: nowrap;
                color: var(--text-color-primary); /* Hereda color de texto */
            }
            td.wrap { white-space: normal; }
            th {
                background-color: var(--bg-color-table-header);
                font-weight: 600;
                text-transform: capitalize;
                position: sticky;
                top: 0;
                z-index: 1;
                color: var(--text-color-primary); /* Color para cabeceras */
            }
            tr:nth-child(even) {
                background-color: var(--bg-color-table-even-row);
            }
            tr:hover {
                background-color: var(--bg-color-tertiary); /* Usamos el color de hover genérico */
            }
            .acts-cell {
                width: 1%;
                text-align: center;
                padding: 4px 8px;
            }
            .acts-cell button { margin: 2px; }
        `
    ];

    render() {
        // ... (Render sin cambios lógicos)
        if (!this.data?.length) return html`<div class="no-data">No hay datos.</div>`;
        if (!this.keys?.length) return html`<div class="no-data">No hay claves.</div>`;

        return html`
            <div class="ctr">
                <table>
                    <thead>
                        <tr>
                            ${this.keys.map(k => html`<th>${k}</th>`)}
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.data.map((item, idx) => html`
                            <tr data-idx=${idx}>
                                ${this.keys.map(k => {
            const val = item[k];
            let dVal = (val !== undefined && val !== null) ? String(val) : '';
            if (typeof val === 'boolean') dVal = val ? 'Sí' : 'No';
            // Usamos directamente el texto, el color de TD ya está definido
            return html`<td class="${(typeof val === 'string' && val.length > 50) ? 'wrap' : ''}">${dVal}</td>`;
        })}
                                <td class="acts-cell">
                                    ${this._renderActionButtons(idx)}
                                </td>
                            </tr>
                        `)}
                    </tbody>
                </table>
            </div>
        `;
    }
    // _emitEv ya está en BaseLitElement y dispara 'internal-action'
}
customElements.define('object-table-lit', ObjectTableLit);


// ================================================
// Componente ObjectCardsLit (Actualizado para usar variables CSS)
// ================================================
class ObjectCardsLit extends BaseLitElement {
    static properties = {
        layout: { type: String, reflect: true },
        perRow: { type: Number, attribute: 'per-row', reflect: true },
        hdrKey: { type: String, attribute: 'hdr-key', reflect: true },
    };

    constructor() {
        super();
        this.layout = 'flex';
        this.perRow = 3;
        this.hdrKey = null;
    }

    static styles = [
        BaseLitElement.styles, // Hereda estilos base Y variables
        css`
            :host { --per-row: 3; } /* Se mantiene igual */
            .ctr { display: flex; flex-wrap: wrap; gap: 16px; }
            .ctr.grid { display: grid; grid-template-columns: repeat(var(--per-row, 3), 1fr); }
            /* .no-data ya está estilado en BaseLitElement */
            .card {
                background-color: var(--bg-color-secondary); /* Fondo ligeramente diferente */
                border: 1px solid var(--border-color-primary);
                border-radius: 8px;
                box-shadow: 0 1px 4px var(--shadow-color-soft);
                overflow: hidden;
                transition: transform var(--transition-speed) var(--transition-ease), box-shadow var(--transition-speed) var(--transition-ease);
                display: flex;
                flex-direction: column;
            }
            .ctr:not(.grid) .card { flex: 1 1 calc(33.333% - 11px); min-width: 250px; }
            .card:hover {
                transform: translateY(-3px);
                box-shadow: 0 3px 10px var(--shadow-color-medium);
            }
            .card-hdr {
                background-color: var(--bg-color-tertiary);
                padding: 10px 15px;
                font-weight: 600;
                border-bottom: 1px solid var(--border-color-primary);
                font-size: 1.05em;
                color: var(--text-color-primary); /* Color texto cabecera */
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .card-cnt { padding: 15px; flex-grow: 1; }
            .card-prop { margin-bottom: 10px; display: flex; flex-direction: column; gap: 2px; }
            .card-prop:last-child { margin-bottom: 0; }
            .prop-lbl {
                font-weight: 500;
                color: var(--text-color-muted);
                font-size: 0.8em;
                text-transform: capitalize;
            }
            .prop-val {
                word-break: break-word;
                font-size: 0.95em;
                color: var(--text-color-primary);
            }
            .prop-val.bool-t { font-style: italic; color: var(--text-color-success); } /* Usamos success */
            .prop-val.bool-f { font-style: italic; color: var(--text-color-secondary); } /* Usamos secundario */
            .card-acts {
                padding: 10px 15px;
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                background-color: var(--bg-color-tertiary);
                border-top: 1px solid var(--border-color-primary);
                margin-top: auto;
            }
            .card-acts button {
                padding: 6px 12px;
                 /* Estilos base de botón ya aplicados */
            }
            /* Media queries se mantienen igual */
            @media (max-width: 992px) { .ctr:not(.grid) .card { flex-basis: calc(50% - 8px); } :host { --per-row: 2; } }
            @media (max-width: 576px) { .ctr:not(.grid) .card { flex-basis: 100%; } :host { --per-row: 1; } }
        `
    ];

    updated(changedProperties) {
        // ... (sin cambios)
        if (changedProperties.has('perRow')) {
            this.style.setProperty('--per-row', String(this.perRow || 3));
        }
    }

    render() {
        // ... (Render sin cambios lógicos)
        if (!this.data?.length) return html`<div class="ctr no-data">No hay datos.</div>`;
        if (!this.keys?.length) return html`<div class="ctr no-data">No hay claves.</div>`;

        const ctrClasses = { ctr: true, grid: this.layout === 'grid' };

        return html`
            <div class=${classMap(ctrClasses)}>
                ${this.data.map((item, idx) => html`
                    <div class="card" data-idx=${idx}>
                        ${this.hdrKey && item[this.hdrKey] !== undefined ? html`
                            <div class="card-hdr">${item[this.hdrKey]}</div>
                        ` : ''}
                        <div class="card-cnt">
                            ${this.keys.map(k => {
            if (k === this.hdrKey) return '';
            const val = item[k];
            let dVal = (val !== undefined && val !== null) ? String(val) : '';
            let valCls = 'prop-val';
            if (typeof val === 'boolean') {
                dVal = val ? 'Sí' : 'No';
                valCls += val ? ' bool-t' : ' bool-f';
            }
            return html`
                                    <div class="card-prop">
                                        <div class="prop-lbl">${k}</div>
                                        <div class="${valCls}">${dVal}</div>
                                    </div>
                                `;
        })}
                        </div>
                        <div class="card-acts">
                            ${this._renderActionButtons(idx)}
                        </div>
                    </div>
                `)}
            </div>
        `;
    }
    // _emitEv ya está en BaseLitElement
}
customElements.define('object-cards-lit', ObjectCardsLit);

// ================================================
// Componente ObjectFlexListLit (Actualizado para usar variables CSS)
// ================================================
class ObjectFlexListLit extends BaseLitElement {
    static properties = {
        fDir: { type: String, attribute: 'f-dir', reflect: true },
        fWrap: { type: String, attribute: 'f-wrap', reflect: true },
        jCont: { type: String, attribute: 'j-cont', reflect: true },
        aItems: { type: String, attribute: 'a-items', reflect: true },
    };

    constructor() {
        super();
        this.fDir = 'row';
        this.fWrap = 'wrap';
        this.jCont = 'flex-start';
        this.aItems = 'stretch';
    }

    static styles = [
        BaseLitElement.styles, // Hereda estilos base Y variables
        css`
            .ctr { display: flex; gap: 10px; /* Resto controlado por props/style */ }
            /* .no-data ya estilado en BaseLitElement */
            .flex-item {
                border: 1px solid var(--border-color-secondary); /* Borde secundario */
                border-radius: 4px;
                padding: 12px;
                background-color: var(--bg-color-secondary); /* Fondo secundario */
                flex: 1 1 220px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                box-shadow: 0 1px 2px var(--shadow-color-soft);
                transition: box-shadow var(--transition-speed);
            }
            .flex-item:hover {
                box-shadow: 0 2px 5px var(--shadow-color-medium);
            }
            .item-cnt { flex-grow: 1; display: flex; flex-direction: column; gap: 5px; }
            .item-prop { font-size: 0.9em; display: flex; gap: 5px; line-height: 1.4; }
            .prop-lbl {
                font-weight: 500;
                color: var(--text-color-primary); /* Texto primario */
                text-transform: capitalize;
                white-space: nowrap;
            }
            .prop-lbl::after { content: ":"; margin-left: 2px; }
            .prop-val {
                color: var(--text-color-secondary); /* Texto secundario */
                word-break: break-word;
            }
            .prop-val.bool-t { font-style: italic; color: var(--text-color-success); } /* Color de éxito */
            .prop-val.bool-f { font-style: italic; color: var(--text-color-danger); } /* Color de peligro/negativo */
            .item-acts {
                display: flex;
                justify-content: flex-end;
                gap: 5px;
                margin-top: auto;
                border-top: 1px solid var(--border-color-primary); /* Borde primario */
                padding-top: 10px;
            }
            .item-acts button {
                padding: 4px 8px;
                background-color: var(--bg-color-button-alt); /* Botón alternativo */
                color: var(--text-color-primary); /* Heredado */
                 border-color: var(--border-color-secondary); /* Heredado */
            }
            .item-acts button:hover {
                background-color: var(--bg-color-button-alt-hover);
                filter: none; /* Sobrescribir filtro si lo hubiera */
            }
        `
    ];

    render() {
        // ... (Render sin cambios lógicos)
        if (!this.data?.length) return html`<div class="ctr no-data">No hay datos.</div>`;
        if (!this.keys?.length) return html`<div class="ctr no-data">No hay claves.</div>`;

        const flexSt = `flex-direction:${this.fDir};flex-wrap:${this.fWrap};justify-content:${this.jCont};align-items:${this.aItems};`;

        return html`
            <div class="ctr" style="${flexSt}">
                ${this.data.map((item, idx) => html`
                    <div class="flex-item" data-idx=${idx}>
                        <div class="item-cnt">
                            ${this.keys.map(k => {
            const val = item[k];
            let dVal = (val !== undefined && val !== null) ? String(val) : '';
            let valCls = 'prop-val';
            if (typeof val === 'boolean') {
                dVal = val ? 'Sí' : 'No';
                valCls += val ? ' bool-t' : ' bool-f';
            }
            return html`
                                    <div class="item-prop">
                                        <span class="prop-lbl">${k}</span>
                                        <span class="${valCls}">${dVal}</span>
                                    </div>
                                `;
        })}
                        </div>
                        <div class="item-acts">
                            ${this._renderActionButtons(idx)}
                        </div>
                    </div>
                `)}
            </div>
        `;
    }
    // _emitEv ya está en BaseLitElement
}
customElements.define('object-flex-list-lit', ObjectFlexListLit);


// ================================================
// Componente GridManagerLit (Actualizado para usar variables CSS y pasar darkMode)
// ================================================
class GridManagerLit extends LitElement {
    static properties = {
        comps: { type: Object, state: true },
        // NUEVO: Propiedad para controlar el modo oscuro de todos los componentes hijos
        darkMode: { type: Boolean }
    };

    constructor() {
        super();
        this.comps = {};
        this.darkMode = false; // Por defecto claro
    }

    // Método para cambiar el modo oscuro de todos los componentes gestionados
    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        // No es necesario forzar el re-render directamente aquí,
        // Lit lo hará porque `darkMode` es una propiedad observada.
        // Los componentes hijos recibirán la nueva propiedad `darkMode` y se actualizarán.
    }

    static styles = css`
        :host {
            display: block;
            /* Definir variables aquí si se quiere un control AÚN MÁS global,
               pero por ahora las heredamos de BaseLitElement a través de los hijos */
            /* background-color: var(--manager-bg, #f0f0f0); */ /* Ejemplo */
        }
        .mgr-ctr {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .comp-wrap {
            /* Usamos variables definidas en BaseLitElement */
            border: 1px solid var(--border-color-primary);
            border-radius: 6px;
            background-color: var(--bg-color-primary); /* Fondo principal */
            box-shadow: 0 1px 3px var(--shadow-color-soft);
            color: var(--text-color-primary); /* Color texto general */
        }
        /* Estilos específicos para modo oscuro si el wrapper necesita cambiar */
        :host([darkmode]) .comp-wrap {
             border: 1px solid var(--border-color-primary); /* Ya usa la variable correcta */
             background-color: var(--bg-color-primary); /* Ya usa la variable correcta */
             color: var(--text-color-primary); /* Ya usa la variable correcta */
        }

        .comp-title {
            margin: 0 0 10px 0;
            font-size: 1.2em;
            color: var(--text-color-primary); /* Color texto primario */
            font-weight: 600;
            border-bottom: 1px solid var(--border-color-secondary); /* Borde secundario */
            padding-bottom: 5px;
        }
        .error {
            /* Usar variables para errores si las definimos, o colores directos */
            color: var(--text-color-danger, red);
            border: 1px solid var(--border-color-danger, red);
            padding: 10px;
            background-color: var(--bg-color-delete, #ffebeb); /* Reutilizamos delete o creamos --bg-error */
            border-radius: 4px;
        }
         /* Modo oscuro para errores */
        :host([darkmode]) .error {
            color: var(--text-color-danger, #ff8a8a);
            border: 1px solid var(--border-color-danger, #a71d2a);
            background-color: var(--bg-color-delete, #c82333);
        }
    `;

    // --- Métodos addComp, getCompCfg, etc. SIN CAMBIOS LÓGICOS ---
    addComp(id, cfg = {}) {
        if (!id || typeof id !== 'string' || !cfg.keys || !Array.isArray(cfg.keys)) {
            console.error('GM: ID & cfg.keys required.'); return null;
        }
        if (this.comps[id]) {
            console.warn(`GM: Comp ID "${id}" exists.`); return this.comps[id];
        }
        const nCfg = {
            type: (cfg.displayType || 'cards').toLowerCase(),
            title: cfg.title || '',
            keys: [...cfg.keys],
            data: Array.isArray(cfg.initialData) ? JSON.parse(JSON.stringify(cfg.initialData)) : [],
            actions: Array.isArray(cfg.actions) ? cfg.actions.filter(a => a.name && a.label) : [],
            options: { ...(cfg.displayOptions || {}) }
        };
        if (!Array.isArray(nCfg.data)) nCfg.data = [];
        this.comps = { ...this.comps, [id]: nCfg };
        return nCfg;
    }
    getCompCfg(id) { return this.comps?.[id] || null; }
    getCompEl(id) { return this.shadowRoot?.querySelector(`.comp-wrap[data-comp-id="${id}"] > :not(h3)`) || null; }
    remComp(id) {
        if (!this.comps?.[id]) { console.warn(`GM: Comp ID "${id}" not found.`); return false; }
        const { [id]: _, ...rest } = this.comps; this.comps = rest;
        console.log(`GM: Comp "${id}" removed.`); return true;
    }
    clearAll() { this.comps = {}; console.log('GM: All comps removed.'); }
    setCompData(id, data, keys) {
        const compCfg = this.comps?.[id];
        if (!compCfg) { console.warn(`GM: Comp ID "${id}" not found for setData.`); return; };
        let nData = compCfg.data; let nKeys = keys ?? compCfg.keys;
        if (data !== undefined) {
            try {
                nData = Array.isArray(data) ? JSON.parse(JSON.stringify(data)) : [];
                if (!Array.isArray(data)) console.warn(`GM: setData for "${id}" received non-array.`);
            } catch (e) { console.error(`GM: Error copying data for ${id}`, e); nData = []; }
        }
        this.comps = { ...this.comps, [id]: { ...compCfg, data: nData, keys: nKeys } };
    }
    _handleBubbledEvent(e) {
        // ... (sin cambios)
        const wrap = e.target.closest('.comp-wrap[data-comp-id]');
        const compId = wrap?.dataset.compId;
        if (!compId || !this.comps?.[compId]) {
            if (wrap) console.warn(`GM: Event ${e.type} from unknown compId ${compId}`);
            return;
        }
        if (e.type !== 'internal-action' || !e.detail?.originalAction) {
            console.warn(`GM: Unexpected event caught or missing detail: ${e.type}`, e.detail);
            return;
        }
        const { detail } = e;
        const originalAction = detail.originalAction;
        console.log(`GM: Action "${originalAction}" from "${compId}". Idx: ${detail.index}`, detail.item);
        this.dispatchEvent(new CustomEvent('comp-action', {
            detail: {
                compId: compId,
                action: originalAction,
                item: detail.item,
                index: detail.index
            },
            bubbles: true,
            composed: true
        }));
    }

    _renderManagedComp(id, cfg) {
        const opts = {
            '.layout': cfg.options?.layout, '.perRow': cfg.options?.cardsPerRow,
            '.hdrKey': cfg.options?.headerKey, '.fDir': cfg.options?.flexDirection,
            '.fWrap': cfg.options?.flexWrap, '.jCont': cfg.options?.justifyContent,
            '.aItems': cfg.options?.alignItems,
        };
        const defOpts = Object.entries(opts).filter(([, v]) => v !== undefined).reduce((a, [k, v]) => ({ ...a, [k]: v }), {});

        // *** CORRECCIÓN AQUÍ ***
        // Cambiamos ?darkMode a .darkMode para pasar la propiedad, no el atributo directamente.
        // Lit se encargará de reflejar la propiedad al atributo gracias a 'reflect: true' en BaseLitElement.
        const commonProps = {
            '.data': cfg.data,
            '.keys': cfg.keys,
            '.actions': cfg.actions,
            '.darkMode': this.darkMode // <--- Cambio clave: pasar la propiedad
        };

        let compTpl;
        switch (cfg.type) {
            case 'table':
                compTpl = customElements.get('object-table-lit') ? html`
                    <object-table-lit
                        .data=${commonProps['.data']}
                        .keys=${commonProps['.keys']}
                        .actions=${commonProps['.actions']}
                        .darkMode=${commonProps['.darkMode']}
                        ...=${defOpts}
                    ></object-table-lit>`
                    : html`<div class="error">Err: object-table-lit undef</div>`;
                break;
            case 'flex':
                compTpl = customElements.get('object-flex-list-lit') ? html`
                    <object-flex-list-lit
                        .data=${commonProps['.data']}
                        .keys=${commonProps['.keys']}
                        .actions=${commonProps['.actions']}
                        .darkMode=${commonProps['.darkMode']}
                        ...=${defOpts}
                    ></object-flex-list-lit>`
                    : html`<div class="error">Err: object-flex-list-lit undef</div>`;
                break;
            case 'cards':
            default:
                compTpl = customElements.get('object-cards-lit') ? html`
                    <object-cards-lit
                        .data=${commonProps['.data']}
                        .keys=${commonProps['.keys']}
                        .actions=${commonProps['.actions']}
                        .darkMode=${commonProps['.darkMode']}
                        ...=${defOpts}
                    ></object-cards-lit>`
                    : html`<div class="error">Err: object-cards-lit undef</div>`;
                if (cfg.type !== 'cards') console.warn(`GM: Unknown type "${cfg.type}" for ${id}. Using cards.`);
                break;
        }

        // El ?darkmode en el div wrapper está bien, porque el div no tiene una propiedad 'darkMode'
        // que refleje automáticamente. Aquí sí necesitamos controlar el atributo directamente.
        return html`
            <div class="comp-wrap" data-comp-id=${id} ?darkmode=${this.darkMode}>
                ${cfg.title ? html`<h3 class="comp-title">${cfg.title}</h3>` : ''}
                ${compTpl}
            </div>`;
    }

    render() {
        // Reflejamos el estado darkMode en el host del GridManager
        if (this.darkMode) {
            this.setAttribute('darkmode', '');
        } else {
            this.removeAttribute('darkmode');
        }

        return html`
            <div class="mgr-ctr" @internal-action=${this._handleBubbledEvent}>
                ${Object.entries(this.comps || {}).map(([id, cfg]) => this._renderManagedComp(id, cfg))}
            </div>`;
    }
}

customElements.define('grid-manager-lit', GridManagerLit);
