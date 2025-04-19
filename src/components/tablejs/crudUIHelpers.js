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

export function setupModalEventListeners(modalEl, editorEl, dbManagerMap, afterSaveOrDelete, onCancel = null) {
    editorEl.addEventListener('item-upd', async (e) => {
        const savedData = e.detail;
        const formType = modalEl.dataset.currentFormType;
        const dbManager = dbManagerMap[formType];

        if (!formType || !dbManager) {
            console.error('No se pudo determinar formType o DBManager para guardar.', { formType, dbManager });
            return;
        }

        console.log(`Guardando item tipo ${formType}:`, savedData);
        try {
            const result = await dbManager.saveData(savedData);
            modalEl.hide();
            if (afterSaveOrDelete) afterSaveOrDelete(formType, result);
        } catch (error) {
            console.error(`Error al guardar item tipo ${formType}:`, error);
        }
    });

     editorEl.addEventListener('del-item', async (e) => {
        const itemToDelete = e.detail;
        const formType = modalEl.dataset.currentFormType;
        const dbManager = dbManagerMap[formType];

        if (!formType || !dbManager || !itemToDelete || !itemToDelete.id) {
            console.error('Datos insuficientes para eliminar.', { formType, dbManager, itemToDelete });
            return;
        }

        if (confirm(`¿Seguro que quieres eliminar este item de tipo "${formType}" (ID: ${itemToDelete.id})?`)) {
            console.log(`Eliminando item tipo ${formType}:`, itemToDelete);
            try {
                await dbManager.deleteData(itemToDelete.id);
                modalEl.hide();
                if (afterSaveOrDelete) afterSaveOrDelete(formType, itemToDelete);
            } catch (error) {
                console.error(`Error al eliminar item tipo ${formType} (ID: ${itemToDelete.id}):`, error);
            }
        }
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

export function setupTableActionListeners(managerEl, openModalFn, dbManagerMap, tableConfigs, afterDelete) {
    managerEl.addEventListener('comp-action', async (e) => {
        const { compId, action, item } = e.detail;
        console.log('Acción de tabla:', e.detail);

        let formType = null;
        const potentialType = compId.replace(/Table|Events|ConfigManager|Manager/gi, '');
        if (dbManagerMap[potentialType]) {
            formType = potentialType;
        } else {
             for(const [id, config] of Object.entries(tableConfigs)) {
                if (id === compId) {
                    // Intenta derivar de alguna propiedad en config si la lógica anterior falla
                    // Esta parte es un fallback y puede necesitar ajustes
                     const initialData = config.formConfig?.getInitialData ? config.formConfig.getInitialData() : {};
                     if(initialData.type && dbManagerMap[initialData.type]) {
                        formType = initialData.type;
                     }
                    break;
                }
            }
        }


        if (!formType) {
            console.error(`No se pudo determinar formType para compId: ${compId}`);
            return;
        }

        const dbManager = dbManagerMap[formType];
        if (!dbManager) {
            console.error(`No se encontró DB Manager para tipo: ${formType} (compId: ${compId})`);
            return;
        }

        if (action === 'edit') {
            console.log(`Solicitando edición para ${formType}:`, item);
            openModalFn(formType, item);

        } else if (action === 'delete') {
            if (confirm(`¿Seguro que quieres eliminar "${item.name || 'item'}" (ID: ${item.id}) de tipo ${formType}?`)) {
                try {
                    await dbManager.deleteData(item.id);
                    console.log(`Elemento ${item.id} de tipo ${formType} eliminado.`);
                    if (afterDelete) afterDelete(compId, item);
                } catch (error) {
                    console.error(`Error al eliminar ${item.id} de tipo ${formType}:`, error);
                    alert(`Error al eliminar: ${error.message}`);
                }
            }
        } else {
            console.log(`Acción no manejada "${action}" para ${formType}:`, item);
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