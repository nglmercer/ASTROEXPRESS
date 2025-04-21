// /src/pages/events/events.js (o tu ruta)
import {rendertables} from '/src/components/tablejs/inittable.js'
import {
    openDynamicModal,
    setupTableListeners,
    setupModalEventListeners
} from '/src/components/tablejs/crudUIHelpers.js'; // Ajusta ruta
import {estadoscatalogos} from '/src/config/estadoscatalogos.json';
import {tiposcatalogos} from '/src/config/tiposcatalogos.json';
import createSelectOptions from '/src/utils/selectmap.js';
import { fetchapi } from '/src/utils/fetchapi.js'; // Ajusta ruta
async function fetchcatalogos() {
    try {
        const response = await fetchapi.obtenerCatalogosRecientes(); // Asegúrate de que esta función esté definida y exportada correctamente
        console.log('Respuesta de la API:', response);
        return response; // Retorna la respuesta de la API
    } catch (error) {
        console.error('Error en la solicitud:', error);
        return []; // Retorna un arreglo vacío en caso de error
    }

}

// funcion para obtener unicamente los keys de un objeto de una lista de objetos tambien añadir si devolver los primeros 10 o 20 elementos
function getKeysFromArray(array, keyCount = 4) {
    if (!Array.isArray(array) || array.length === 0) return [];
    const keys = Object.keys(array[0]); // Obtener las claves del primer objeto
    const keysToDisplay = keys.slice(0, keyCount); // Limitar a las primeras N claves
    return keysToDisplay
}
fetchcatalogos().then(data => {
    console.log('Catálogos obtenidos:', data);
    setTimeout(() => {
        rendertables(data, "catalogo", getKeysFromArray(data)); // Asegúrate de que el ID del elemento sea correcto

    }, 1000); // Espera 10ms antes de renderizar la tabla
    // Aquí puedes hacer algo con los datos obtenidos
}).catch(error => {
    console.error('Error al obtener los catálogos:', error);
    // Manejo de errores
});


const formConfigurations = {
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
            idUsuario: { label: 'ID Usuario', type: 'number', hidden: true },
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
    temporada: {
        title: "Configurar Temporada",
        getInitialData: () => ({
            idTemporada: 0,
            numeroTemporada: 0,
            nombreTemporada: '',
            descripcionTemporada: '',
            portadaTemporada: '',
            catalogoTemporada: 0,
            nsfw: 0
        }),
        getFieldConfig: async () => ({
            idTemporada: { label: 'ID Temporada', type: 'number', hidden: true },
            numeroTemporada: { label: 'Número Temporada', type: 'number', required: true },
            nombreTemporada: { label: 'Nombre', type: 'text', required: true },
            descripcionTemporada: { label: 'Descripción', type: 'text' },
            portadaTemporada: { label: 'Portada', type: 'text' },
            catalogoTemporada: { label: 'Catálogo', type: 'number' },
            nsfw: { label: 'NSFW', type: 'checkbox' }
        })
    }
};

const pageConfig = {
    modalId: 'modal-container', // Asegúrate que sea el ID correcto
    editorId: 'dynamic-editor',   // Asegúrate que sea el ID correcto
    managerId: 'catalogo',
    eventTypes: ['temporada', 'user', 'catalogo'] // Tipos gestionados en esta página
};

const modalEl = document.getElementById(pageConfig.modalId);
const editorEl = document.getElementById(pageConfig.editorId);
const managerEl = document.getElementById(pageConfig.managerId);

if (!modalEl || !editorEl || !managerEl) {
    console.error("Error: Elementos UI necesarios no encontrados.","modalEl",modalEl,"editorEl",editorEl,"managerEl",managerEl);
}





function openModal(type, data = null) {
    openDynamicModal(modalEl, editorEl, type, formConfigurations, data);
}

function refreshTable(compId) {

}

// Listener para botones "Añadir" específicos por tipo
document.body.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-form-type]');
    if (button && pageConfig.eventTypes.includes(button.dataset.formType)) {
        openModal(button.dataset.formType);
    }
});





document.addEventListener('DOMContentLoaded', () => {
    setupTableListeners(managerEl, openModal,(...args) => {console.log("setupTableListeners",args)});
    setupModalEventListeners(modalEl, editorEl, refreshTable, null);
});