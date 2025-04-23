/**
 * Rutas para la gestión de capítulos de anime
 */
/* const express = require('express');
const { 
    executeQuery, 
    checkEntityExists, 
    validateEntityRelationship,
    handleErrorResponse, 
    formatTemporada, 
    getCapitulosForTemporadas, 
    getTemporadaWithEpisodes, 
    formatCapitulo, 
    getCapitulo,
    createCapitulo,
    updateCapitulo,
    deleteCapitulo,
    updateCapituloStats
} = require('./baseRouter'); */
import { 
    executeQuery, 
    checkEntityExists,
    validateEntityRelationship,
    handleErrorResponse,
    formatTemporada,
    getCapitulosForTemporadas,
    getTemporadaWithEpisodes,
    formatCapitulo,
    getCapitulo,
    createCapitulo,
    updateCapitulo,
    deleteCapitulo,
    updateCapituloStats
} from './baseRouter.js';
// Función para configurar las rutas con la conexión a la base de datos
const setupRoutes = (router, db) => {

    // --- GET ALL CHAPTERS FOR A SEASON ---
    router.get('/anime/:animeId/temporadas/:temporadaId/capitulos', async (req, res) => {
        const { animeId, temporadaId } = req.params;
        try {
            // Verificar que el anime existe usando checkEntityExists
            const animeCheck = await checkEntityExists(db, 'catalogo', 'id', animeId);
            if (!animeCheck.success || !animeCheck.exists) {
                return handleErrorResponse(res, 404, 'Anime no encontrado.');
            }

            // Verificar que la temporada existe y pertenece al anime
            const temporadaCheck = await checkEntityExists(db, 'temporadas', 'id', temporadaId, 'anime_id', animeId);
            if (!temporadaCheck.success || !temporadaCheck.exists) {
                return handleErrorResponse(res, 404, 'Temporada no encontrada para este anime.');
            }

            // Obtener todos los capítulos de la temporada
            const capitulosQuery = 'SELECT * FROM capitulos WHERE temporada_id = ? ORDER BY numero ASC';
            const capitulosResult = await executeQuery(db, capitulosQuery, [temporadaId]);

            if (!capitulosResult.success) {
                console.error('Error al obtener capítulos:', capitulosResult.error);
                return handleErrorResponse(res, 500, 'Error al obtener capítulos');
            }

            const [capitulosDb] = capitulosResult.result;

            // Formatear la respuesta usando formatCapitulo
            const capitulos = capitulosDb.map(cap => {
                const formattedCap = formatCapitulo(cap);
                // Añadir animeId que no está en formatCapitulo por defecto
                if (cap.animeId) formattedCap.animeId = cap.animeId;
                return formattedCap;
            });

            res.json(capitulos);
        } catch (err) {
            console.error(`Error inesperado al obtener capítulos para temporada ${temporadaId}:`, err);
            handleErrorResponse(res, 500, 'Error interno del servidor');
        }
    });

    // --- GET CHAPTER BY ID ---
    router.get('/anime/:animeId/temporadas/:temporadaId/capitulos/:capituloId', async (req, res) => {
        const { animeId, temporadaId, capituloId } = req.params;
        try {
            // Usar la función getCapitulo de baseRouter que ya implementa todas las verificaciones
            const result = await getCapitulo(db, animeId, temporadaId, capituloId);
            
            if (!result.success) {
                return handleErrorResponse(res, 404, result.error);
            }
            
            res.json(result.capitulo);
        } catch (err) {
            console.error(`Error inesperado al obtener capítulo ${capituloId}:`, err);
            handleErrorResponse(res, 500, 'Error interno del servidor');
        }
    });

    // --- CREATE CHAPTER ---
    router.post('/anime/:animeId/temporadas/:temporadaId/capitulos', async (req, res) => {
        const { animeId, temporadaId } = req.params;
        const { 
            numero, 
            titulo, 
            descripcion, 
            imagen, 
            path, 
            duracion_minutos = 0, 
            me_gustas = 0, 
            no_me_gustas = 0, 
            reproducciones = 0 
        } = req.body;
        
        // Convertir descripción de array a string si es necesario
        const descripcionStr = Array.isArray(descripcion) ? descripcion.join(' ') : descripcion;

        // Validación básica
        if (numero === undefined || !titulo) {
            return handleErrorResponse(res, 400, 'El número y título del capítulo son requeridos.');
        }
        const num = parseInt(numero);
        if (isNaN(num) || num <= 0) {
            return handleErrorResponse(res, 400, 'El número de capítulo debe ser un entero positivo.');
        }
        // Validar que el número no exceda el límite máximo de INT en MySQL
        if (num > 2147483647) {
            return handleErrorResponse(res, 400, 'El número de capítulo es demasiado grande. El valor máximo permitido es 2,147,483,647.');
        }

        try {
            // Verificar que el anime existe usando checkEntityExists
            const animeCheck = await checkEntityExists(db, 'catalogo', 'id', animeId);
            if (!animeCheck.success || !animeCheck.exists) {
                return handleErrorResponse(res, 404, 'Anime no encontrado.');
            }

            // Verificar que la temporada existe y pertenece al anime
            const temporadaCheck = await checkEntityExists(db, 'temporadas', 'id', temporadaId, 'anime_id', animeId);
            if (!temporadaCheck.success || !temporadaCheck.exists) {
                return handleErrorResponse(res, 404, 'Temporada no encontrada para este anime.');
            }

            // Crear el capítulo
            const query = `
                INSERT INTO capitulos (
                    temporada_id, 
                    numero, 
                    titulo, 
                    descripcion, 
                    imagen, 
                    path, 
                    duracion_minutos, 
                    me_gustas, 
                    no_me_gustas, 
                    reproducciones,
                    animeId
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                temporadaId, 
                num, 
                titulo, 
                descripcionStr, 
                imagen, 
                path, 
                duracion_minutos, 
                me_gustas, 
                no_me_gustas, 
                reproducciones,
                animeId
            ];
            const queryResult = await executeQuery(db, query, params);

            if (queryResult.success) {
                const [insertResult] = queryResult.result;
                res.status(201).json({
                    message: 'Capítulo creado exitosamente',
                    capituloId: insertResult.insertId,
                    temporadaId: temporadaId,
                    animeId: animeId
                });
            } else {
                console.error('Error al crear capítulo:', queryResult.error);
                if (queryResult.error?.code === 'ER_DUP_ENTRY') {
                    return handleErrorResponse(res, 409, `El capítulo número ${num} ya existe para esta temporada.`);
                }
                handleErrorResponse(res, 500, 'Error al crear capítulo', queryResult.error?.message);
            }
        } catch (err) {
            console.error('Error inesperado al crear capítulo:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return handleErrorResponse(res, 409, `El capítulo número ${num} ya existe para esta temporada.`);
            }
            handleErrorResponse(res, 500, 'Error interno del servidor');
        }
    });

    // --- UPDATE CHAPTER ---
    router.put('/anime/:animeId/temporadas/:temporadaId/capitulos/:capituloId', async (req, res) => {
        const { animeId, temporadaId, capituloId } = req.params;
        const { 
            numero, 
            titulo, 
            descripcion, 
            imagen, 
            path, 
            duracion_minutos, 
            me_gustas, 
            no_me_gustas, 
            reproducciones 
        } = req.body;

        try {
            // Verificar que el anime existe usando checkEntityExists
            const animeCheck = await checkEntityExists(db, 'catalogo', 'id', animeId);
            if (!animeCheck.success || !animeCheck.exists) {
                return handleErrorResponse(res, 404, 'Anime no encontrado.');
            }

            // Verificar que la temporada existe y pertenece al anime
            const temporadaCheck = await checkEntityExists(db, 'temporadas', 'id', temporadaId, 'anime_id', animeId);
            if (!temporadaCheck.success || !temporadaCheck.exists) {
                return handleErrorResponse(res, 404, 'Temporada no encontrada para este anime.');
            }

            // Verificar que el capítulo existe y pertenece a la temporada
            const capituloCheck = await checkEntityExists(db, 'capitulos', 'id', capituloId, 'temporada_id', temporadaId);
            if (!capituloCheck.success || !capituloCheck.exists) {
                return handleErrorResponse(res, 404, 'Capítulo no encontrado para esta temporada.');    
            }

            // Construir la consulta de actualización dinámicamente
            const fieldsToUpdate = {};
            if (numero !== undefined) {
                const num = parseInt(numero);
                if (isNaN(num) || num <= 0) {
                    return res.status(400).json({ error: 'El número de capítulo debe ser un entero positivo.' });
                }
                fieldsToUpdate.numero = num;
            }
            if (titulo !== undefined) fieldsToUpdate.titulo = titulo;
            if (descripcion !== undefined) fieldsToUpdate.descripcion = descripcion;
            if (imagen !== undefined) fieldsToUpdate.imagen = imagen;
            if (path !== undefined) fieldsToUpdate.path = path;
            if (duracion_minutos !== undefined) fieldsToUpdate.duracion_minutos = duracion_minutos;
            if (me_gustas !== undefined) fieldsToUpdate.me_gustas = me_gustas;
            if (no_me_gustas !== undefined) fieldsToUpdate.no_me_gustas = no_me_gustas;
            if (reproducciones !== undefined) fieldsToUpdate.reproducciones = reproducciones;

            const fieldKeys = Object.keys(fieldsToUpdate);
            if (fieldKeys.length === 0) {
                return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
            }

            const setClause = fieldKeys.map(key => `${key} = ?`).join(', ');
            const params = [...Object.values(fieldsToUpdate), capituloId];

            const query = `UPDATE capitulos SET ${setClause} WHERE id = ?`;

            const queryResult = await executeQuery(db, query, params);

            if (queryResult.success) {
                const [updateResult] = queryResult.result;
                if (updateResult.affectedRows > 0) {
                    res.json({ message: 'Capítulo actualizado exitosamente' });
                } else {
                    res.json({ message: 'Capítulo actualizado exitosamente (sin cambios detectados).' });
                }
            } else {
                console.error('Error al actualizar capítulo:', queryResult.error);
                if (queryResult.error?.code === 'ER_DUP_ENTRY') {
                    return handleErrorResponse(res, 409, 'La actualización resultaría en un valor duplicado para un campo único.');
                }
                handleErrorResponse(res, 500, queryResult.error?.message || 'Error al actualizar capítulo', queryResult.details);
            }
        } catch (err) {
            console.error('Error inesperado al actualizar capítulo:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return handleErrorResponse(res, 409, 'La actualización resultaría en un valor duplicado para un campo único.');
            }
            handleErrorResponse(res, 500, 'Error interno del servidor');
        }
    });

    // --- DELETE CHAPTER ---
    router.delete('/anime/:animeId/temporadas/:temporadaId/capitulos/:capituloId', async (req, res) => {
        const { animeId, temporadaId, capituloId } = req.params;

        try {
            // Verificar que el anime existe usando checkEntityExists
            const animeCheck = await checkEntityExists(db, 'catalogo', 'id', animeId);
            if (!animeCheck.success || !animeCheck.exists) {
                return handleErrorResponse(res, 404, 'Anime no encontrado.');
            }

            // Verificar que la temporada existe y pertenece al anime
            const temporadaCheck = await checkEntityExists(db, 'temporadas', 'id', temporadaId, 'anime_id', animeId);
            if (!temporadaCheck.success || !temporadaCheck.exists) {
                return handleErrorResponse(res, 404, 'Temporada no encontrada para este anime.');
            }

            // Verificar que el capítulo existe y pertenece a la temporada
            const capituloCheck = await checkEntityExists(db, 'capitulos', 'id', capituloId, 'temporada_id', temporadaId);
            if (!capituloCheck.success || !capituloCheck.exists) {
                return handleErrorResponse(res, 404, 'Capítulo no encontrado para esta temporada.');
            }

            // Eliminar el capítulo
            const queryResult = await executeQuery(
                db,
                'DELETE FROM capitulos WHERE id = ?',
                [capituloId]
            );

            if (queryResult.success) {
                const [deleteResult] = queryResult.result;
                if (deleteResult.affectedRows > 0) {
                    res.json({ message: 'Capítulo eliminado exitosamente' });
                } else {
                    handleErrorResponse(res, 404, 'Capítulo no encontrado para eliminar.');
                }
            } else {
                console.error('Error al eliminar capítulo:', queryResult.error);
                handleErrorResponse(res, 500, queryResult.error?.message || 'Error al eliminar capítulo');
            }
        } catch (err) {
            console.error('Error inesperado al eliminar capítulo:', err);
            handleErrorResponse(res, 500, 'Error interno del servidor');
        }
    });

    // --- UPDATE CHAPTER STATS ---
    router.patch('/anime/:animeId/temporadas/:temporadaId/capitulos/:capituloId/stats', async (req, res) => {
        const { animeId, temporadaId, capituloId } = req.params;
        const { me_gustas, no_me_gustas, reproducciones } = req.body;

        try {
            // Verificar que el anime existe
            const animeCheck = await checkEntityExists(db, 'catalogo', 'id', animeId);
            if (!animeCheck.success || !animeCheck.exists) {
                return handleErrorResponse(res, 404, 'Anime no encontrado.');
            }

            // Verificar que la temporada existe y pertenece al anime
            const temporadaCheck = await checkEntityExists(db, 'temporadas', 'id', temporadaId, 'anime_id', animeId);
            if (!temporadaCheck.success || !temporadaCheck.exists) {
                return handleErrorResponse(res, 404, 'Temporada no encontrada para este anime.');
            }

            // Verificar que el capítulo existe y pertenece a la temporada
            const capituloCheck = await checkEntityExists(db, 'capitulos', 'id', capituloId, 'temporada_id', temporadaId);
            if (!capituloCheck.success || !capituloCheck.exists) {
                return handleErrorResponse(res, 404, 'Capítulo no encontrado para esta temporada y anime.');
            }

            // Construir la consulta de actualización dinámicamente
            const fieldsToUpdate = {};
            if (me_gustas !== undefined) fieldsToUpdate.me_gustas = me_gustas;
            if (no_me_gustas !== undefined) fieldsToUpdate.no_me_gustas = no_me_gustas;
            if (reproducciones !== undefined) fieldsToUpdate.reproducciones = reproducciones;

            const fieldKeys = Object.keys(fieldsToUpdate);
            if (fieldKeys.length === 0) {
                return handleErrorResponse(res, 400, 'No se proporcionaron estadísticas para actualizar.');
            }

            const setClause = fieldKeys.map(key => `${key} = ?`).join(', ');
            const params = [...Object.values(fieldsToUpdate), capituloId];

            const query = `UPDATE capitulos SET ${setClause} WHERE id = ?`;

            const queryResult = await executeQuery(db, query, params);

            if (queryResult.success) {
                res.json({ message: 'Estadísticas del capítulo actualizadas exitosamente' });
            } else {
                console.error('Error al actualizar estadísticas del capítulo:', queryResult.error);
                handleErrorResponse(res, 500, queryResult.error?.message || 'Error al actualizar estadísticas del capítulo', queryResult.details);
            }
        } catch (err) {
            console.error('Error inesperado al actualizar estadísticas del capítulo:', err);
            handleErrorResponse(res, 500, 'Error interno del servidor');
        }
    });
};

// Exportar la función de configuración de rutas
/* module.exports = { setupRoutes }; */
export { setupRoutes };