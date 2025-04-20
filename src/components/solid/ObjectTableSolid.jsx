import { createSignal, createMemo, Show, For } from 'solid-js';
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
            console.log(`Row double-clicked signal set:`, { item, index: idx }); // For demonstration
        } else if (type === 'contextmenu') {
            // Update the exported rowContextMenuSignal
            rowContextMenuSignal[1]({ item, index: idx, type }); // [1] is the setter
            console.log(`Row context menu signal set:`, { item, index: idx, type }); // For demonstration
        }
    };

    const handleActionClick = (actionName, item, index) => {
         // Update the exported actionSignal
         actionSignal[1]({ name: actionName, item, index }); // [1] is the setter
         console.log(`Action signal set:`, { name: actionName, item, index }); // For demonstration
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
                         // classList helps manage multiple classes conditionally
                         class={classList({
                             [act.className || '']: true, // Custom class if provided
                             'edit-btn': act.name === 'edit', // Specific class for edit
                             'delete-btn': act.name === 'delete', // Specific class for delete
                         })}
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
        // Apply the 'ctr' class and conditionally add 'dark-mode' class
        <div class={classList({ 'ctr': true, 'dark-mode': props.darkMode ?? false })}>
            {/* Use <Show> for conditional rendering based on data/keys */}
            <Show when={!isDataEmpty() && !isKeysEmpty()} fallback={
                <div class="no-data">
                    <Show when={isDataEmpty()}>No hay datos.</Show>
                    <Show when={!isDataEmpty() && isKeysEmpty()}>No hay claves.</Show>
                </div>
            }>
                <div class="table-container"> {/* Container for horizontal scroll */}
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
                                                         class={classList({ 'wrap': typeof val === 'string' && val.length > 50 })}
                                                    >
                                                         {dVal}
                                                    </td>
                                                );
                                            }}
                                        </For>
                                        <td class="acts-cell">
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

export default ObjectTableSolid; // Export the component