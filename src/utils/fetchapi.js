const baseApi = "productionUrl";
const baseTestApi = "http://localhost:8080"; // Original test API
const mockApi = "http://localhost:8081/mock-api"; // Mock API endpoint
const actualBaseApi = mockApi; // Use mock API for development
const http = {
    get: (url, options = {}) => {
        return fetch(url, {
            method: 'GET',
            ...options
        }).then(res => res.json());
    },
    post: (url, body = {}, options = {}) => {
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            body: JSON.stringify(body),
            ...options
        }).then(res => res.json());
    },
    put: (url, body = {}, options = {}) => {
        return fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            body: JSON.stringify(body),
            ...options
        }).then(res => res.json());
    },
    delete: (url, options = {}) => {
        return fetch(url, {
            method: 'DELETE',
            ...options
        }).then(res => res.json());
    }
};
// catalogo post, envia un objeto para agregar un catalogo -- agregar
// catalogo put, actualiza un catalogo --- actualizar
// catalogo delete, elimina un catalogo --- eliminar
export var localStorage  = typeof window !== 'undefined' && typeof localStorage !== 'undefined'
  ? localStorage
  : {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    };
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
      
function safeParse(value) {
    try {
        // Si ya es un array u objeto, lo devolvemos tal cual
        if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
            return value;
        }

        // Si es un string que empieza con { o [, intentamos parsearlo
        if (typeof value === 'string' && (value.trim().startsWith('{') || value.trim().startsWith('['))) {
            try {
                return JSON.parse(value); // Intento normal
            } catch (error) {
                // Si falla, intentamos corregirlo
                const fixedJson = value
                    .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":') // Poner comillas en claves
                    .replace(/:\s*'([^']+)'/g, ': "$1"'); // Reemplazar comillas simples por dobles en valores

                return JSON.parse(fixedJson); // Reintento con JSON corregido
            }
        }

        // Si es otro tipo de dato (número, booleano, etc.), lo devolvemos sin cambios
        return value;
    } catch (error) {
        console.error("Error al parsear JSON:", error, "Valor recibido:", value);
        return value; // Retorna el valor original si no se puede parsear
    }
}
class FetchApi {
    constructor(baseApi) {
        this.host = baseApi;
        this.http = http;
        const info = safeParse(localStorage.getItem("info")) || {};
        this.token = info.token || localStorage.getItem("token");
        this.user = safeParse(info.user || safeParse(localStorage.getItem("user"))) || {};
    }

    _authHeaders(contentType = 'application/json') {
        const defaultHeaders = {
            'Authorization': `${this.token}`
        };
        if (contentType) {
            defaultHeaders['Content-Type'] = contentType;
        }
        return defaultHeaders;
    }

    async _interceptor(promise) {
        try {
            const response = await promise;
            return response;
        } catch (error) {
            console.error('Error en la llamada a la API:', error);
            throw error;
        }
    }

    agregar(formulario) {
        return this._interceptor(http.post(`${this.host}/catalogo`, formulario, {
            headers: this._authHeaders()
        }));
    }

    actualizar(formulario) {
        return this._interceptor(http.post(`${this.host}/catalogo/${formulario.get("idCatalogo")}`, formulario, {
            headers: this._authHeaders()
        }));
    }

    eliminar(modalUpdate) {
        return this._interceptor(fetch(`${this.host}/catalogo/${modalUpdate.idCatalogo}`, {
            method: 'DELETE',
            headers: this._authHeaders()
        }).then(res => res.json()));
    }

    obtenerFavoritos() {
        return this._interceptor(this.http.get(`${this.host}/usuario/${this.user.idUsuario}/favoritos`, {
            headers: this._authHeaders()
        }));
    }

    agregarFavorito(catalogo) {
        return this._interceptor(this.http.post(`${this.host}/usuario/${this.user.idUsuario}/catalogo/${catalogo}/favorito`, {}, {
            headers: this._authHeaders()
        }));
    }

    verificarFavorito(catalogo) {
        return this._interceptor(this.http.get(`${this.host}/usuario/${this.user.idUsuario}/catalogo/${catalogo}/favorito`, {
            headers: this._authHeaders()
        }));
    }

    obtenerCatalogosRecientes() {
        return this._interceptor(this.http.get(`${this.host}/catalogos/recientes`, {
            headers: this._authHeaders()
        }));
    }

    obtenerInformacionCatalogo(idCatalogo) {
        return this._interceptor(this.http.get(`${this.host}/catalogo/${idCatalogo}`, {
            headers: this._authHeaders()
        }));
    }

    obtenerDirectorio(pagina, data) {
        return this._interceptor(this.http.post(`${this.host}/catalogos/pagina/${pagina}`, data, {
            headers: this._authHeaders()
        }));
    }

    obtenerExistenciaDirectorio(pagina, data) {
        return this._interceptor(this.http.post(`${this.host}/catalogos/pagina/${pagina}/exists`, data, {
            headers: this._authHeaders()
        }));
    }

    obtenerTodoCatalogo(idCatalogo) {
        return this._interceptor(this.http.get(`${this.host}/catalogo/${idCatalogo}/info`, {
            headers: this._authHeaders()
        }));
    }

    buscarCatalogo(data) {
        return this._interceptor(this.http.post(`${this.host}/catalogos/buscar`, data, {
            headers: this._authHeaders()
        }));
    }

    getEstados() {
        return this._interceptor(this.http.get(`${this.host}/catalogos/estados`, {
            headers: this._authHeaders()
        }));
    }

    getTipos() {
        return this._interceptor(this.http.get(`${this.host}/catalogos/tipos`, {
            headers: this._authHeaders()
        }));
    }

    getCategorias() {
        return this._interceptor(this.http.get(`${this.host}/catalogos/categorias`, {
            headers: this._authHeaders()
        }));
    }

    getRecomendado() {
        return this._interceptor(this.http.get(`${this.host}/catalogo/recomendado`, {
            headers: this._authHeaders()
        }));
    }

    getCapitulosPorEstados() {
        return this._interceptor(this.http.get(`${this.host}/capitulos/por/estados`, {
            headers: this._authHeaders()
        }));
    }

    getRandomCatalogo() {
        return this._interceptor(this.http.get(`${this.host}/catalogo/aleatorio`, {
            headers: this._authHeaders()
        }));
    }

    getInfoCatalogo(id) {
        return this._interceptor(this.http.get(`${this.host}/catalogo/${id}/info`, {
            headers: this._authHeaders()
        }));
    }

    getCapitulo(id) {
        return this._interceptor(this.http.get(`${this.host}/capitulo/${id}`, {
            headers: this._authHeaders()
        }));
    }

    getHistorial(id) {
        return this._interceptor(this.http.get(`${this.host}/usuario/${id}/historial`, {
            headers: this._authHeaders("application/json")
        }));
    }

    getFavoritos(id) {
        return this._interceptor(this.http.get(`${this.host}/usuario/${id}/favoritos`, {
            headers: this._authHeaders("application/json")
        }));
    }

    obtenerSiguienteOAnterior(idCatalogo, numeroTemporada, numeroCapitulo) {
        return this._interceptor(this.http.get(`${this.host}/catalogo/${idCatalogo}/temporada/${numeroTemporada}/capitulo/${numeroCapitulo}/siguienteOAnterior`, {
            headers: this._authHeaders()
        }));
    }

    getTemporadas(idCatalogo) {
        return this._interceptor(this.http.get(`${this.host}/catalogo/${idCatalogo}/temporadas`, {
            headers: this._authHeaders()
        }));
    }

    getCapitulos(idCatalogo, idTemporada) {
        return this._interceptor(this.http.get(`${this.host}/catalogo/${idCatalogo}/temporada/${idTemporada}/capitulos`, {
            headers: this._authHeaders()
        }));
    }
    getRecursos(idCapitulo) {
        return this._interceptor(this.http.get(`${this.host}/res/recursos/${idCapitulo}`, {
            headers: this._authHeaders()
        }));
    }
}

const fetchapi = new FetchApi(actualBaseApi);

class CategoriasService {
    constructor(baseApi) {
        this.host = baseApi;
        const info = safeParse(localStorage.getItem("info")) || {};
        this.token = info.token || localStorage.getItem("token");
        this.user = safeParse(info.user || safeParse(localStorage.getItem("user"))) || {};
    }

    _authHeaders(contentType = 'application/json') { // contentType por defecto es application/json SI PASA NULL ES OBJETO EMPTY
        const defaultHeaders = {
            'Authorization': `${this.token}`
        };
        if (contentType) {
            defaultHeaders['Content-Type'] = contentType;
        }
        return defaultHeaders;
    }

    listar(pagina) {
        return http.get(`${this.host}/categorias/pagina/${pagina}`, {
            
            headers: this._authHeaders()
        });
    }

    listarTodo() {
        const options = this.token
            ? { 
                headers: this._authHeaders() }
            : {};
        return http.get(`${this.host}/catalogos/categorias`, options);
    }

    agregar(modelAdd) {
        const options = this.token
            ? { 
                headers: this._authHeaders() }
            : {};
        return http.post(`${this.host}/categoria`, modelAdd, options);
    }

    actualizar(modelAdd) {
        const options = this.token
            ? { 
                headers: this._authHeaders() }
            : {};
        return http.put(`${this.host}/categoria/${modelAdd.idCategoria}`, modelAdd, options);
    }

    eliminar(modelAdd) {
        const options = this.token
            ? { 
                headers: this._authHeaders() }
            : {};
        return http.delete(`${this.host}/categoria/${modelAdd.idCategoria}`, options);
    }
}
class UsuariosService {
    constructor(baseApi) {
        this.host = baseApi;
        const info = safeParse(localStorage.getItem("info")) || {};
        this.token = info.token || localStorage.getItem("token");
        this.user = safeParse(info.user || safeParse(localStorage.getItem("user"))) || {};
    }

    _authHeaders(contentType = 'application/json') { // contentType por defecto es application/json SI PASA NULL ES OBJETO EMPTY
        const defaultHeaders = {
            'Authorization': `${this.token}`
        };
        if (contentType) {
            defaultHeaders['Content-Type'] = contentType;
        }
        return defaultHeaders;
    }

    obtenerDatosPov(idUsuario) {
        return http.get(`${this.host}/usuario/pov/${idUsuario}`, {
            
            headers: this._authHeaders()
        });
    }

    buscar(pagina, model) {
        return http.post(`${this.host}/usuarios/buscar/pagina/${pagina}`, model, {
            
            headers: this._authHeaders()
        });
    }

    sesion(model) {
        return http.post(`${this.host}/usuario/sesion`, model);
    }

    update() {
        return http.put(`${this.host}/token/actualizar`, {}, {
            
            headers: this._authHeaders()
        });
    }

    registrar(model) {
        return http.post(`${this.host}/usuario/registro`, model);
    }

    listar(pagina) {
        return http.get(`${this.host}/roles/pagina/${pagina}`, {
            
            headers: this._authHeaders()
        });
    }

    actualizar(modelAdd) {
        return http.put(`${this.host}/rol/${modelAdd.idRol}`, modelAdd, {
            
            headers: this._authHeaders()
        });
    }

    eliminar(modelAdd) {
        return http.delete(`${this.host}/rol/${modelAdd.idRol}`, {
            
            headers: this._authHeaders()
        });
    }

    integrarNotificacion(modelAdd) {
        const userId = this.user?.idUsuario ?? 0;
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        if (this.token) headers.append('Authorization', this.token);

        return http.post(`${this.host}/usuario/${userId}/notificacion`, modelAdd, {
            headers
        });
    }

    clear() {
        this.token = null;
        this.user = null;
    }

    obtenerDatosUsuario() {
        return http.get(`${this.host}/usuario/${this.user.idUsuario}`, {
            
            headers: this._authHeaders()
        });
    }

    toggleNsfwUsuario() {
        return http.put(`${this.host}/usuario/${this.user.idUsuario}/nsfw`, {}, {
            
            headers: this._authHeaders()
        });
    }
}
class RolesService {
    constructor(baseApi) {
        this.host = baseApi;
        const info = safeParse(localStorage.getItem("info")) || {};
        this.token = info.token || localStorage.getItem("token");
        this.user = safeParse(info.user || safeParse(localStorage.getItem("user"))) || {};
    }

    _authHeaders(contentType = 'application/json') { // contentType por defecto es application/json SI PASA NULL ES OBJETO EMPTY
        const defaultHeaders = {
            'Authorization': `${this.token}`
        };
        if (contentType) {
            defaultHeaders['Content-Type'] = contentType;
        }
        return defaultHeaders;
    }

    listar(pagina) {
        return http.get(`${this.host}/roles/pagina/${pagina}`, {
            
            headers: this._authHeaders()
        });
    }

    agregar(modelAdd) {
        return http.post(`${this.host}/rol`, modelAdd, {
            
            headers: this._authHeaders()
        });
    }

    actualizar(modelAdd) {
        return http.put(`${this.host}/rol/${modelAdd.idRol}`, modelAdd, {
            
            headers: this._authHeaders()
        });
    }

    eliminar(modelAdd) {
        return http.delete(`${this.host}/rol/${modelAdd.idRol}`, {
            
            headers: this._authHeaders()
        });
    }
}
const categoriafetch = new CategoriasService(actualBaseApi);
const usuariosfetch = new UsuariosService(actualBaseApi);
const rolesfetch = new RolesService(actualBaseApi);

export {
    fetchapi,
    categoriafetch,
    usuariosfetch,
    rolesfetch,
    getParams
}
