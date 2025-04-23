import u from 'umbrellajs';
const baseURL = "/contenido/"
export async function openDynamicModal(modalEl, editorEl, formType, formConfigs, data = null, onBeforeOpen = null, onAfterConfig = null) {
    const configGenerator = formConfigs[formType];
    if (!configGenerator) {
        console.error(`Configuración no encontrada para: ${formType}`);
        return;
    }

    modalEl.dataset.currentFormType = formType;
    editorEl.itm = {};
    editorEl.fCfg = {};

    if (onBeforeOpen) onBeforeOpen(formType, data);
    modalEl.show();

    try {
        const [fCfg, initialData] = await Promise.all([
            configGenerator.getFieldConfig(),
            Promise.resolve(configGenerator.getInitialData())
        ]);

        const itemData = data || initialData;
        console.log(`Configurando modal para ${formType}:`, { config: fCfg, data: itemData });

        editorEl.fCfg = fCfg;
        editorEl.itm = itemData;
        editorEl.hdrKey = configGenerator.title || `Configurar ${formType}`;
        editorEl.mode = 'edit';

        if (editorEl.addAct) {
             editorEl.addAct('save', 'Guardar', 'fas fa-save');
             editorEl.addAct('cancel', 'Cancelar', 'fas fa-times');
             if (data && data.id && editorEl.addAct) {
                 editorEl.addAct('delete', 'Eliminar', 'fas fa-trash-alt');
             } else if (editorEl.hideAct) {
                 editorEl.hideAct('delete');
             }
        }

        if (onAfterConfig) onAfterConfig(formType, itemData, fCfg);

    } catch (error) {
        console.error(`Error al cargar configuración para ${formType}:`, error);
        // Considera modalEl.hide();
    }
}
export async function openDynamicModalDirect(modalEl, editorEl, formType, formConfig, data = null, onBeforeOpen = null, onAfterConfig = null) {
    // No lookup needed, formConfig is provided directly
    // We might still want a check like:
    // if (!formConfig || typeof formConfig.getFieldConfig !== 'function' || typeof formConfig.getInitialData !== 'function') {
    //     console.error(`Invalid formConfig provided for type: ${formType}`);
    //     return;
    // }
    // Let's keep it simple as requested, assuming the user provides a valid config object.

    modalEl.dataset.currentFormType = formType; // Still useful to know the type
    editorEl.itm = {};
    editorEl.fCfg = {};

    if (onBeforeOpen) onBeforeOpen(formType, data);
    modalEl.show();

    try {
        const [fCfg, initialData] = await Promise.all([
            formConfig.getFieldConfig(), // Use provided formConfig
            Promise.resolve(formConfig.getInitialData()) // Use provided formConfig
        ]);

        const itemData = data || initialData;
        console.log(`Configurando modal para ${formType} (Direct Config):`, { config: fCfg, data: itemData }); // Add a note for direct config

        editorEl.fCfg = fCfg;
        editorEl.itm = itemData;
        editorEl.hdrKey = formConfig.title || `Configurar ${formType}`; // Use provided formConfig title
        editorEl.mode = 'edit';

        if (editorEl.addAct) {
             editorEl.addAct('save', 'Guardar', 'fas fa-save');
             editorEl.addAct('cancel', 'Cancelar', 'fas fa-times');
             if (data && data.id && editorEl.addAct) {
                 editorEl.addAct('delete', 'Eliminar', 'fas fa-trash-alt');
             } else if (editorEl.hideAct) {
                 editorEl.hideAct('delete');
             }
        }

        if (onAfterConfig) onAfterConfig(formType, itemData, fCfg);

    } catch (error) {
        console.error(`Error al cargar configuración (Direct Config) para ${formType}:`, error); // Add note for direct config
        // Consider modalEl.hide();
    }
}
export async function setupModalListeners(modalEl, editorEl,callbacks){
    u(modalEl).on('close', () => {
        console.log("Modal cerrado.");
        modalEl.dataset.currentFormType = '';
    });
    const allevents = ['item-upd', 'del-item', 'cancel', 'save', 'delete', 'eliminar'];
    allevents.forEach(event => {
        u(editorEl).on(event, async (e) => {
            console.log('Acción de tabla:', e.detail);
            const item = e.detail;
            console.log("type",event)
            if (!item) return;
            if (callbacks[event]){
                callbacks[event](item)
            }
        });
    });
}
    

export async function initializeTables(managerEl, tableConfigs, getAllDataFn, displayKeysArray) {
    if (!managerEl) {
        console.error('Elemento Grid Manager no proporcionado.');
        return;
    }
    managerEl.clearAll();

    for (const [compId, config] of Object.entries(tableConfigs)) {
        try {
            if (!config.formConfig || !config.dbConfig) {
                console.warn(`Configuración incompleta para tabla: ${compId}.`);
                continue;
            }

            const initialData = await getAllDataFn(config.dbConfig);
            const fieldConfig = await config.formConfig.getFieldConfig();
            const preDefinedKeys = Object.entries(fieldConfig)
            .filter(([key, field]) => !field.hidden)
            .map(([key]) => key);
            const displayKeys = isArray({value: displayKeysArray, defaultvalue: preDefinedKeys});
            console.log("displayKeys:", displayKeys);
            if (!displayKeys.includes('name') && fieldConfig['name']) displayKeys.unshift('name');
            if (!displayKeys.includes('id') && fieldConfig['id']) displayKeys.push('id');

            console.log(`Añadiendo tabla ${compId}:`, { title: config.title, keys: displayKeys, data: initialData });

            managerEl.addComp(compId, {
                displayType: 'table',
                title: config.title,
                keys: displayKeys,
                initialData: initialData,
            });

        } catch (error) {
            console.error(`Error al configurar tabla "${compId}":`, error);
        }
    }
}

export async function updateTableData(managerEl, compId, dbConfig, getAllDataFn) {
     if (!managerEl || !compId || !dbConfig || !getAllDataFn) {
         console.error('Faltan parámetros para actualizar tabla.', {managerEl, compId, dbConfig, getAllDataFn});
         return;
     }
     try {
        const freshData = await getAllDataFn(dbConfig);
        managerEl.setCompData(compId, freshData);
        console.log(`Tabla ${compId} actualizada.`);
     } catch(error) {
        console.error(`Error al actualizar tabla ${compId}:`, error);
     }
}

export function setupModalEventListeners(modalEl, editorEl, onCancel = null) {
    editorEl.addEventListener('item-upd', async (e) => {
        const savedData = e.detail;

    });

     editorEl.addEventListener('del-item', async (e) => {
        const itemToDelete = e.detail;
    });

    editorEl.addEventListener('cancel', () => {
        console.log("Edición cancelada.");
        modalEl.hide();
        if (onCancel) onCancel();
    });

     modalEl.addEventListener('close', () => {
        console.log("Modal cerrado.");
        modalEl.dataset.currentFormType = '';
     });
}

export function setupTablemanagerListeners(managerEl, openfn =  () => {}, afterfn = () => {}) {
    if (typeof managerEl === "string") {
        managerEl = document.querySelector(managerEl);
    }
    managerEl.addEventListener('comp-action', async (e) => {
        const { compId, action, item } = e.detail;
        console.log('Acción de tabla:', e.detail);

        const potentialType = compId.replace(/Table|Events|ConfigManager|Manager/gi, '');


        console.log("formType:", potentialType);

        if (action === 'edit') {
            console.log(`Solicitando edición para ${potentialType}:`, item);
           openfn(potentialType, item);

        } else if (action === 'delete') {
            if (confirm(`¿Seguro que quieres eliminar "${item.name || 'item'}" (ID: ${item.id}) de tipo ${potentialType}?`)) {
                try {
                    console.log(`Elemento ${item.id} de tipo ${potentialType} eliminado.`);
                    if (afterfn) afterfn(compId, item);
                } catch (error) {
                    console.error(`Error al eliminar ${item.id} de tipo ${potentialType}:`, error);
                    alert(`Error al eliminar: ${error.message}`);
                }
            }
        } else {
            console.log(`Acción no manejada "${action}" para ${potentialType}:`, item);
        }
    });
}

function isArray(evalue , cb = () => {}) {
    const { value, defaultvalue } = evalue;
    let result = [];
    if (!value && !defaultvalue) return result;
    if (Array.isArray(value) && value.length > 0) {
        result = value;
    } else if (Array.isArray(defaultvalue) && defaultvalue.length > 0) {
        result = defaultvalue;
    } else {
        result = [value];
    }
    if (cb) cb(result);
    return result;
}