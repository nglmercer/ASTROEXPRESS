// /src/pages/events/events.js (o tu ruta)
import { databases, IndexedDBManager, Emitter, getAllDataFromDatabase } from '/src/components/tablejs/idb.js'; // Ajusta ruta
import {
    openDynamicModal,
    initializeTables,
    updateTableData,
    setupModalEventListeners,
    setupTableActionListeners
} from '/src/components/tablejs/crudUIHelpers.js'; // Ajusta ruta
import {estadoscatalogos} from '/src/config/estadoscatalogos.json';
import {tiposcatalogos} from '/src/config/tiposcatalogos.json';
import createSelectOptions from '/src/utils/selectmap.js';
 async function fetchUserRoles() {
    await new Promise(resolve => setTimeout(resolve, 10));
    return [
        { value: 'any', label: 'Cualquiera' },
        { value: 'sub', label: 'Suscriptor (Async)' },
        { value: 'mod', label: 'Moderador (Async)' },
        { value: 'gifter', label: 'Regalador (Async)' },
    ];
 }
async function getAllActions() {
    try {
        let actions = [];
        const allactionsDb = await getAllDataFromDatabase(databases.ActionsDB);
        if (allactionsDb && Array.isArray(allactionsDb)) {
            actions = allactionsDb.map(item => ({ value: item.id, label: item.name }));
        }
        console.log("getAllActions", actions);
        return actions;
    } catch (error) {
        console.error("Error getting actions:", error);
        return [];
    }
}
 function comparatorStringOptions() {
    return [
        { value: 'any', label: 'Cualquiera' }, { value: 'equal', label: 'Igual a' },
        { value: 'startsWith', label: 'Comienza con' }, { value: 'endsWith', label: 'Termina con' },
        { value: 'contains', label: 'Contiene' }
    ]
}

const formConfigurations = {
    comment: {
        title: "Configurar Evento de Comentario",
        getInitialData: () => ({
            id: '', name: 'Nuevo Evento Comentario', isActive: true,
            role: 'any', comparator: 'startsWith', value: '', type: 'comment' // Añadir tipo
        }),
        getFieldConfig: async () => ({
            name: { label: 'Nombre', type: 'text', required: true },
            isActive: { label: 'Activo', type: 'switch' },
            role: { label: 'Rol', type: 'select', options: await fetchUserRoles() },
            comparator: { label: 'Comparador', type: 'select', options: comparatorStringOptions() },
            value: { label: 'Valor Comentario', type: 'text', showIf: { field: 'comparator', value: 'any', negate: true } },
            actions: { label: 'Acciones', type: 'select', options: await getAllActions(), multiple: true },
            id: { hidden: false, readonly:"true" }, // Ocultar ID para nuevos
            type: { hidden: true }
        })
    },
    catalogo: {
        title: "Configurar Catálogo",
        getInitialData: () => ({
            idCatalogo: 0,
            nombreCatalogo: '',
            tipoCatalogo: 0,
            estadoCatalogo: 0,
            imagenPortadaCatalogo: '',
            imagenFondoCatalogo: '',
            descripcionCatalogo: '',
            nsfwCatalogo: 0,
            recomendacionCatalogo: null,
            trailerCatalogo: null
        }),
        getFieldConfig: async () => ({
            idCatalogo: { label: 'ID Catálogo', type: 'number', hidden: true },
            nombreCatalogo: { label: 'Nombre', type: 'text', required: true },
            tipoCatalogo: { label: 'Tipo', type: 'select', options: createSelectOptions("tiposcatalogos", tiposcatalogos) },
            estadoCatalogo: { label: 'Estado', type: 'select', options: createSelectOptions("estadoscatalogos", estadoscatalogos) },
            imagenPortadaCatalogo: { label: 'Imagen Portada', type: 'text' },
            imagenFondoCatalogo: { label: 'Imagen Fondo', type: 'text' },
            descripcionCatalogo: { label: 'Descripción', type: 'text' },
            nsfwCatalogo: { label: 'NSFW', type: 'checkbox' },
            recomendacionCatalogo: { label: 'Recomendación', type: 'checkbox' },
            trailerCatalogo: { label: 'Trailer', type: 'text' }
        })
    },
    user: {
        title: "Configurar Usuario",
        getInitialData: () => ({
            idUsuario: 0,
            apodoUsuario: '',
            correoUsuario: '',
            claveUsuario: '',
            rolUsuario: 0,
            nsfwUsuario: 0,
            fechaCreacion: new Date().toISOString(),
            apicode: null,
            fechaNacimiento: null,
            nombres: null,
            apellidos: null,
            state: null,
            country: 0,
            phone: null,
            preRegistrado: 0,
            creadorContenido: 0,
            anticipado: 0,
            fotoPerfilUsuario: null,
            plan: 0,
            idUltimaTransaccion: null,
            fechaUltimaTransaccion: null
        }),
        getFieldConfig: async () => ({
            idUsuario: { label: 'ID Usuario', type: 'number', required: true },
            apodoUsuario: { label: 'Apodo', type: 'text', required: true },
            correoUsuario: { label: 'Correo', type: 'text', required: true },
            claveUsuario: { label: 'Clave', type: 'password', required: true },
            rolUsuario: { label: 'Rol', type: 'number' },
            nsfwUsuario: { label: 'NSFW', type: 'number' },
            fechaCreacion: { label: 'Fecha Creación', type: 'text', readonly: true },
            apicode: { label: 'API Code', type: 'text' },
            fechaNacimiento: { label: 'Fecha Nacimiento', type: 'text' },
            nombres: { label: 'Nombres', type: 'text' },
            apellidos: { label: 'Apellidos', type: 'text' },
            state: { label: 'Estado', type: 'text' },
            country: { label: 'País', type: 'number' },
            phone: { label: 'Teléfono', type: 'text' },
            preRegistrado: { label: 'Pre-Registrado', type: 'number' },
            creadorContenido: { label: 'Creador Contenido', type: 'number' },
            anticipado: { label: 'Anticipado', type: 'number' },
            fotoPerfilUsuario: { label: 'Foto Perfil', type: 'text' },
            plan: { label: 'Plan', type: 'number' },
            idUltimaTransaccion: { label: 'ID Última Transacción', type: 'text' },
            fechaUltimaTransaccion: { label: 'Fecha Última Transacción', type: 'text' }
        })
    },
    
};

const pageConfig = {
    modalId: 'modal-container', // Asegúrate que sea el ID correcto
    editorId: 'dynamic-editor',   // Asegúrate que sea el ID correcto
    managerId: 'eventConfigManager',
    eventTypes: ['comment', 'user', 'catalogo'] // Tipos gestionados en esta página
};

const modalEl = document.getElementById(pageConfig.modalId);
const editorEl = document.getElementById(pageConfig.editorId);
const managerEl = document.getElementById(pageConfig.managerId);

if (!modalEl || !editorEl || !managerEl) {
    console.error("Error: Elementos UI necesarios no encontrados.");
    // Podrías detener aquí o mostrar un error visual
}

const globalEmitter = new Emitter(); // Un Emitter para todos los eventos de esta página

const dbConfigMap = {
  comment: databases.commentEventsDB,
  gift: databases.giftEventsDB,
  bits: databases.bitsEventsDB,
  likes: databases.likesEventsDB
};

const dbManagerMap = {};
pageConfig.eventTypes.forEach(type => {
    if(dbConfigMap[type] && formConfigurations[type]) {
        dbManagerMap[type] = new IndexedDBManager(dbConfigMap[type], globalEmitter);
    } else {
         console.warn(`Configuración de DB o Formulario faltante para el tipo: ${type}`);
    }
});


const tableConfigs = {};
pageConfig.eventTypes.forEach(type => {
    if(dbManagerMap[type]) { // Solo añade si el manager se pudo crear
        tableConfigs[`${type}Events`] = { // Convención: compId = type + "Events"
            title: formConfigurations[type].title || `Eventos ${type}`,
            formConfig: formConfigurations[type],
            dbConfig: dbConfigMap[type]
        };
    }
});


function openModal(type, data = null) {
    openDynamicModal(modalEl, editorEl, type, formConfigurations, data);
}

function refreshTable(compId) {
    const config = tableConfigs[compId];
    if (config) {
        updateTableData(managerEl, compId, config.dbConfig, getAllDataFromDatabase);
    } else {
        console.warn(`No se encontró config para refrescar tabla: ${compId}`);
    }
}

// Listener para botones "Añadir" específicos por tipo
document.body.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-form-type]');
    if (button && pageConfig.eventTypes.includes(button.dataset.formType)) {
        openModal(button.dataset.formType);
    }
});

setupModalEventListeners(
    modalEl,
    editorEl,
    dbManagerMap,
    (type, changedData) => {
        console.log(`Operación modal completada para ${type}:`, changedData);
        const compIdToRefresh = `${type}Events`; // Asume la convención
        if (tableConfigs[compIdToRefresh]) {
             refreshTable(compIdToRefresh);
        } else {
             console.warn(`No se encontró tabla ${compIdToRefresh} para refrescar.`);
        }
    }
);

setupTableActionListeners(
    managerEl,
    openModal,
    dbManagerMap,
    tableConfigs, // Pasa las configuraciones para el mapeo compId -> formType si es necesario
    (compId, deletedItem) => {
        console.log(`Item eliminado desde tabla ${compId}:`, deletedItem);
        refreshTable(compId); // Refresca la tabla específica que cambió
    }
);

// Listener global del Emitter (opcional, si necesitas reaccionar a eventos de DB de forma global)
globalEmitter.onAny((eventName, eventData) => {
    console.log(`Evento DB recibido [${eventName}]:`, eventData);
    // Podrías querer refrescar tablas aquí también, pero cuidado con bucles
    // if (['save', 'update', 'delete'].includes(eventName) && eventData?.config?.name) {
    //     const compId = `${eventData.config.name}Events`; // Asumiendo que config.name es el formType
    //     if (tableConfigs[compId]) {
    //          // refreshTable(compId); // Podría ser redundante si ya se refresca tras la acción
    //     }
    // }
});


document.addEventListener('DOMContentLoaded', () => {
    initializeTables(managerEl, tableConfigs, getAllDataFromDatabase, ["name", "id","isActive", "actions"])
    .then(() => console.log('Gestor de eventos inicializado.'))
    .catch(error => console.error('Error inicializando gestor de eventos:', error));
});