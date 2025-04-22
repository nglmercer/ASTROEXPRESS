import { fetchapi, getParams } from '@utils/fetchapi';
import {rendertables} from '@components/tablejs/inittable.js'
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

*/
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
u(document).on('DOMContentLoaded',async function () {
  const breadcrumb = u('nav-breadcrumb');
  const params = getParams(["1","2","3","4","5"]);
  console.log("params: ", params);
  const response = await fetchCapitulos(params[3], params[5]);
  console.log("response: ", response);
  rendertables(response, "catalogo", CapitulosKeys); 


    // this is the breadcrumb element
    customElements.whenDefined('nav-breadcrumb').then(() => {
      const element = breadcrumb.nodes[0];
      element.paramNames = ['1', '2', '3', '4', '5'];
      
    });
});