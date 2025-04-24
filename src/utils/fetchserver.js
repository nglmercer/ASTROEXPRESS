const baseApi = "productionUrl";
const baseTestApi = "http://localhost:8080"; // Original test API
const mockApi = "http://localhost:8081/mock-api"; // Mock API endpoint
const actualBaseApi = mockApi; // Use mock API for development
const storage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
};

var localStorage = typeof window !== 'undefined' 
    ? (window.localStorage || storage)
    : storage;
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

    _authHeaders(contentType = 'application/json') { // contentType por defecto es application/json SI PASA NULL ES OBJETO EMPTY
        const defaultHeaders = {
            'Authorization': `${this.token}`
        };
        if (contentType) {
            defaultHeaders['Content-Type'] = contentType;
        }
        return defaultHeaders;
    }

    agregar(formulario) {
        return fetch(`${this.host}/catalogo`, {
            method: 'POST',
            
            headers: this._authHeaders(null),
            body: formulario
        }).then(res => res.json());
    }

    actualizar(formulario) {
        const id = formulario.get("idCatalogo");
        return fetch(`${this.host}/catalogo/${id}`, {
            method: 'POST',
            
            headers: this._authHeaders(null),
            body: formulario
        }).then(res => res.json());
    }

    eliminar(modalUpdate) {
        return fetch(`${this.host}/catalogo/${modalUpdate.idCatalogo}`, {
            method: 'DELETE',
            
            headers: this._authHeaders()
        }).then(res => res.json());
    }

    obtenerFavoritos() {
        return this.http.get(`${this.host}/usuario/${this.user.idUsuario}/favoritos`, {
            
            headers: this._authHeaders()
        });
    }

    agregarFavorito(catalogo) {
        return this.http.post(`${this.host}/usuario/${this.user.idUsuario}/catalogo/${catalogo}/favorito`, {}, {
            
            headers: this._authHeaders()
        });
    }

    verificarFavorito(catalogo) {
        return this.http.get(`${this.host}/usuario/${this.user.idUsuario}/catalogo/${catalogo}/favorito`, {
            
            headers: this._authHeaders()
        });
    }

    obtenerCatalogosRecientes() {
        return this.http.get(`${this.host}/catalogos/recientes`, {
            
            headers: this._authHeaders()
        });
    }

    obtenerInformacionCatalogo(idCatalogo) {
        return this.http.get(`${this.host}/catalogo/${idCatalogo}`, {
            
            headers: this._authHeaders()
        });
    }

    obtenerDirectorio(pagina, data) {
        return this.http.post(`${this.host}/catalogos/pagina/${pagina}`, data, {
            
            headers: this._authHeaders()
        });
    }

    obtenerExistenciaDirectorio(pagina, data) {
        return this.http.post(`${this.host}/catalogos/pagina/${pagina}/exists`, data, {
            
            headers: this._authHeaders()
        });
    }

    obtenerTodoCatalogo(idCatalogo) {
        return this.http.get(`${this.host}/catalogo/${idCatalogo}/info`, {
            
            headers: this._authHeaders()
        });
    }

    buscarCatalogo(data) {
        return this.http.post(`${this.host}/catalogos/buscar`, data, {
            
            headers: this._authHeaders()
        });
    }
    //catalogos/estados
    getEstados() {
        return this.http.get(`${this.host}/catalogos/estados`, {
            
            headers: this._authHeaders()
        });
    }
    //catalogos/tipos
    getTipos() {
        return this.http.get(`${this.host}/catalogos/tipos`, {
            
            headers: this._authHeaders()
        });
    }
    //catalogos/categorias
    getCategorias() {
        return this.http.get(`${this.host}/catalogos/categorias`, {
            
            headers: this._authHeaders()
        });
    }
    // /catalogo/recomendado GET
    getRecomendado() {
        return this.http.get(`${this.host}/catalogo/recomendado`, {
            headers: this._authHeaders()
        });
    }
    // /capitulos/por/estados
    getCapitulosPorEstados() {
        return this.http.get(`${this.host}/capitulos/por/estados`, {
            
            headers: this._authHeaders()
        });
    }
    // /catalogo/aleatorio
    getRandomCatalogo() {
        return this.http.get(`${this.host}/catalogo/aleatorio`, {
            
            headers: this._authHeaders()
        });
    }
    ///catalogo/${id}/info`; GET
    getInfoCatalogo(id) {
        return this.http.get(`${this.host}/catalogo/${id}/info`, {

            headers: this._authHeaders()
       
        });
    }
    ///capitulo/${id}`; GET
    getCapitulo(id) {
        return this.http.get(`${this.host}/capitulo/${id}`, {

            headers: this._authHeaders()
        });
    }
    ///usuario/${id}/historial`;
    getHistorial(id) {
        return this.http.get(`${this.host}/usuario/${id}/historial`, {

            headers: this._authHeaders("application/json")
        });
    }
    ///usuario/${id}/favoritos`;
    getFavoritos(id) {
        return this.http.get(`${this.host}/usuario/${id}/favoritos`, {

            headers: this._authHeaders("application/json")
        });
    }
// /* /catalogo/5069/temporada/177/capitulo/64829/siguienteOAnterior*/
    obtenerSiguienteOAnterior(idCatalogo, numeroTemporada, numeroCapitulo) {
        //var headers = this.headersVariable.set('Authorization', this.token);
    //  return this.http.get(this.host+"/catalogo/"+idCatalogo+"/temporada/"+numeroTemporada+"/capitulo/"+numeroCapitulo+"/siguienteOAnterior",{
    return this.http.get(`${this.host}/catalogo/${idCatalogo}/temporada/${numeroTemporada}/capitulo/${numeroCapitulo}/siguienteOAnterior`, {
        
        headers: this._authHeaders()
    });
    }
    // get catalogotemporadas /catalogo/${idCatalogo}/temporadas /catalogo/5069/temporadas
    getTemporadas(idCatalogo) {
        return this.http.get(`${this.host}/catalogo/${idCatalogo}/temporadas`, {
            
            headers: this._authHeaders()
        });
    }
    //GET/catalogo/5070/temporada/179/capitulos
    getCapitulos(idCatalogo, idTemporada) {
        return this.http.get(`${this.host}/catalogo/${idCatalogo}/temporada/${idTemporada}/capitulos`, {
            
            headers: this._authHeaders()
        });
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
    rolesfetch
}
