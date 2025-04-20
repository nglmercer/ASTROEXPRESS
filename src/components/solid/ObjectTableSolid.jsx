import { createSignal, createEffect ,
     createMemo, Show, For } from 'solid-js';
import { classList } from 'solid-js/web'; // Import classList from solid-js/web

// ================================================
// Signals for Emitting Data (Exported)
// ================================================
// Parent components will import these signals and createEffects on them.
// The value will be set when an action occurs.
// A parent consumer might want to reset the signal to null after processing
// if they only want to handle each event once.

// Signal for button actions (Edit, Delete, custom)
export const actionSignal = createSignal(null); // Stores { name: string, item: object, index: number } or null

// Signal for row activation (double-click)
export const rowActivatedSignal = createSignal(null); // Stores { item: object, index: number } or null

// Signal for context menu event (right-click)
export const rowContextMenuSignal = createSignal(null); // Stores { item: object, index: number, type: string } or null


// ================================================
// ObjectTableSolid Component
// ================================================
function ObjectTableSolid(props) {
    // Internal state for dark mode, mimicking Lit component's internal state
    // You could also receive this via a prop if managed by parent.
    const [isDarkMode, setDarkMode] = createSignal(props.darkMode ?? false);

    // Derived signals/memos for conditional rendering
    const isDataEmpty = createMemo(() => !props.data || props.data.length === 0);
    const isKeysEmpty = createMemo(() => !props.keys || props.keys.length === 0);

    // Helper function to verify row index from event target
    const verifyRow = (event) => {
        // Find the closest TR element with a data-idx
        const row = event.target.closest('tr[data-idx]');
        if (!row) {
             console.warn(`${ObjectTableSolid.name}: Could not find row from event target.`);
             return undefined;
        }
        const idx = parseInt(row.dataset.idx, 10);

        if (isNaN(idx) || idx < 0 || idx >= (props.data?.length ?? 0)) {
            console.warn(`${ObjectTableSolid.name}: Invalid index ${idx} from row.`);
            return undefined; // Return undefined on failure
        }
        return idx;
    };

    // Event Handlers (update the exported signals)
    const handleRowClick = (event, type) => {
        const idx = verifyRow(event);
        if (idx === undefined) return; // verifyRow returns undefined on failure
        const item = props.data[idx];
        if (!item) {
             console.warn(`${ObjectTableSolid.name}: No item found at index ${idx}.`);
             return;
        }

        if (type === 'dblclick') {
            // Update the exported rowActivatedSignal
            rowActivatedSignal[1]({ item, index: idx }); // [1] is the setter
        } else if (type === 'contextmenu') {
            // Update the exported rowContextMenuSignal
            rowContextMenuSignal[1]({ item, index: idx, type }); // [1] is the setter
        }
    };

    const handleActionClick = (actionName, item, index) => {
         // Update the exported actionSignal
         actionSignal[1]({ name: actionName, item, index }); // [1] is the setter
    };

    // Helper function to render action buttons for a row
    const renderActionButtons = (item, idx) => {
        // Create a mutable copy to add default actions if necessary
        let actionsToRender = [...(props.actions ?? [])];

        // Add default 'edit' and 'delete' if they don't exist in the provided actions
        if (!actionsToRender.some(a => a.name === 'edit')) {
            actionsToRender.unshift({ name: 'edit', label: 'Editar', className: 'edit-btn' });
        }
         if (!actionsToRender.some(a => a.name === 'delete')) {
            actionsToRender.push({ name: 'delete', label: 'Eliminar', className: 'delete-btn' });
        }

        return (
             // Use <For> for rendering the list of buttons efficiently
             <For each={actionsToRender}>
                 {(act) => (
                     <button
                         // Corrección: Usar className en lugar de class y eliminar classList
                         className={`${act.className || ''} ${act.name === 'edit' ? 'edit-btn' : ''} ${act.name === 'delete' ? 'delete-btn' : ''}`}
                         // Attach the click handler that updates the signal
                         onClick={() => handleActionClick(act.name, item, idx)}
                     >
                         {act.label}
                     </button>
                 )}
             </For>
        );
    };

    return (
        // Corrección: Usar className en lugar de class y eliminar classList
        <div className={`ctr ${props.darkMode ? 'dark-mode' : ''}`}>
            {/* Use <Show> for conditional rendering based on data/keys */}
            <Show when={!isDataEmpty() && !isKeysEmpty()} fallback={
                <div className="no-data">
                    <Show when={isDataEmpty()}>No hay datos.</Show>
                    <Show when={!isDataEmpty() && isKeysEmpty()}>No hay claves.</Show>
                </div>
            }>
                <div className="table-container"> {/* Container for horizontal scroll */}
                    <table>
                        <thead>
                            <tr>
                                {/* Use <For> to render table headers */}
                                <For each={props.keys}>
                                    {k => <th>{k}</th>}
                                </For>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Use <For> to render table rows */}
                            <For each={props.data}>
                                {(item, idx) => ( // idx is an accessor function in <For>
                                    <tr
                                        data-idx={idx()} // Pass index to handler via data attribute
                                        onDblClick={(e) => handleRowClick(e, 'dblclick')}
                                        onContextMenu={(e) => {
                                            e.preventDefault(); // Prevent native context menu
                                            handleRowClick(e, 'contextmenu');
                                        }}
                                    >
                                        {/* Use <For> to render table cells for each key */}
                                        <For each={props.keys}>
                                            {k => {
                                                const val = item[k];
                                                let dVal = (val !== undefined && val !== null) ? String(val) : '';
                                                if (typeof val === 'boolean') dVal = val ? 'Sí' : 'No';

                                                return (
                                                    <td
                                                         // Corrección: Usar className en lugar de class y simplificar
                                                         className={typeof val === 'string' && val.length > 50 ? 'wrap' : ''}
                                                    >
                                                         {dVal}
                                                    </td>
                                                );
                                            }}
                                        </For>
                                        <td className="acts-cell">
                                            {/* Call helper to render action buttons */}
                                            {renderActionButtons(item, idx())} {/* Pass item and actual index value */}
                                        </td>
                                    </tr>
                                )}
                            </For>
                        </tbody>
                    </table>
                </div>
            </Show>
        </div>
    );
}
function SignalBridge() {
    createEffect(() => {
      const action = actionSignal[0]();
      if (action) {
        console.log('Action signal recibido:', action);
        // Ejemplo: Lanza un CustomEvent para que el DOM lo reciba
        window.dispatchEvent(new CustomEvent('action-signal', { detail: action }));
        actionSignal[1](null); // limpiar después de usar
      }
    });
  
    createEffect(() => {
      const row = rowActivatedSignal[0]();
      if (row) {
        console.log('Double-click signal recibido:', row);
        window.dispatchEvent(new CustomEvent('row-activated', { detail: row }));
        rowActivatedSignal[1](null);
      }
    });
  
    createEffect(() => {
      const ctx = rowContextMenuSignal[0]();
      if (ctx) {
        console.log('ContextMenu signal recibido:', ctx);
        window.dispatchEvent(new CustomEvent('row-contextmenu', { detail: ctx }));
        rowContextMenuSignal[1](null);
      }
    });
  
    return null; // Este componente no renderiza nada
  }
export { ObjectTableSolid, SignalBridge };