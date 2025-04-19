
async function rendertables(array, elId="catalogos", displayKeysArray) {

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
export { rendertables };