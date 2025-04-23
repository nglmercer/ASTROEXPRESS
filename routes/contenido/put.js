import express from 'express';
import { dbController } from '../backupdb.js';
const router = express.Router();
// Middleware para autenticación
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
// Middleware para parsear JSON
router.use(express.json());
router.put('/usuario/:idUsuario/nsfw', checkAuth, (req, res) => {
    const { idUsuario } = req.params;
    // Asumimos que el body podría tener { nsfwEnabled: boolean } o no tener body para toggle
    console.log(`SIMULADO: PUT /usuario/${idUsuario}/nsfw - Body:`, req.body);

    // Implementación real necesitaría actualizar el campo 'nsfwUsuario' en la tabla 'usuarios'.
    // const newState = req.body.hasOwnProperty('nsfwEnabled') ? req.body.nsfwEnabled : !currentUserNsfwState; // Lógica de toggle o set
    // await dbController.update('usuarios', idUsuario, { nsfwUsuario: newState ? 1 : 0 });

    const newState = Math.random() > 0.5; // Estado aleatorio para simulación
    res.json({ success: true, nsfwEnabled: newState, message: `NSFW toggle para ${idUsuario} (simulado)` });
});
router.put('/categoria/:idCategoria', checkAuth, (req, res) => {
    const { idCategoria } = req.params;
    console.log(`SIMULADO: PUT /categoria/${idCategoria} - Body:`, req.body);
    // Implementación real necesitaría dbController.update('categorias', idCategoria, data)
    res.json({ success: true, message: `Categoría ${idCategoria} actualizada (simulada)` });
});
router.put('/rol/:idRol', checkAuth, (req, res) => {
    const { idRol } = req.params;
    console.log(`SIMULADO: PUT /rol/${idRol} - Body:`, req.body);
     // Implementación real necesitaría dbController.update('roles', idRol, data)
    res.json({ success: true, message: `Rol ${idRol} actualizado (simulado)` });
});
router.put('/catalogo/', checkAuth,async (req, res) => {
    console.log('SIMULADO: POST /catalogo - Body:', req.body);
    // Implementación real necesitaría dbController.insert('catalogos', data)
    const { idCatalogo, nombreCatalogo, tipoCatalogo, estadoCatalogo, imagenPortadaCatalogo, imagenFondoCatalogo,descripcionCatalogo, nsfwCatalogo, recomendacionCatalogo, trailerCatalogo } = req.body;
    try {
        const updateItem = await dbController.actualizarRegistro('catalogos', {
            idCatalogo,
            nombreCatalogo,
            tipoCatalogo,
            estadoCatalogo,
            imagenPortadaCatalogo,
            imagenFondoCatalogo,
            descripcionCatalogo,
            nsfwCatalogo,
            recomendacionCatalogo,
            trailerCatalogo
        },['idCatalogo']);
        res.json({ success: true, message: 'Catálogo agregado (simulado)', data: updateItem });
    } catch (error) {
        console.error('Error al actualizar catálogo:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor', details: error.message });
    }
});
export default router;