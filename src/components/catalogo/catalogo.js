import {tiposcatalogos} from '/src/config/tiposcatalogos.json';
import {estadoscatalogos} from '/src/config/estadoscatalogos.json';
import createSelectOptions from '/src/utils/selectmap.js';
import { fetchapi, getParams  } from '@utils/fetchapi';
import {   toSingle,  toArray} from '/src/utils/arrayOBJ'; 
import {getURLPATH, redirectTo} from '/src/utils/redirect'
import {
  openDynamicModalDirect,
} from '/src/components/tablejs/crudUIHelpers.js'; // Ajusta ruta
import u from 'umbrellajs';
{/* <script define:vars={{objpost,keys,temporadarray}}>
  document.addEventListener("DOMContentLoaded",async function() {
      const element = document.getElementById("TemporadasTable")
      const itemsisarray = Array.isArray(temporadarray) ? temporadarray : [temporadarray];
      element.data = itemsisarray;
      element.keys = keys
      console.log(element, temporadarray, keys,objpost)
  })
</script> */}
/*
catalogoTemporada
descripcionTemporada
idTemporada
nombreTemporada
nsfw
numeroTemporada
portadaTemporada
export interface Temporada {
    idTemporada: number;
    numeroTemporada: number;
    nombreTemporada: string;
    descripcionTemporada: string;
    portadaTemporada: string;
    catalogoTemporada: number;
    nsfw: number;
}

*/
const params = getParams([1,2,3])

async function getandset() {
  const temporadas = await  fetchapi.getTemporadas(params[3]);
  const temporadarray = toArray(temporadas);
  console.log(temporadarray)
  const keys = [
    "nombreTemporada",
    "idTemporada",
    "numeroTemporada",
    "portadaTemporada",
    "catalogoTemporada",
    "nsfw",
  ]
  setTabledata(temporadarray,keys)
}

const formTemporadas = {
    title: "Configurar Temporada",
    getInitialData: () => ({
        idTemporada: 0,
        numeroTemporada: 0,
        nombreTemporada: "",
        descripcionTemporada: "",
        portadaTemporada: "",
        catalogoTemporada: 0,
        nsfw: 0
    }),
    getFieldConfig: async () => ({
        idTemporada: { label: 'ID Temporada', type: 'number', hidden: true },
        numeroTemporada: { label: 'Número', type: 'number', required: true },
        nombreTemporada: { label: 'Nombre', type: 'text', required: true },
        descripcionTemporada: { label: 'Descripción', type: 'text' },
        portadaTemporada: { label: 'Imagen Portada', type: 'text' },
        catalogoTemporada: { label: 'ID Catálogo', type: 'number', hidden: true },
        nsfw: { label: 'NSFW', type: 'checkbox' }
    })
}
const pageConfig = {
  modalId: 'modal-container', 
  editorId: 'dynamic-editor',  
  managerId: 'TemporadasTable',
  eventTypes: 'Temporadas',
};
const modalEl = document.getElementById(pageConfig.modalId);
const editorEl = document.getElementById(pageConfig.editorId);
const managerEl = document.getElementById(pageConfig.managerId);

if (!modalEl || !editorEl || !managerEl) {
    console.error("Error: Elementos UI necesarios no encontrados.","modalEl",modalEl,"editorEl",editorEl,"managerEl",managerEl);
}

function openModal(type, data = null) {
  //(modalEl, editorEl, formType, formConfig, data = null,
  openDynamicModalDirect(modalEl, editorEl, type,formTemporadas, data, null, null)
}
async function setTabledata(array,keys) {
  const element = u(`#${pageConfig.managerId}`);
  element.first().data = array;
  element.first().keys = keys;
  
  element.on('action', async (e) => {
    const {originalAction, item} = e.detail
    if (!originalAction) return;
    if (originalAction === "edit"){
      openModal(originalAction,item)
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
function setupModalEventListeners(onCancel = null) {
  const Editelement = u(`#${pageConfig.editorId}`);
  
  Editelement.on('item-upd', async (e) => {
      const savedData = e.detail;
      
  });

   Editelement.on('del-item', async (e) => {
      const itemToDelete = e.detail;
  });

  Editelement.on('cancel', () => {
      console.log("Edición cancelada.");
      modalEl.hide();
      if (onCancel) onCancel();
  });

   modalEl.addEventListener('close', () => {
      console.log("Modal cerrado.");
      modalEl.dataset.currentFormType = '';
   });
}
u(document).on('click', 'button', function (e) {
  const btn = u(this);
  if (btn.attr('data-form-type') !== null) {
    openModal(btn.attr('data-form-type'));
  }
});
u(document).on('DOMContentLoaded',async function () {
  getandset()
  setupModalEventListeners()
  const breadcrumb = u('nav-breadcrumb');
  customElements.whenDefined('nav-breadcrumb').then(() => {
    const element = breadcrumb.nodes[0];
    element.paramNames = ['section', 'category', 'itemId'];
    
  });
});