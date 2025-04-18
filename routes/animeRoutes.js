/**
 * Rutas para la gestión de animes
 */

//const { executeQuery, handleErrorResponse, getAnimeWithSeasonsAndEpisodes } = require('./baseRouter');
import { executeQuery, handleErrorResponse, getAnimeWithSeasonsAndEpisodes } from './baseRouter.js';
// Función para configurar las rutas con la conexión a la base de datos
const setupRoutes = (router, db) => {

    // --- GET ALL ANIME ---
    router.get('/anime', async (req, res) => {
        try {
            const queryResult = await executeQuery(db, 'SELECT * FROM catalogo');
            if (queryResult.success) {
                const [results] = queryResult.result;
                res.json(results);
            } else {
                console.error('Error al obtener animes:', queryResult.error);
                handleErrorResponse(res, 500, queryResult.error?.message || 'Error al obtener animes');
            }
        } catch (err) {
            console.error('Error inesperado:', err);
            handleErrorResponse(res, 500, 'Error interno del servidor');
        }
    });

    // --- GET ANIME BY ID (WITH SEASONS AND EPISODES) ---
    router.get('/anime/:id', async (req, res) => {
        try {
            const { id } = req.params;
            
            // Usar la función centralizada para obtener anime con temporadas y capítulos
            const result = await getAnimeWithSeasonsAndEpisodes(db, id);
            
            if (result.success) {
                res.json(result.anime);
            } else {
                if (result.error === 'Anime no encontrado') {
                    handleErrorResponse(res, 404, result.error);
                } else {
                    console.error('Error al obtener anime con temporadas:', result.error);
                    handleErrorResponse(res, 500, result.error);
                }
            }
        } catch (err) {
            console.error('Error inesperado:', err);
            handleErrorResponse(res, 500, 'Error interno del servidor');
        }
    });

    // --- CREATE ANIME ---
    router.post('/anime', async (req, res) => {
        try {
            // Use consistent naming (camelCase in JS, snake_case in DB)
            const { nombre, estado, imagenFondo, descripcion, nsfw, trailer, recomendacion } = req.body;

            // Basic Validation Example (Add more as needed)
            if (!nombre || estado === undefined) {
                 return handleErrorResponse(res, 400, 'Nombre y estado son requeridos.');
            }

            const queryResult = await executeQuery(
                db,
                'INSERT INTO catalogo (nombre, estado, imagen_fondo, descripcion, nsfw, trailer, recomendacion) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [nombre, estado, imagenFondo, descripcion, nsfw ?? false, trailer, recomendacion ?? false] // Provide defaults for booleans if needed
            );

            if (queryResult.success) {
                 const [insertResult] = queryResult.result;
                res.status(201).json({ message: 'Anime creado exitosamente', id: insertResult.insertId }); // Return the new ID
            } else {
                console.error('Error al crear anime:', queryResult.error);
                handleErrorResponse(res, 500, queryResult.error?.message || 'Error al crear anime', queryResult.details);
            }
        } catch (err) {
            console.error('Error inesperado:', err);
             // Handle specific DB errors like duplicate entry if possible
             if (err.code === 'ER_DUP_ENTRY') {
                 return handleErrorResponse(res, 409, 'Ya existe un anime con ese nombre u otro campo único.');
             }
            handleErrorResponse(res, 500, 'Error interno del servidor');
        }
    });

    // --- UPDATE ANIME ---
    router.put('/anime/:id', async (req, res) => {
        try {
            const { id } = req.params;
            // Get only the fields provided in the body
            const { nombre, estado, imagenFondo, descripcion, nsfw, trailer, recomendacion } = req.body;

            // Build the update query dynamically
            const fieldsToUpdate = {};
            if (nombre !== undefined) fieldsToUpdate.nombre = nombre;
            if (estado !== undefined) fieldsToUpdate.estado = estado;
            if (imagenFondo !== undefined) fieldsToUpdate.imagen_fondo = imagenFondo;
            if (descripcion !== undefined) fieldsToUpdate.descripcion = descripcion;
            if (nsfw !== undefined) fieldsToUpdate.nsfw = nsfw;
            if (trailer !== undefined) fieldsToUpdate.trailer = trailer;
            if (recomendacion !== undefined) fieldsToUpdate.recomendacion = recomendacion;

            const fieldKeys = Object.keys(fieldsToUpdate);
            if (fieldKeys.length === 0) {
                return handleErrorResponse(res, 400, 'No se proporcionaron campos para actualizar.');
            }

            const setClause = fieldKeys.map(key => `${key} = ?`).join(', ');
            const params = [...Object.values(fieldsToUpdate), id];

            const query = `UPDATE catalogo SET ${setClause} WHERE id = ?`;

            const queryResult = await executeQuery(db, query, params);

            if (queryResult.success) {
                 const [updateResult] = queryResult.result;
                 if (updateResult.affectedRows > 0) {
                    res.json({ message: 'Anime actualizado exitosamente' });
                 } else {
                    // Check if anime exists before declaring not found
                    const checkExist = await executeQuery(db, 'SELECT id FROM catalogo WHERE id = ?', [id]);
                     if (checkExist.success && checkExist.result[0].length === 0) {
                         handleErrorResponse(res, 404, 'Anime no encontrado para actualizar.');
                     } else {
                         // This case might mean the data sent was the same as existing data
                         res.json({ message: 'Anime actualizado exitosamente (sin cambios detectados).' });
                     }
                 }
            } else {
                console.error('Error al actualizar anime:', queryResult.error);
                handleErrorResponse(res, 500, queryResult.error?.message || 'Error al actualizar anime', queryResult.details);
            }
        } catch (err) {
            console.error('Error inesperado:', err);
             if (err.code === 'ER_DUP_ENTRY') {
                 return handleErrorResponse(res, 409, 'La actualización resultaría en un valor duplicado para un campo único.');
             }
            handleErrorResponse(res, 500, 'Error interno del servidor');
        }
    });

    // --- DELETE ANIME ---
    router.delete('/anime/:id', async (req, res) => {
        try {
            const { id } = req.params;

            const queryResult = await executeQuery(
                db,
                'DELETE FROM catalogo WHERE id = ?',
                [id]
            );

            if (queryResult.success) {
                 const [deleteResult] = queryResult.result;
                 if (deleteResult.affectedRows > 0) {
                     res.json({ message: 'Anime eliminado exitosamente' });
                 } else {
                    handleErrorResponse(res, 404, 'Anime no encontrado para eliminar.');
                 }
            } else {
                console.error('Error al eliminar anime:', queryResult.error);
                 // Handle foreign key constraint errors if necessary (e.g., cannot delete anime if seasons exist)
                 if (queryResult.error?.code === 'ER_ROW_IS_REFERENCED_2') {
                    return handleErrorResponse(res, 409, 'No se puede eliminar el anime porque tiene temporadas asociadas.');
                 }
                handleErrorResponse(res, 500, queryResult.error?.message || 'Error al eliminar anime');
            }
        } catch (err) {
            console.error('Error inesperado:', err);
            handleErrorResponse(res, 500, 'Error interno del servidor');
        }
    });
};

// Exportar la función de configuración de rutas
/* module.exports = { setupRoutes }; */
export { setupRoutes };