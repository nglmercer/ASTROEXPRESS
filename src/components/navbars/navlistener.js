import u from 'umbrellajs';
async function initializenav(elname) {
    const element = u(elname);
    if (!element) return;
    element.on('action', async (event) => {
        console.log('Evento de acción recibido:', event.detail);
    });
        

}

u(document).on('DOMContentLoaded', async () => {
    const elname = 'pagination-nav';
    initializenav(elname);
    function getParams(paramNames = []) {
        const urlParams = new URLSearchParams(window.location.search);
        let paramsObject = Object.fromEntries(urlParams.entries());
      
        if (Object.keys(paramsObject).length === 0) {
          const path = window.location.pathname;
          const parts = path.split('/').filter(Boolean); // ["contenido", "catalogos", "2"]
      
          if (parts.length >= paramNames.length) {
            paramsObject = {};
            for (let i = 0; i < paramNames.length; i++) {
              paramsObject[paramNames[i]] = parts[i];
            }
          }
        }
      
        return paramsObject;
      }
      
      // Ejemplo de uso
      const paramsObject = getParams(['split1', 'split2', 'page']);
      console.log("paramsObject", paramsObject);
      
});