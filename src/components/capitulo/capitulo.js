import { fetchapi, getParams } from '@utils/fetchapi';
import {rendertables} from '@components/tablejs/inittable.js'
import u from 'umbrellajs';
/*


*/

u(document).on('DOMContentLoaded',async function () {
  const breadcrumb = u('nav-breadcrumb');
  const params = getParams(["1","2","3","4","5"]);
  console.log("params: ", params);



    // this is the breadcrumb element
    customElements.whenDefined('nav-breadcrumb').then(() => {
      const element = breadcrumb.nodes[0];
      element.paramNames = ['1', '2', '3', '4', '5'];
      
    });
});