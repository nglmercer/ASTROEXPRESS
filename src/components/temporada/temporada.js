import { fetchapi } from '/src/utils/fetchapi.js'; // Ajusta ruta

async function fetchcatalogobyid(id) {
    try {
        const response = await fetchapi.obtenerInformacionCatalogo(id);
        console.log('Respuesta de la API:', response);
        return response; // Retorna la respuesta de la API
    } catch (error) {
        console.error('Error en la solicitud:', error);
        return null; // Retorna null en caso de error
    }
    
}
/* fetchcatalogobyid(4990).then(data => {
    console.log('Catálogo obtenido:', data);
}).catch(error => {
    console.error('Error al obtener el catálogo:', error);
} ); */
document.addEventListener('DOMContentLoaded', async () => {
/*     const catalogoId = 4990; // Cambia esto por el ID que necesites
    const catalogoData = await fetchcatalogobyid(catalogoId);
    console.log('Datos del catálogo:', catalogoData); */

    // Aquí puedes usar catalogoData para lo que necesites
    const pageNum = document.querySelector('.content').dataset.pageNum;
    if (pageNum){
        console.log("Page Number:", pageNum, typeof pageNum);

    }
}
);