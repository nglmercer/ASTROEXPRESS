import express from 'express';
import { dbController } from '../backupdb.js';
const router = express.Router();

// Middleware para parsear JSON
router.use(express.json());

// Middleware para simular la autenticación
const checkAuth = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        next();
    } else {
        res.status(401).json({ message: 'No autorizado: Token inválido o ausente.' });
    }
};

// Middleware para autenticación opcional
const checkAuthOptional = (req, res, next) => {
    const token = req.headers.authorization;
    if (token === '1234' || !token) {
        next();
    } else {
        res.status(401).json({ message: 'No autorizado: Token inválido.' });
    }
};

// Define un tamaño de página por defecto
const DEFAULT_PAGE_SIZE = 20;
// GET /categorias/pagina/:pagina (Requiere Auth) - Obtener categorías paginadas
router.get('/categorias/pagina/:pagina', checkAuth, async (req, res) => {
    const pagina = parseInt(req.params.pagina, 10);
    const page = pagina
    if (isNaN(pagina) || pagina < 1) {
        return res.status(400).json({ message: 'Número de página inválido' });
    }
    try {
        const data = await dbController.getRecordsWithPagination({
            tableName: 'categorias',
            page
        });
        const totalCount = await dbController.getRowCount('categorias');
        const totalPaginas = Math.ceil(totalCount / 20);

        res.json({
            data: data,
            totalPaginas: totalPaginas
        });
    } catch (error) {
        console.error('Error al obtener categorías paginadas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// GET /catalogo/:idCatalogo (Requiere Auth) - Obtener un catálogo por ID
router.get('/catalogo/:idCatalogo', checkAuth, async (req, res) => {
    const { idCatalogo } = req.params;
    try {
        const catalogo = await dbController.queryWithFilters('catalogos', { idCatalogo: idCatalogo });
        if (catalogo) {
            res.json(catalogo);
        } else {
            res.status(404).json({ message: 'Catálogo no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener catálogo por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// GET /catalogo/:idCatalogo/info (Requiere Auth) - Obtener información detallada de un catálogo
router.get('/catalogo/:idCatalogo/info', checkAuth, async (req, res) => {
    const { idCatalogo } = req.params;
    try {
        const catalogo = await dbController.queryWithFilters('catalogos', { idCatalogo: idCatalogo });
        if (catalogo) {
            res.json(catalogo);
        } else {
            res.status(404).json({ message: 'Catálogo no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener información detallada del catálogo:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// GET /catalogo/:idCatalogo/temporadas/ (Requiere Auth)
router.get('/catalogo/:idCatalogo/temporadas/', checkAuth, async (req, res) => {
    try {
        const { idCatalogo } = req.params;
        const temporadas = await dbController.queryWithFilters('temporadas', { catalogoTemporada: idCatalogo });
        if (temporadas) {
            res.json(temporadas);
        } else {
            res.status(404).json({ message: 'Temporada no encontrada' });
        }
    } catch (error) {
        console.error('Error al obtener información de la temporada:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// GET /catalogo/:idCatalogo/temporada/:idTemporada/capitulos (Requiere Auth)
router.get('/catalogo/:idCatalogo/temporada/:idTemporada/capitulos', checkAuth, async (req, res) => {
    try {
        const { idCatalogo, idTemporada } = req.params;
        const capitulos = await dbController.queryWithFilters('capitulos', { 
            catalogoCapitulo: idCatalogo, 
            temporadaCapitulo: idTemporada 
        });
        if (capitulos) {
            res.json(capitulos);
        } else {
            res.status(404).json({ message: 'Capítulos no encontrados' });
        }
    } catch (error) {
        console.error('Error al obtener información de los capítulos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// GET /catalogos/estados (Requiere Auth) - Obtener todos los estados de catálogos
router.get('/catalogos/estados', checkAuth, async (req, res) => {
    try {
        const estados = await dbController.getRecords('estadoscatalogos');
        res.json(estados);
    } catch (error) {
        console.error('Error al obtener estados de catálogos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// GET /catalogos/tipos (Requiere Auth) - Obtener todos los tipos de catálogos
router.get('/catalogos/tipos', checkAuth, async (req, res) => {
    try {
        const tipos = await dbController.getRecords('tiposcatalogos');
        res.json(tipos);
    } catch (error) {
        console.error('Error al obtener tipos de catálogos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// GET /catalogos/categorias (Auth Opcional)
router.get('/catalogos/categorias', checkAuthOptional, async (req, res) => {
    try {
        const categorias = await dbController.getRecords('categorias');
        res.json(categorias);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// GET /capitulo/:id (Requiere Auth) - Obtener un capítulo por ID
router.get('/capitulo/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const capitulo = await dbController.getById('capitulos', id);
        if (capitulo) {
            res.json(capitulo);
        } else {
            res.status(404).json({ message: 'Capítulo no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener capítulo por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// GET /usuario/:id/historial (Requiere Auth) - Obtener historial de usuario
router.get('/usuario/:id/historial', checkAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const historial = await dbController.queryWithFilters('historial', { usuarioHistorial: id });
        res.json(historial);
    } catch (error) {
        console.error('Error al obtener historial del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// GET /usuario/:idUsuario/favoritos (Requiere Auth) - Obtener favoritos del usuario
router.get('/usuario/:idUsuario/favoritos', checkAuth, async (req, res) => {
    const { idUsuario } = req.params;
    try {
        const favoritos = await dbController.queryWithFilters('favoritos', { usuarioFavorito: idUsuario });
        res.json(favoritos);
    } catch (error) {
        console.error('Error al obtener favoritos del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// GET /usuario/:idUsuario/catalogo/:catalogo/favorito (Requiere Auth)
router.get('/usuario/:idUsuario/catalogo/:catalogo/favorito', checkAuth, async (req, res) => {
    const { idUsuario, catalogo } = req.params;
    try {
        const favorito = await dbController.queryWithFilters('favoritos', {
            usuarioFavorito: idUsuario,
            catalogoFavorito: catalogo
        });
        const esFavorito = favorito !== null && favorito !== undefined && 
                         (Array.isArray(favorito) ? favorito.length > 0 : true);
        res.json({ esFavorito: esFavorito });
    } catch (error) {
        console.error('Error al verificar favorito:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});


// GET /usuario/pov/:idUsuario (Requiere Auth) - Obtener datos públicos de un usuario por ID
router.get('/usuario/pov/:idUsuario', checkAuth, async (req, res) => {
    const { idUsuario } = req.params;
    try {
        const usuario = await dbController.getById('usuarios', idUsuario);
        if (usuario) {
            res.json(usuario);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener usuario POV por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// GET /usuario/:idUsuario (Requiere Auth) - Obtener datos completos de un usuario por ID
router.get('/usuario/:idUsuario', checkAuth, async (req, res) => {
    const { idUsuario } = req.params;
    try {
        const usuario = await dbController.getById('usuarios', idUsuario);
        if (usuario) {
            res.json(usuario);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});
router.get('/usuario/pagina/:pagina', checkAuth, async (req, res) => {
    const pagina = parseInt(req.params.pagina, 10);
    const page = pagina;
    if (isNaN(pagina) || pagina < 1) {
        return res.status(400).json({ message: 'Número de página inválido' });
    }
    try {
        const data = await dbController.getRecordsWithPagination({
            tableName: 'usuarios',
            page
        });
        const totalCount = await dbController.getRowCount('usuarios');
        const totalPaginas = Math.ceil(totalCount / DEFAULT_PAGE_SIZE);

        // Filter out sensitive data like password/claveUsuario
        const processedData = data.map(user => {
            const { password, claveUsuario, ...restOfData } = user;
            return restOfData;
        });

        res.json({
            data: processedData,
            totalPaginas: totalPaginas
        });
    } catch (error) {
        console.error('Error al obtener usuarios paginados:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});
// GET /roles/pagina/:pagina (Requiere Auth) - Obtener roles paginados
router.get('/roles/pagina/:pagina', checkAuth, async (req, res) => {
    const pagina = parseInt(req.params.pagina, 10);
    if (isNaN(pagina) || pagina < 1) {
        return res.status(400).json({ message: 'Número de página inválido' });
    }

    const limit = DEFAULT_PAGE_SIZE;
    const offset = (pagina - 1) * limit;

    try {
        const data = await dbController.getRecords('roles', limit, offset);
        const totalCount = await dbController.getRowCount('roles');
        const totalPaginas = Math.ceil(totalCount / limit);

        res.json({
            data: data,
            totalPaginas: totalPaginas
        });
    } catch (error) {
        console.error('Error al obtener roles paginados:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// GET /catalogos/recientes (Requiere Auth) - Obtener catálogos recientes
router.get('/catalogos/recientes', checkAuth, async (req, res) => {
    try {
        const recientes = await dbController.getRecords('catalogos', 10, 0);
        res.json(recientes);
    } catch (error) {
        console.error('Error al obtener catálogos recientes:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

export default router;