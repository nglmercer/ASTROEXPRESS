import { fetchapi, getParams } from '@utils/fetchapi';
import {getURLPATH, redirectTo} from '/src/utils/redirect'
import { openDynamicModalDirect, setupModalListeners} from '/src/components/tablejs/crudUIHelpers.js'; 
import u from 'umbrellajs';
/*
    "idTemporada",
    "numeroTemporada", 
    "nombreTemporada",
    "portadaTemporada",
    "catalogoTemporada",
    "nsfw"

    // capitulo
    export interface IChapterInformation {
      idCapitulo: number;
      numeroCapitulo: number;
      imagenCapitulo: string;
      catalogoCapitulo: number;
      meGustasCapitulo: number;
      noMeGustasCapitulo: number;
      reproduccionesCapitulo: number;
      descripcionCapitulo: string | null;
      tituloCapitulo: string | null;
      pathCapitulo: string | null;
      tiempoCapitulo: number;
      temporadaCapitulo: number;
    }

}
*/
const formTemporadaItems = {
  title: 'Temporada',  
  getInitialData: () => ({
    idCapitulo: 0,
    numeroCapitulo: 0,
    imagenCapitulo: '',
    catalogoCapitulo: 0,
    meGustasCapitulo: 0,
    noMeGustasCapitulo: 0,
    reproduccionesCapitulo: 0,
    descripcionCapitulo: '',
    tituloCapitulo: '',
    pathCapitulo: '',
    tiempoCapitulo: 0,
    temporadaCapitulo: 0,
  }),
  getFieldConfig: async () => ({
    idCapitulo: { label: 'ID Capítulo', type: 'number', hidden: true },
    numeroCapitulo: { label: 'Número', type: 'number', required: true },
    imagenCapitulo: { label: 'Imagen', type: 'text', required: true },
    catalogoCapitulo: { label: 'ID Catálogo', type: 'number', hidden: true },
    meGustasCapitulo: { label: 'Me gusta', type: 'number', required: true },
    noMeGustasCapitulo: { label: 'No me gusta', type: 'number', required: true },
    reproduccionesCapitulo: { label: 'Reproducciones', type: 'number', required: true },
    descripcionCapitulo: { label: 'Descripción', type: 'text' },
    tituloCapitulo: { label: 'Título', type: 'text' },
    pathCapitulo: { label: 'Path', type: 'text' },
    tiempoCapitulo: { label: 'Tiempo', type: 'number', required: true },
    temporadaCapitulo: { label: 'ID Temporada', type: 'number', hidden: true },
  })
}
const pageConfig = {
  modalId: 'modal-container', 
  editorId: 'dynamic-editor',  
  managerId: 'TemporadaTable',
  eventTypes: 'temporada',
};
const modalEl = document.getElementById(pageConfig.modalId);
const editorEl = document.getElementById(pageConfig.editorId);
const managerEl = document.getElementById(pageConfig.managerId);

if (!modalEl || !editorEl || !managerEl) {
    console.error("Error: Elementos UI necesarios no encontrados.","modalEl",modalEl,"editorEl",editorEl,"managerEl",managerEl);
}
const CapitulosKeys = [
  "idCapitulo",
  "numeroCapitulo",
  "imagenCapitulo", 
  "catalogoCapitulo",
  "meGustasCapitulo",
  "noMeGustasCapitulo", 
  "reproduccionesCapitulo",
  "tiempoCapitulo",
  "temporadaCapitulo"
]
async function fetchCapitulos(idCatalogo, idTemporada) {
    try {
        const response = await fetchapi.getCapitulos(idCatalogo, idTemporada); // Asegúrate de que esta función esté definida y exportada correctamente
        console.log('Respuesta de la API:', response);
        return response; // Retorna la respuesta de la API
    } catch (error) {
        console.error('Error en la solicitud:', error);
        return []; // Retorna un arreglo vacío en caso de error
    }
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
u(document).on('DOMContentLoaded',async function () {
  const breadcrumb = u('nav-breadcrumb');
  const params = getParams(["1","2","3","4","5","6","7"]);
  console.log("params: ", params);
  setupModalListeners(modalEl, editorEl, callbacks)
  const response = await fetchapi.getRecursos( params[7]);
  console.log("response: ", response);
    // this is the breadcrumb element
    customElements.whenDefined('nav-breadcrumb').then(() => {
      const element = breadcrumb.nodes[0];
      element.paramNames = ['1', '2', '3', '4', '5'];
      
    });
});