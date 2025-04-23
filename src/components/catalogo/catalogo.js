import {tiposcatalogos} from '/src/config/tiposcatalogos.json';
import {estadoscatalogos} from '/src/config/estadoscatalogos.json';
import createSelectOptions from '/src/utils/selectmap.js';
import { fetchapi, getParams,temporadaservice  } from '@utils/fetchapi';
import {   toSingle,  toArray} from '/src/utils/arrayOBJ'; 
import {getURLPATH, redirectTo} from '/src/utils/redirect'
import { openDynamicModalDirect, setupModalListeners} from '/src/components/tablejs/crudUIHelpers.js'; 
import u from 'umbrellajs';
/*

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
        catalogoTemporada: Number(getParams([1,2,3])[3]),
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
  openDynamicModalDirect(modalEl, editorEl, type,formTemporadas, data, null, null)
}
const callbacks = {
  'item-upd': async (data) => {
    console.log("catalogo:upd",data);
        modalEl.hide();
    if (data.idTemporada === 0){
      const response = await temporadaservice.agregar(data);
      console.log("response: ", response);
    } else {
      const response = await temporadaservice.actualizar(data);
      console.log("response: ", response);
    }
  },
  'del-item': async (data) => {
    console.log("catalogo:del",data);
  },
  'cancel': async (data) => {
    console.log("catalogo:cancel",data);
    modalEl.hide();

  },
  'delete': async (data) => {
    //no se utiliza pero esta como referencia
    console.log("delete",data);
  }
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
    if (originalAction === "delete"){
      console.log("delete",item)
      const response = await temporadaservice.eliminar(item);
      console.log("response: ", response);
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
  getandset()
  setupModalListeners(modalEl, editorEl, callbacks)
  const breadcrumb = u('nav-breadcrumb');
  customElements.whenDefined('nav-breadcrumb').then(() => {
    const element = breadcrumb.nodes[0];
    element.paramNames = ['section', 'category', 'itemId'];
    
  });
});