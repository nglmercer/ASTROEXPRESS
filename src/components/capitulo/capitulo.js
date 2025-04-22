import { fetchapi, getParams } from '@utils/fetchapi';
import { openDynamicModalDirect, setupModalListeners} from '/src/components/tablejs/crudUIHelpers.js'; 
import {rendertablewithE} from '@components/tablejs/inittable.js'

import u from 'umbrellajs';

const formCapituloItems = {
  audios: {
    title: 'Audio',
    getInitialData: () => ({
      id: 0,
      nombre: '',
      lenguaje: '',
      estado: 0,
      idCapitulo: 0,
      ruta: ''
    }),
    getFieldConfig: async () => ({
      id: { label: 'ID', type: 'number', hidden: true },
      nombre: { label: 'Nombre', type: 'text', required: true },
      lenguaje: { label: 'Lenguaje', type: 'text', required: true },
      estado: { label: 'Estado', type: 'number', required: true },
      idCapitulo: { label: 'ID Capítulo', type: 'number', hidden: true },
      ruta: { label: 'Ruta', type: 'text', required: true }
    })
  },
  resoluciones: {
    title: 'Resolución',
    getInitialData: () => ({
      id: 0,
      anchoDeBanda: '',
      promedioAnchoDeBanda: '',
      estado: 0,
      idCapitulo: 0,
      resolucion: '',
      ruta: ''
    }),
    getFieldConfig: async () => ({
      id: { label: 'ID', type: 'number', hidden: true },
      anchoDeBanda: { label: 'Ancho de Banda', type: 'text', required: true },
      promedioAnchoDeBanda: { label: 'Promedio Ancho de Banda', type: 'text', required: true },
      estado: { label: 'Estado', type: 'number', required: true },
      idCapitulo: { label: 'ID Capítulo', type: 'number', hidden: true },
      resolucion: { label: 'Resolución', type: 'text', required: true },
      ruta: { label: 'Ruta', type: 'text', required: true }
    })
  },
  subtitulos: {
    title: 'Subtítulo',
    getInitialData: () => ({
      id: 0,
      nombre: '',
      lenguaje: '',
      lenguaje2: '',
      estado: 0,
      idCapitulo: 0,
      ruta: '',
      versiona: 0,
      autoSeleccionado: false,
      forzado: false,
      porDefecto: false
    }),
    getFieldConfig: async () => ({
      id: { label: 'ID', type: 'number', hidden: true },
      nombre: { label: 'Nombre', type: 'text', required: true },
      lenguaje: { label: 'Lenguaje', type: 'text', required: true },
      lenguaje2: { label: 'Lenguaje 2', type: 'text' },
      estado: { label: 'Estado', type: 'number', required: true },
      idCapitulo: { label: 'ID Capítulo', type: 'number', hidden: true },
      ruta: { label: 'Ruta', type: 'text', required: true },
      versiona: { label: 'Versiona', type: 'number', required: true },
      autoSeleccionado: { label: 'Auto Seleccionado', type: 'boolean' },
      forzado: { label: 'Forzado', type: 'boolean' },
      porDefecto: { label: 'Por Defecto', type: 'boolean' }
    })
  }
}
const pageConfig = {
  modalId: 'modal-container', 
  editorId: 'dynamic-editor',  
  audio: 'audios-table',
  subtitulos: 'subtitulos-table',
  resoluciones: 'resoluciones-table',
};
const modalEl = document.getElementById(pageConfig.modalId);
const editorEl = document.getElementById(pageConfig.editorId);
const audiosEl = document.getElementById(pageConfig.audio);
const subtitulosEl = document.getElementById(pageConfig.subtitulos);
const resolucionesEl = document.getElementById(pageConfig.resoluciones);

if (!modalEl || !editorEl || !audiosEl ||!subtitulosEl ||!resolucionesEl) {
    console.error("Error: Elementos UI necesarios no encontrados.",{modalEl,editorEl,audiosEl,subtitulosEl,resolucionesEl});
}



function openModal(type, data = null) {
  openDynamicModalDirect(modalEl, editorEl, type,formTemporadaItems, data, null, null)
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
    }
  });
}

const callbacks = {
  'item-upd': async (data) => {
    console.log("catalogo:upd",data);
        modalEl.hide();

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
function returnfirstKeys(array) {
  // default 
  // return ["id","nombre","lenguaje","estado"]
  if (!Array.isArray(array) || array.length === 0) return [];
  const keys = Object.keys(array[0]); // Obtener las claves del primer objeto
  const keysToDisplay = keys.slice(0, 6); // Limitar a las primeras N claves
  return keysToDisplay
}
u(document).on('DOMContentLoaded',async function () {
  const breadcrumb = u('nav-breadcrumb');
  const params = getParams(["1","2","3","4","5","6","7"]);
  console.log("params: ", params);
  setupModalListeners(modalEl, editorEl, callbacks)
  const response = await fetchapi.getRecursos( params[7]);
  console.log("response: ", response);
  const {audios,subtitulos,resoluciones} = response;
  const defaultkeys = ["id","nombre","lenguaje","estado"]
  rendertablewithE({
    element: audiosEl,
    keys:defaultkeys,
    array:audios
  });
  rendertablewithE({
    element: subtitulosEl,
    keys:defaultkeys,
    array:subtitulos
  });
  rendertablewithE({
    element: resolucionesEl,
    keys:returnfirstKeys(resoluciones),
    array:resoluciones
  });
    // this is the breadcrumb element
    customElements.whenDefined('nav-breadcrumb').then(() => {
      const element = breadcrumb.nodes[0];
      element.paramNames = ['1', '2', '3', '4', '5'];
      
    });
});