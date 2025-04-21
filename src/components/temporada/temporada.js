import { fetchapi, getParams } from '@utils/fetchapi';
import { getKeysFromArray} from '@components/tablejs/init1.js';
import {rendertables} from '@components/tablejs/inittable.js'
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
import u from 'umbrellajs';
u(document).on('DOMContentLoaded',async function () {
  const navelement = u('pagination-nav');
  const page = navelement.nodes[0]?.currentPage || 1; 
  console.log("render data for page: ", page,navelement);
/*   const arrayresponse = await fetchcatalogos(page);
  const keys = getKeysFromArray(arrayresponse.data);
  rendertables(arrayresponse.data, "catalogo", keys); */
    const breadcrumb = u('nav-breadcrumb');
    const element = breadcrumb.nodes[0];
    const params = getParams(["1","2","3","4","5"]);
    console.log("params: ", params);
    const response = await fetchCapitulos(params[3], params[5]);
    console.log("response: ", response);
    const keys = getKeysFromArray(response);
    rendertables(response, "catalogo", keys);
});