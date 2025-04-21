import { fetchcatalogos, getKeysFromArray} from '@components/tablejs/init1.js';
import {tiposcatalogos} from '/src/config/tiposcatalogos.json';
import {estadoscatalogos} from '/src/config/estadoscatalogos.json';
import createSelectOptions from '/src/utils/selectmap.js';
import {
  openDynamicModalDirect,
  setupTableListeners,
  setupModalEventListeners
} from '/src/components/tablejs/crudUIHelpers.js'; // Ajusta ruta
import {rendertables} from '@components/tablejs/inittable.js'
import u from 'umbrellajs';

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
u(document).on('click', 'button', function (e) {
  const btn = u(this);

  if (btn.attr('data-form-type') !== null) {
    openModal(btn.attr('data-form-type'));
  }
});
u(document).on('DOMContentLoaded',async function () {
  const navelement = u('pagination-nav');
  const page = navelement.nodes[0]?.currentPage || 1; 
  console.log("render data for page: ", page,navelement);
  const arrayresponse = await fetchcatalogos(page);
  const keys = getKeysFromArray(arrayresponse.data);
  rendertables(arrayresponse.data, "catalogo", keys);
  const breadcrumb = u('nav-breadcrumb');
  customElements.whenDefined('nav-breadcrumb').then(() => {
    const element = breadcrumb.nodes[0];
    element.paramNames = ['section', 'category', 'itemId'];
    
  });
});