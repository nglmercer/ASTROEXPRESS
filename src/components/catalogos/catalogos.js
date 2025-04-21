import { fetchcatalogos, getKeysFromArray} from '@components/tablejs/init1.js';
import {rendertables} from '@components/tablejs/inittable.js'

import u from 'umbrellajs';
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