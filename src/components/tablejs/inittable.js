
async function renderManagertables(array, elId="catalogos", displayKeysArray) {

    try {
        const managerEl = document.getElementById(elId);
        if (!managerEl) throw new Error(`Elemento con ID "${elId}" no encontrado.`);
        managerEl.clearAll();
        managerEl.addComp(elId, {
            displayType: 'table',
            title: elId,
            keys: displayKeysArray,
            initialData: array,
        });
    } catch (error) {
        console.error(`Error al renderizar tablas: ${error.message}`);
        return;
    }
    
}
async function rendertables(array, elId="catalogos", displayKeysArray) {
    try {
        const tableEl = document.getElementById(elId);
        if (!tableEl) throw new Error(`Elemento con ID "${elId}" no encontrado.`);
        tableEl.data = array;
        tableEl.keys = displayKeysArray;
    } catch (error) {
        console.error(`Error al renderizar tablas: ${error.message}`);
        return;
    }
}
async function rendertablewithE({
    element,
    array,
    keys,
    hiddenKeys = [],
}) {
    if (!element) return 
    element.data = array;
    element.keys = keys;
    if (hiddenKeys && Array.isArray(hiddenKeys)) {
        hiddenKeys.forEach((key) => {
            element.hideAction(key);
            console.log(element,key);
        });
    }
}
export { rendertables,renderManagertables, rendertablewithE};