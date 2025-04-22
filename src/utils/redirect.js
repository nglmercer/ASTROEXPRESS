function getURLPATH(data) {
    const PathOBJ = {};
    let finalPath = '';
    const baseURL = '/contenido/'; // Asegúrate de definir baseURL o usar window.baseURL || 

    if (!data) return { path: finalPath, params: PathOBJ };

    const urlparams = getParams(['a', 'b', 'catalogoid', 'c', 'temporadaid', 'd', 'capitulo']);

    const catalogoid = data.catalogoid || data.catalogoId || data.idCatalogo 
    const temporadaid = data.temporadaid || data.temporadaId || data.idTemporada 
    const capitulo = data.capitulo || data.capituloId || data.idcapitulo || data.idCapitulo
    if (catalogoid) {
        PathOBJ.catalogoid = catalogoid;
        finalPath = `${baseURL}catalogo/${catalogoid}`;
    } else {
        PathOBJ.catalogoid = urlparams.catalogoid || '';
    }

    if (temporadaid) {
        PathOBJ.temporadaid = temporadaid;
        finalPath = `${baseURL}catalogo/${PathOBJ.catalogoid}/temporada/${temporadaid}`;
    } else {
        PathOBJ.temporadaid = urlparams.temporadaid || '';
    }

    if (capitulo) {
        PathOBJ.capitulo = capitulo;
        finalPath = `${baseURL}catalogo/${PathOBJ.catalogoid}/temporada/${PathOBJ.temporadaid}/capitulo/${capitulo}`;
    } else {
        PathOBJ.capitulo = urlparams.capitulo || '';
    }

    console.log("getURLPATH", { PathOBJ, urlparams, finalPath });

    return { path: finalPath, params: PathOBJ };
}

function getParams(paramNames = []) {
    if (typeof window === 'undefined') {
        console.error("getParams: window is not defined");
        return {};
    }

    const urlParams = new URLSearchParams(window.location.search);
    let paramsObject = Object.fromEntries(urlParams.entries());

    // Si no hay parámetros en el query string, intenta extraer del pathname
    if (Object.keys(paramsObject).length === 0) {
        const path = window.location.pathname;
        const parts = path.split('/').filter(Boolean); // Divide la URL en segmentos

        // Asigna valores a los parámetros según los segmentos disponibles
        paramsObject = {};
        for (let i = 0; i < paramNames.length && i < parts.length; i++) {
            paramsObject[paramNames[i]] = parts[i] || '';
        }

        if (parts.length < paramNames.length) {
            console.warn(`getParams: insufficient path parts (got ${parts.length}, expected up to ${paramNames.length})`);
        }
    }

    return paramsObject;
}
function redirectTo(path, options = {}) {
    // Validar que la ruta sea una cadena no vacía
    if (!path || typeof path !== 'string') {
        console.error('Redirección fallida: la ruta no es válida.',);
        return;
    }

    // Opciones por defecto
    const { replace = false, triggerPopstate = false, redirect = true } = options;

    try {
        // Usar replaceState en lugar de pushState si replace es true
        if (replace) {
            window.history.replaceState({}, '', path);
        } else if (redirect) {
            window.location.href = path; // Redirigir a la nueva URL
        } else {
            window.history.pushState({}, '', path);
        }

        // Disparar evento popstate si está habilitado
        if (triggerPopstate) {
            window.dispatchEvent(new Event('popstate'));
        }
    } catch (error) {
        console.error('Error al redirigir:', error);
    }
}
export {getURLPATH, redirectTo, getParams};