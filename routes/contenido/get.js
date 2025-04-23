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

// Todas las rutas GET
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

router.get('/catalogo/:idCatalogo/info', checkAuth, async (req, res) => {
    const catalogo = await dbController.getCatalogo(req.params.idCatalogo);
    res.status(200).json(catalogo);
});

router.get('/catalogo/:idCatalogo/temporadas/', checkAuth, async (req, res) => {
    const catalogo = await dbController.getCatalogo(req.params.idCatalogo);
    res.status(200).json(catalogo);
});

router.get('/catalogo/:idCatalogo/temporada/:idTemporada/capitulos', checkAuth, async (req, res) => {
    const catalogo = await dbController.getCatalogo(req.params.idCatalogo);
    res.status(200).json(catalogo);
});

router.get('/catalogos/estados', checkAuth, async (req, res) => {
    const catalogo = await dbController.getCatalogo(req.params.idCatalogo);
    res.status(200).json(catalogo);
});

router.get('/catalogos/tipos', checkAuth, async (req, res) => {
    const catalogo = await dbController.getCatalogo(req.params.idCatalogo);
    res.status(200).json(catalogo);
});

router.get('/catalogos/categorias', checkAuthOptional, async (req, res) => {
    const catalogo = await dbController.getCatalogo(req.params.idCatalogo);
    res.status(200).json(catalogo);
});

router.get('/capitulo/:id', checkAuth, async (req, res) => {
    const catalogo = await dbController.getCatalogo(req.params.idCatalogo);
    res.status(200).json(catalogo);
});

router.get('/usuario/:id/historial', checkAuth, async (req, res) => {
    const catalogo = await dbController.getCatalogo(req.params.idCatalogo);
    res.status(200).json(catalogo);
});

router.get('/usuario/:idUsuario/favoritos', checkAuth, async (req, res) => {
    const catalogo = await dbController.getCatalogo(req.params.idCatalogo);
    res.status(200).json(catalogo);
});

router.get('/usuario/:idUsuario/catalogo/:catalogo/favorito', checkAuth, async (req, res) => {
    const catalogo = await dbController.getCatalogo(req.params.idCatalogo);
    res.status(200).json(catalogo);
});

router.get('/categorias/pagina/:pagina', checkAuth, async (req, res) => {
    const catalogo = await dbController.getCatalogo(req.params.idCatalogo);
    res.status(200).json(catalogo);
});

router.get('/usuario/pov/:idUsuario', checkAuth, async (req, res) => {
    const catalogo = await dbController.getCatalogo(req.params.idCatalogo);
    res.status(200).json(catalogo);
});

router.get('/usuario/:idUsuario', checkAuth, async (req, res) => {
    const catalogo = await dbController.getCatalogo(req.params.idCatalogo);
    res.status(200).json(catalogo);
});

router.get('/roles/pagina/:pagina', checkAuth, async (req, res) => {
    const catalogo = await dbController.getCatalogo(req.params.idCatalogo);
    res.status(200).json(catalogo);
});

router.get('/catalogos/recientes', checkAuth, async (req, res) => {
    const catalogo = await dbController.getCatalogo(req.params.idCatalogo);
    res.status(200).json(catalogo);
});

export default router;