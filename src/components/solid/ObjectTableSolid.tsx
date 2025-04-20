// ObjectTableSolid.tsx
import { For, Show, createSignal } from 'solid-js';
import type { Component } from 'solid-js';

type Action = {
  name: string;
  label: string;
  className?: string;
};

type Props = {
  data: any[];
  keys: string[];
  actions?: Action[];
  darkMode?: boolean;
  onRowActivated?: (item: any) => void;
  onMenu?: (payload: { item: any; idx: number; type: string }) => void;
  onInternalAction?: (payload: { originalAction: string; item: any; index: number }) => void;
};

const ObjectTable: Component<Props> = (props) => {
  const [isDark, setIsDark] = createSignal(props.darkMode ?? false);

  const emitAction = (action: string, index: number) => {
    const item = props.data[index];
    props.onInternalAction?.({
      originalAction: action,
      item: structuredClone(item),
      index,
    });
  };

  const emitRowEvent = (event: MouseEvent, type: 'dblclick' | 'contextmenu', index: number) => {
    event.preventDefault();
    const item = props.data[index];
    props.onRowActivated?.(item);
    props.onMenu?.({ item, idx: index, type });
  };

  const getActions = () => {
    const base = [...props.actions ?? []];
    if (!base.find(a => a.name === 'edit')) base.unshift({ name: 'edit', label: 'Editar', className: 'edit-btn' });
    if (!base.find(a => a.name === 'delete')) base.push({ name: 'delete', label: 'Eliminar', className: 'delete-btn' });
    return base;
  };

  return (
    <div class={`ctr ${isDark() ? 'dark' : ''}`}>
      <Show when={props.data?.length && props.keys?.length} fallback={<div class="no-data">No hay datos.</div>}>
        <table>
          <thead>
            <tr>
              <For each={props.keys}>
                {(key) => <th>{key}</th>}
              </For>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.data}>
              {(item, idx) => (
                <tr
                  data-idx={idx()}
                  onDblClick={(e) => emitRowEvent(e, 'dblclick', idx())}
                  onContextMenu={(e) => emitRowEvent(e, 'contextmenu', idx())}
                >
                  <For each={props.keys}>
                    {(key) => {
                      const val = item[key];
                      let dVal = (val !== undefined && val !== null) ? String(val) : '';
                      if (typeof val === 'boolean') dVal = val ? 'Sí' : 'No';
                      const wrap = typeof val === 'string' && val.length > 50 ? 'wrap' : '';
                      return <td class={wrap}>{dVal}</td>;
                    }}
                  </For>
                  <td class="acts-cell">
                    <For each={getActions()}>
                      {(act) => (
                        <button
                          class={`${act.className || ''}`}
                          onClick={() => emitAction(act.name, idx())}
                        >
                          {act.label}
                        </button>
                      )}
                    </For>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </Show>
    </div>
  );
};

export default ObjectTable;
