import express from 'express';
import { dbController } from '../backupdb.js';
const router = express.Router();
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
// DELETE /catalogo/:id (Requiere Auth) - Simula eliminar (el controlador actual no tiene DELETE)
router.delete('/catalogo/:id', checkAuth,async (req, res) => {
    const { id } = req.params;
    // Implementación real necesitaría dbController.delete('catalogos', id)
    const result =     await dbController.eliminarRegistro('catalogos', {
        idCatalogo: id
      })
    res.json({ success: true, message: `Catálogo ${id} eliminado`,data:result });
});
router.delete('/temporada/:id', checkAuth,async (req, res) => {
    const { id } = req.params;
    // Implementación real necesitaría dbController.delete('catalogos', id)
    const result =     await dbController.eliminarRegistro('temporadas', {
        idTemporada: id
      })
    res.json({ success: true, message: `Temporada ${id} eliminada`,data:result });
});
// DELETE /categoria/:idCategoria (Requiere Auth) - Simula eliminar categoría (el controlador actual no tiene DELETE)
router.delete('/categoria/:idCategoria', checkAuth, (req, res) => {
    const { idCategoria } = req.params;
     // Implementación real necesitaría dbController.delete('categorias', idCategoria)
    res.json({ success: true, message: `Categoría ${idCategoria} eliminada (simulada)` });
});

router.delete('/rol/:idRol', checkAuth, (req, res) => {
    const { idRol } = req.params;
     // Implementación real necesitaría dbController.delete('roles', idRol)
    res.json({ success: true, message: `Rol ${idRol} eliminado (simulado)` });
    
});


export default router;