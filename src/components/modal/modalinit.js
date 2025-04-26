import MicroModal from 'micromodal';

// --- Estado Global para Modales ---
const globalModalState = {
  /**
   * Almacena los IDs de los modales que están VISUALMENTE abiertos.
   * Usamos un Set para eficiencia y unicidad de IDs.
   * Nota: MicroModal solo gestiona activamente *un* modal a la vez (el último mostrado).
   * Este Set rastrea cuáles *deberían* estar visibles si MicroModal permitiera múltiples.
   */
  visuallyOpen: new Set(),
  /**
   * Rastrea el ID del último modal que se intentó mostrar.
   * Útil porque MicroModal internamente solo maneja el foco y eventos del último modal abierto.
   */
  lastShown: null,
};

// --- Funciones Auxiliares para Manejar Eventos de Modal ---

/**
 * Lógica a ejecutar cuando se muestra un modal.
 * Actualiza el estado global.
 * @param {HTMLElement} modal - El elemento del modal que se mostró.
 */
const handleModalShow = (modal) => {
  if (!modal || !modal.id) {
    console.warn('Intento de mostrar un modal sin ID válido.');
    return;
  }
  console.info(`${modal.id} mostrado (evento onShow)`);

  // Actualizar Estado Global
  globalModalState.visuallyOpen.add(modal.id); // Añadir al Set original
  globalModalState.lastShown = modal.id;

  console.log('Estado Global - Modales Visibles (Set):', globalModalState.visuallyOpen);
  console.log('Estado Global - Último modal mostrado (gestionado activamente):', globalModalState.lastShown);

  // Disparar evento personalizado si es necesario notificar a otras partes de la app
  document.dispatchEvent(new CustomEvent('modalstatechanged', {
    detail: { state: { ...globalModalState, visuallyOpen: Array.from(globalModalState.visuallyOpen) } } // Enviar copia del estado
  }));
};

/**
 * Lógica a ejecutar cuando se cierra un modal.
 * Actualiza el estado global.
 * @param {HTMLElement} modal - El elemento del modal que se cerró.
 */
const handleModalClose = (modal) => {
  if (!modal || !modal.id) {
    console.warn('Intento de cerrar un modal sin ID válido.');
    return;
  }
  console.info(`${modal.id} cerrado (evento onClose)`);

  const wasPresent = globalModalState.visuallyOpen.delete(modal.id); // Eliminar del Set original

  if (wasPresent) {
    console.log('Estado Global - Modales Visibles (Set):', globalModalState.visuallyOpen);
  } else {
    console.warn(`Se intentó cerrar ${modal.id}, pero no estaba registrado como visible en el Set.`);
  }
  if (globalModalState.lastShown === modal.id) {
    const ids = Array.from(globalModalState.visuallyOpen);
    const els = ids.map(id => document.getElementById(id));
    globalModalState.lastShown = getIndexMayor(els) ? getIndexMayor(els) : null; // remainingModals[0] si no hay
    console.log('Estado Global - Último modal mostrado ahora es:', globalModalState.lastShown,els,getIndexMayor(els));
     if (globalModalState.lastShown) {
       MicroModal.show(globalModalState.lastShown, window.Modaloptions);
    }
  }
};
function getIndexMayor(modalElements) {
  // Finds the modal element with the highest z-index on its '.modal__overlay' child.
  // Returns the ID of that modal element, or null if the input array is empty,
  // contains no valid modal elements, or none have a valid overlay with a z-index.

  let highestZIndex = -1; // Initialize with a value lower than typical z-indices
  let modalIdWithHighestZIndex = null;

  if (!modalElements || modalElements.length === 0) {
    return null;
  }

  for (const modalElement of modalElements) {
    // Ensure the element is a valid HTMLElement and has an ID
    if (modalElement instanceof HTMLElement && modalElement.id) {
      const overlay = modalElement.querySelector('.modal__overlay');

      if (overlay) {
        const zIndexString = overlay.style.zIndex;
        const currentZIndex = parseInt(zIndexString, 10);

        // Check if parsed z-index is a valid number
        if (!isNaN(currentZIndex)) {
          // If this is the first valid modal found, or if its z-index is higher
          if (modalIdWithHighestZIndex === null || currentZIndex > highestZIndex) {
            highestZIndex = currentZIndex;
            modalIdWithHighestZIndex = modalElement.id;
          }
        }
      }
    }
  }

  return modalIdWithHighestZIndex;
}

// --- Configuración por Defecto para MicroModal ---
const defaultModalOptions = {
  onShow: handleModalShow,
  onClose: handleModalClose,
  openTrigger: 'data-micromodal-trigger', // Atributo para botones que abren modales
  closeTrigger: 'data-micromodal-close', // Atributo para botones que cierran modales
  disableScroll: true,                   // Deshabilita el scroll del body cuando el modal está abierto
  disableFocus: false,                  // ¡Importante! Mantiene el manejo de foco de MicroModal
  awaitOpenAnimation: false,             // No esperar animaciones CSS al abrir
  awaitCloseAnimation: false,            // No esperar animaciones CSS al cerrar
  debugMode: true                        // Muestra logs útiles en la consola
};

// --- Exponer Estado y Funciones Globalmente (si es necesario) ---
// Es preferible evitar el uso excesivo de `window`, pero si otras partes del código lo necesitan:
window.Modaloptions = defaultModalOptions;
window.getVisuallyOpenModals = () => new Set(globalModalState.visuallyOpen); // Devuelve una copia para evitar mutaciones externas
window.isModalVisuallyOpen = (id) => globalModalState.visuallyOpen.has(id);
window.getLastShownModal = () => globalModalState.lastShown;


// --- Inicialización de MicroModal ---
document.addEventListener('DOMContentLoaded', () => {
  console.log("Inicializando MicroModal...");
  // Usar las opciones definidas globalmente
  MicroModal.init(window.Modaloptions);
  console.log("MicroModal inicializado.");
});