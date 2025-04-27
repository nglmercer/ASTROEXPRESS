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

// Polyfill for localStorage and window in SSR environments
const storage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
};

var localStorage = typeof window !== 'undefined' 
    ? (window.localStorage || storage)
    : storage;

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
        return this._interceptor(http.put(`${this.host}/catalogo/`, formulario, {
            headers: this._authHeaders()
        }));
    }

    eliminar(modalUpdate) {
        return this._interceptor(http.delete(`${this.host}/catalogo/${modalUpdate.idCatalogo}`, {
            headers: this._authHeaders()
        }));
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
    obtenerUsuarios(pagina, data) {
        return this._interceptor(this.http.get(`${this.host}/usuario/pagina/${pagina}`, {
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

class TemporadaService {
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
        return this._interceptor(http.post(`${this.host}/temporada`, formulario, {
            headers: this._authHeaders()
        }));
    }

    actualizar(formulario) {
        return this._interceptor(http.put(`${this.host}/temporada/`, formulario, {
            headers: this._authHeaders()
        }));
    }

    eliminar(modalUpdate) {
        return this._interceptor(http.delete(`${this.host}/temporada/${modalUpdate.idTemporada}`, {
            headers: this._authHeaders()
        }));
    }
}
const temporadaservice = new TemporadaService(actualBaseApi);
class CapituloService {
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
        return this._interceptor(http.post(`${this.host}/capitulo`, formulario, {
            headers: this._authHeaders()
        }));
    }

    actualizar(formulario) {
        return this._interceptor(http.put(`${this.host}/capitulo/`, formulario, {
            headers: this._authHeaders()
        }));
    }
    eliminar(modalUpdate) {
        return this._interceptor(http.delete(`${this.host}/capitulo/${modalUpdate.idCapitulo}`, {
            headers: this._authHeaders()
        }));
    }
}
const capituloservice = new CapituloService(actualBaseApi);
class LoginService {
    constructor(baseApi) {
        this.host = baseApi;
        this.http = http;
        const info = safeParse(localStorage.getItem("info")) || {};
        this.token = info.token || localStorage.getItem("token");
        this.user = safeParse(info.user || safeParse(localStorage.getItem("user"))) || {};
    }
    _authHeaders() {
        return {};
    }
    // no necesitamos _authHeaders porque no se usan las credenciales para login o registro

    async _interceptor(promise) {
        try {
            const response = await promise;
            return response;
        } catch (error) {
            console.error('Error en la llamada a la API:', error);
            throw error;
        }
    }

    login(formulario) {
            return this._interceptor(http.post(`${this.host}/usuario/sesion`, formulario));
        }
    register(formulario) {
        return this._interceptor(http.post(`${this.host}/usuario/registro`, formulario));
    }
    setTokenUser(token, user) {
        this.token = token;
        localStorage.setItem("token", token);
        this.user = typeof user === 'string' ? safeParse(user) : user;
        const userString = typeof user ==='string' ? user : JSON.stringify(user);
        localStorage.setItem("user", userString);
        console.log("user", userString, "token", this.token, localStorage.getItem("token"), localStorage.getItem("user"));
    }
    isLoggedIn() {
        return this.token && this.user;
    }
    logout() {
        this.token = null;
        localStorage.removeItem("token");
        this.user = null;
        localStorage.removeItem("user");
    }
    recoverPassword(email) {
        // send email code
        //	http://localhost/backnew/recuperacion-contrasena/send-token POST {email:"string@"}
        return this._interceptor(http.post(`${this.host}/recuperacion-contrasena/send-token`, { correoUsuario: email }));
    }
    verifyRecoveryCode(data){
        // /recuperacion-contrasena/verify-token POST 
        const requiredata={"path": "string", "codigo": "325036"}
/*         codigo    : "325036"// CODE
        nuevaContrasena    : "PASSWORD" //newpassword
        path :     "nMwEnLRl7Ta1QvjecE8PqlvuW7YdqVAQJvjYoGFY22Evwl8ESd" */
        return this._interceptor(http.post(`${this.host}/recuperacion-contrasena/verify-token`,data));
    }
    changePassword(data){
        const requiredata={"path": "string", "codigo": "325036","password":"string"}
        return this._interceptor(http.post(`${this.host}/recuperacion-contrasena/update-password`,data));
    }
}
const loginservice = new LoginService(actualBaseApi);
export {
    temporadaservice,
    capituloservice,
    fetchapi,
    getParams,
    loginservice
}
