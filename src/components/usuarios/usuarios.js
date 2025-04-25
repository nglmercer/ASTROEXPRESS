import createSelectOptions from '/src/utils/selectmap.js';
import { fetchapi } from '@utils/fetchapi';
import { openDynamicModalDirect, setupModalListeners } from '/src/components/tablejs/crudUIHelpers.js';
import { rendertablewithE } from '@components/tablejs/inittable.js'
import u from 'umbrellajs';
function getKeysFromArray(array, keyCount = 4) {
    if (!Array.isArray(array) || array.length === 0) return [];
    const keys = Object.keys(array[0]); // Obtener las claves del primer objeto
    const keysToDisplay = keys.slice(0, keyCount); // Limitar a las primeras N claves
    return keysToDisplay
}
const pageConfig = {
    modalId: 'modal-container',
    editorId: 'dynamic-editor',
    managerId: 'usuarios',
    eventTypes: 'usuarios',
};
const modalEl = document.getElementById(pageConfig.modalId);
const editorEl = document.getElementById(pageConfig.editorId);
const managerEl = document.getElementById(pageConfig.managerId);

if (!modalEl || !editorEl || !managerEl) {
    console.error("Error: Elementos UI necesarios no encontrados.", "modalEl", modalEl, "editorEl", editorEl, "managerEl", managerEl);
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
  function tableListeners(){
    // catalogo
    const element = u("#usuarios")
    element.on('action', async (e) => {
      const {originalAction, item} = e.detail
      if (!originalAction) return;
      console.log("item",item, "originalAction",originalAction)
      if (originalAction === 'edit'){
      }
      if (originalAction === 'delete'){
      }
    });

    element.on('menu', async (e) => {
      console.log(e.detail);
      const {item,type} = e.detail
      console.log("type",type)
      if (!type) return
      if (type === 'dblclick'){
      }
    });
}
function changepagenumber(number){
  const currentPath = window.location.pathname;
  const newPath = currentPath.replace(/\/(\d+)$/, `/${number.page}`);
  console.log("newPath",newPath)
  //  window.location.replace(newPath);
}
u(document).on('DOMContentLoaded',async function () {
    const page = initializepagesbar()
    console.log("render data for page: ", page);
    const response = await fetchapi.obtenerUsuarios(page)
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
    SearchCatalogos()
  });
  async function SearchCatalogos(){
    const searchForm = u('#searchForm');
    const searchInput = u('#searchInput');
    searchForm.on('submit', async (e) => {
      e.preventDefault();
      const searchTerm = searchInput.first().value;
      console.log('Buscando:', searchTerm);
      const defaultOptions = 
        {
          "query":searchTerm,
        }
/*       const response = await fetchapi.buscarCatalogo(defaultOptions);
      console.log("response: ", response);
      rendertablewithE({
        element: managerEl,
        keys:getKeysFromArray(response),
        array:response
      }) */
    })
  }