import {tiposcatalogos} from '/src/config/tiposcatalogos.json';
import {estadoscatalogos} from '/src/config/estadoscatalogos.json';
import createSelectOptions from '/src/utils/selectmap.js';
import {getURLPATH, redirectTo} from '/src/utils/redirect'
import { fetchapi } from '@utils/fetchapi';
import {
  openDynamicModalDirect,
} from '/src/components/tablejs/crudUIHelpers.js'; // Ajusta ruta
import {rendertablewithE} from '@components/tablejs/inittable.js'
import u from 'umbrellajs';
function getKeysFromArray(array, keyCount = 4) {
  if (!Array.isArray(array) || array.length === 0) return [];
  const keys = Object.keys(array[0]); // Obtener las claves del primer objeto
  const keysToDisplay = keys.slice(0, keyCount); // Limitar a las primeras N claves
  return keysToDisplay
}
const formCatalogo = {
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
}
/*    catalogo: {
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
    },*/
const pageConfig = {
  modalId: 'modal-container', 
  editorId: 'dynamic-editor',  
  managerId: 'catalogo',
  eventTypes: 'catalogo',
};
const modalEl = document.getElementById(pageConfig.modalId);
const editorEl = document.getElementById(pageConfig.editorId);
const managerEl = document.getElementById(pageConfig.managerId);

if (!modalEl || !editorEl || !managerEl) {
    console.error("Error: Elementos UI necesarios no encontrados.","modalEl",modalEl,"editorEl",editorEl,"managerEl",managerEl);
}

function openModal(type, data = null) {
  //(modalEl, editorEl, formType, formConfig, data = null,
  openDynamicModalDirect(modalEl, editorEl, type,formCatalogo, data, null, null)
}

function initializepagesbar() {
  const varel = u('pagination-nav')
  if(!varel) return;
  console.log("varel",varel)
  varel.on('action', async (event) => {
      console.log('Evento de acción recibido:', event.detail.page);
      changepagenumber(event.detail)
  });
  const page = varel.first().currentPage || 1;
  return page
}
function changepagenumber(number){
  const currentPath = window.location.pathname;
  const newPath = currentPath.replace(/\/(\d+)$/, `/${number.page}`);
  window.location.replace(newPath);
}
function tableListeners(){
    // catalogo
    const element = u("#catalogo")
    element.on('action', async (e) => {
      const {originalAction, item} = e.detail
      if (!originalAction) return;
      if (originalAction === 'edit'){
        openModal(pageConfig.eventTypes,item)
      }
    });

    element.on('menu', async (e) => {
      console.log(e.detail);
      const {item,type} = e.detail
      console.log("type",type)
      if (!type) return
      if (type === 'dblclick'){
        redirectTo(getURLPATH(item).path)
      }
    });
}



u(document).on('click', 'button', function (e) {
  const btn = u(this);
  if (btn.attr('data-form-type') !== null) {
    openModal(btn.attr('data-form-type'));
  }
});
u(document).on('DOMContentLoaded',async function () {
  const page = initializepagesbar()
  console.log("render data for page: ", page);
  const response = await fetchapi.obtenerDirectorio(page)
  const keys = getKeysFromArray(response.data);
  rendertablewithE({
    element: managerEl,
    keys:keys,
    array:response.data
  });
  tableListeners()
  /*barra de paginacion */
  const breadcrumb = u('nav-breadcrumb');
  customElements.whenDefined('nav-breadcrumb').then(() => {
    const element = breadcrumb.nodes[0];
    element.paramNames = ['section', 'category', 'itemId'];
  });
});