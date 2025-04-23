/* const { initializeDatabase } = require('../utils/database');
const { executeQuery } = require('../utils/queryHandler');
 */
import { initializeDatabase } from '../../utils/database.js';
import { executeQuery } from '../../utils/queryHandler.js';
let db;

const initializeRouter = async () => {
    if (!db) {
        db = await initializeDatabase();
    }
    return db;
};

const validateEntityRelationship = async (db, parentTable, parentId, childTable, childId, relationField) => {
    try {
        const parentCheck = await checkEntityExists(db, parentTable, 'id', parentId);
        if (!parentCheck.success || !parentCheck.exists) {
            return { 
                success: false, 
                error: !parentCheck.success ? parentCheck.error : `${parentTable} no encontrado` 
            };
        }

        if (childId) {
            const childCheck = await checkEntityExists(db, childTable, 'id', childId, relationField, parentId);
            if (!childCheck.success || !childCheck.exists) {
                return { 
                    success: false, 
                    error: !childCheck.success ? childCheck.error : `${childTable} no encontrado para este ${parentTable}` 
                };
            }
        }

        return { success: true };
    } catch (error) {
        console.error(`Error en validateEntityRelationship:`, error);
        return { success: false, error: 'Error interno del servidor' };
    }
};

const checkEntityExists = async (db, table, field, value, additionalField = null, additionalValue = null) => {
    try {
        let query = `SELECT ${field} FROM ${table} WHERE ${field} = ?`;
        let params = [value];
        
        if (additionalField && additionalValue !== null) {
            query += ` AND ${additionalField} = ?`;
            params.push(additionalValue);
        }
        
        const result = await executeQuery(db, query, params);
        
        if (!result.success) {
            return { success: false, error: `Error al verificar existencia en ${table}`, details: result.error };
        }
        
        const exists = result.result[0].length > 0;
        return { 
            success: true, 
            exists, 
            data: exists ? result.result[0][0] : null 
        };
    } catch (error) {
        console.error(`Error en checkEntityExists (${table}):`, error);
        return { success: false, error: 'Error interno del servidor' };
    }
};

const handleErrorResponse = (res, statusCode, message, details = null) => {
    const response = { error: message };
    if (details) response.details = details;
    res.status(statusCode).json(response);
};

const formatCapitulo = (capitulo) => ({
    capituloId: capitulo.id,
    numeroCapitulo: capitulo.numero,
    tituloCapitulo: capitulo.titulo,
    descripcionCapitulo: capitulo.descripcion,
    imagenCapitulo: capitulo.imagen,
    pathCapitulo: capitulo.path,
    duracionMinutos: capitulo.duracion_minutos,
    meGustas: capitulo.me_gustas,
    noMeGustas: capitulo.no_me_gustas,
    reproducciones: capitulo.reproducciones,
    temporadaId: capitulo.temporada_id
});

const formatTemporada = (temporada, capitulos = []) => ({
    temporadaId: temporada.id,
    numeroTemporada: temporada.numero,
    nombreTemporada: temporada.nombre,
    descripcionTemporada: temporada.descripcion,
    portadaTemporada: temporada.portada,
    animeId: temporada.anime_id,
    nsfw: Boolean(temporada.nsfw),
    capitulos: capitulos.map(formatCapitulo)
});

const getCapitulosForTemporadas = async (db, temporadaIds) => {
    try {
        if (!temporadaIds || temporadaIds.length === 0) {
            return { success: true, capitulos: [] };
        }
        
        const placeholders = temporadaIds.map(() => '?').join(',');
        const query = `SELECT * FROM capitulos WHERE temporada_id IN (${placeholders}) ORDER BY temporada_id ASC, numero ASC`;
        const result = await executeQuery(db, query, temporadaIds);
        
        if (!result.success) {
            return { success: false, error: 'Error al obtener capítulos', details: result.error };
        }
        
        return { success: true, capitulos: result.result[0] };
    } catch (error) {
        console.error('Error en getCapitulosForTemporadas:', error);
        return { success: false, error: 'Error interno del servidor' };
    }
};

const getAnimeWithSeasonsAndEpisodes = async (db, animeId) => {
    try {
        const animeCheck = await checkEntityExists(db, 'catalogo', 'id', animeId);
        
        if (!animeCheck.success) {
            return { success: false, error: animeCheck.error };
        }
        
        if (!animeCheck.exists) {
            return { success: false, error: 'Anime no encontrado' };
        }
        
        const animeQuery = 'SELECT * FROM catalogo WHERE id = ?';
        const animeResult = await executeQuery(db, animeQuery, [animeId]);
        
        if (!animeResult.success) {
            return { success: false, error: 'Error al obtener datos del anime' };
        }
        
        const anime = animeResult.result[0][0];
        
        const temporadasQuery = 'SELECT * FROM temporadas WHERE anime_id = ? ORDER BY numero ASC';
        const temporadasResult = await executeQuery(db, temporadasQuery, [animeId]);
        
        if (!temporadasResult.success) {
            return { success: false, error: 'Error al obtener temporadas' };
        }
        
        const temporadas = temporadasResult.result[0];
        
        if (temporadas.length > 0) {
            const temporadaIds = temporadas.map(t => t.id);
            const capitulosResult = await getCapitulosForTemporadas(db, temporadaIds);
            
            if (!capitulosResult.success) {
                return { success: false, error: capitulosResult.error };
            }
            
            const capitulos = capitulosResult.capitulos;
            
            const temporadasConCapitulos = temporadas.map(temp => {
                const capitulosTemporada = capitulos.filter(cap => cap.temporada_id === temp.id);
                return formatTemporada(temp, capitulosTemporada);
            });
            
            anime.temporadas = temporadasConCapitulos;
        } else {
            anime.temporadas = [];
        }
        
        return { success: true, anime };
    } catch (error) {
        console.error('Error en getAnimeWithSeasonsAndEpisodes:', error);
        return { success: false, error: 'Error interno del servidor' };
    }
};

const getTemporadaWithEpisodes = async (db, animeId, temporadaId) => {
    try {
        const animeCheck = await checkEntityExists(db, 'catalogo', 'id', animeId);
        
        if (!animeCheck.success || !animeCheck.exists) {
            return { 
                success: false, 
                error: !animeCheck.success ? animeCheck.error : 'Anime no encontrado' 
            };
        }
        
        const temporadaCheck = await checkEntityExists(db, 'temporadas', 'id', temporadaId, 'anime_id', animeId);
        
        if (!temporadaCheck.success || !temporadaCheck.exists) {
            return { 
                success: false, 
                error: !temporadaCheck.success ? temporadaCheck.error : 'Temporada no encontrada para este anime' 
            };
        }
        
        const temporadaQuery = 'SELECT * FROM temporadas WHERE id = ?';
        const temporadaResult = await executeQuery(db, temporadaQuery, [temporadaId]);
        
        if (!temporadaResult.success) {
            return { success: false, error: 'Error al obtener datos de la temporada' };
        }
        
        const temporada = temporadaResult.result[0][0];
        
        const capitulosQuery = 'SELECT * FROM capitulos WHERE temporada_id = ? ORDER BY numero ASC';
        const capitulosResult = await executeQuery(db, capitulosQuery, [temporadaId]);
        
        if (!capitulosResult.success) {
            return { success: false, error: 'Error al obtener capítulos' };
        }
        
        const capitulos = capitulosResult.result[0];
        
        const temporadaFormateada = formatTemporada(temporada, capitulos);
        
        return { success: true, temporada: temporadaFormateada };
    } catch (error) {
        console.error('Error en getTemporadaWithEpisodes:', error);
        return { success: false, error: 'Error interno del servidor' };
    }
};

const getCapitulo = async (db, animeId, temporadaId, capituloId) => {
    try {
        // Validar la relación entre anime, temporada y capítulo
        const validationResult = await validateEntityRelationship(db, 'catalogo', animeId, 'temporadas', temporadaId, 'anime_id');
        if (!validationResult.success) {
            return validationResult;
        }
        
        // Verificar que el capítulo existe y pertenece a la temporada
        const capituloCheck = await checkEntityExists(db, 'capitulos', 'id', capituloId, 'temporada_id', temporadaId);
        if (!capituloCheck.success || !capituloCheck.exists) {
            return { 
                success: false, 
                error: !capituloCheck.success ? capituloCheck.error : 'Capítulo no encontrado para esta temporada' 
            };
        }
        
        const capituloQuery = 'SELECT * FROM capitulos WHERE id = ? AND temporada_id = ?';
        const capituloResult = await executeQuery(db, capituloQuery, [capituloId, temporadaId]);
        
        if (!capituloResult.success) {
            return { success: false, error: 'Error al obtener capítulo' };
        }
        
        if (capituloResult.result[0].length === 0) {
            return { success: false, error: 'Capítulo no encontrado para esta temporada' };
        }
        
        const capitulo = capituloResult.result[0][0];
        const capituloFormateado = formatCapitulo(capitulo);
        
        return { success: true, capitulo: capituloFormateado };
    } catch (error) {
        console.error('Error en getCapitulo:', error);
        return { success: false, error: 'Error interno del servidor' };
    }
};

/**
 * Crea un nuevo capítulo para una temporada específica
 * @param {Object} db - Conexión a la base de datos
 * @param {number} animeId - ID del anime
 * @param {number} temporadaId - ID de la temporada
 * @param {Object} capituloData - Datos del capítulo a crear
 * @returns {Promise<Object>} - Resultado de la operación
 */
const createCapitulo = async (db, animeId, temporadaId, capituloData) => {
    try {
        // Validar la relación entre anime y temporada
        const validationResult = await validateEntityRelationship(db, 'catalogo', animeId, 'temporadas', temporadaId, 'anime_id');
        if (!validationResult.success) {
            return validationResult;
        }
        
        // Procesar descripción si es un array
        if (Array.isArray(capituloData.descripcion)) {
            capituloData.descripcion = capituloData.descripcion.join(' ');
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
            capituloData.numero, 
            capituloData.titulo, 
            capituloData.descripcion, 
            capituloData.imagen, 
            capituloData.path, 
            capituloData.duracion_minutos || 0, 
            capituloData.me_gustas || 0, 
            capituloData.no_me_gustas || 0, 
            capituloData.reproducciones || 0,
            animeId
        ];
        
        const queryResult = await executeQuery(db, query, params);
        
        if (!queryResult.success) {
            if (queryResult.error?.code === 'ER_DUP_ENTRY') {
                return { 
                    success: false, 
                    error: `El capítulo número ${capituloData.numero} ya existe para esta temporada.`,
                    code: 'ER_DUP_ENTRY'
                };
            }
            return { success: false, error: 'Error al crear capítulo', details: queryResult.error };
        }
        
        return { 
            success: true, 
            message: 'Capítulo creado exitosamente',
            capituloId: queryResult.result[0].insertId,
            temporadaId: temporadaId,
            animeId: animeId
        };
    } catch (error) {
        console.error('Error en createCapitulo:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return { 
                success: false, 
                error: `El capítulo número ${capituloData.numero} ya existe para esta temporada.`,
                code: 'ER_DUP_ENTRY'
            };
        }
        return { success: false, error: 'Error interno del servidor' };
    }
};

/**
 * Actualiza un capítulo existente
 * @param {Object} db - Conexión a la base de datos
 * @param {number} animeId - ID del anime
 * @param {number} temporadaId - ID de la temporada
 * @param {number} capituloId - ID del capítulo
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} - Resultado de la operación
 */
const updateCapitulo = async (db, animeId, temporadaId, capituloId, updateData) => {
    try {
        // Validar la relación entre anime, temporada y capítulo
        const validationResult = await validateEntityRelationship(db, 'catalogo', animeId, 'temporadas', temporadaId, 'anime_id');
        if (!validationResult.success) {
            return validationResult;
        }
        
        // Verificar que el capítulo existe y pertenece a la temporada
        const capituloCheck = await checkEntityExists(db, 'capitulos', 'id', capituloId, 'temporada_id', temporadaId);
        if (!capituloCheck.success || !capituloCheck.exists) {
            return { 
                success: false, 
                error: !capituloCheck.success ? capituloCheck.error : 'Capítulo no encontrado para esta temporada' 
            };
        }
        
        // Construir la consulta de actualización dinámicamente
        const fieldsToUpdate = {};
        
        // Procesar cada campo si está definido
        if (updateData.numero !== undefined) fieldsToUpdate.numero = parseInt(updateData.numero);
        if (updateData.titulo !== undefined) fieldsToUpdate.titulo = updateData.titulo;
        if (updateData.descripcion !== undefined) {
            fieldsToUpdate.descripcion = Array.isArray(updateData.descripcion) 
                ? updateData.descripcion.join(' ') 
                : updateData.descripcion;
        }
        if (updateData.imagen !== undefined) fieldsToUpdate.imagen = updateData.imagen;
        if (updateData.path !== undefined) fieldsToUpdate.path = updateData.path;
        if (updateData.duracion_minutos !== undefined) fieldsToUpdate.duracion_minutos = updateData.duracion_minutos;
        if (updateData.me_gustas !== undefined) fieldsToUpdate.me_gustas = updateData.me_gustas;
        if (updateData.no_me_gustas !== undefined) fieldsToUpdate.no_me_gustas = updateData.no_me_gustas;
        if (updateData.reproducciones !== undefined) fieldsToUpdate.reproducciones = updateData.reproducciones;
        
        // Verificar si hay campos para actualizar
        const fieldKeys = Object.keys(fieldsToUpdate);
        if (fieldKeys.length === 0) {
            return { success: false, error: 'No se proporcionaron campos para actualizar.' };
        }
        
        // Construir la consulta SQL
        const setClause = fieldKeys.map(key => `${key} = ?`).join(', ');
        const params = [...Object.values(fieldsToUpdate), capituloId];
        const query = `UPDATE capitulos SET ${setClause} WHERE id = ?`;
        
        // Ejecutar la consulta
        const queryResult = await executeQuery(db, query, params);
        
        if (!queryResult.success) {
            if (queryResult.error?.code === 'ER_DUP_ENTRY') {
                return { 
                    success: false, 
                    error: 'La actualización resultaría en un valor duplicado para un campo único.',
                    code: 'ER_DUP_ENTRY'
                };
            }
            return { 
                success: false, 
                error: queryResult.error?.message || 'Error al actualizar capítulo', 
                details: queryResult.details 
            };
        }
        
        return { 
            success: true, 
            message: 'Capítulo actualizado exitosamente',
            affectedRows: queryResult.result[0].affectedRows
        };
    } catch (error) {
        console.error('Error en updateCapitulo:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return { 
                success: false, 
                error: 'La actualización resultaría en un valor duplicado para un campo único.',
                code: 'ER_DUP_ENTRY'
            };
        }
        return { success: false, error: 'Error interno del servidor' };
    }
};

/**
 * Elimina un capítulo existente
 * @param {Object} db - Conexión a la base de datos
 * @param {number} animeId - ID del anime
 * @param {number} temporadaId - ID de la temporada
 * @param {number} capituloId - ID del capítulo
 * @returns {Promise<Object>} - Resultado de la operación
 */
const deleteCapitulo = async (db, animeId, temporadaId, capituloId) => {
    try {
        // Validar la relación entre anime, temporada y capítulo
        const validationResult = await validateEntityRelationship(db, 'catalogo', animeId, 'temporadas', temporadaId, 'anime_id');
        if (!validationResult.success) {
            return validationResult;
        }
        
        // Verificar que el capítulo existe y pertenece a la temporada
        const capituloCheck = await checkEntityExists(db, 'capitulos', 'id', capituloId, 'temporada_id', temporadaId);
        if (!capituloCheck.success || !capituloCheck.exists) {
            return { 
                success: false, 
                error: !capituloCheck.success ? capituloCheck.error : 'Capítulo no encontrado para esta temporada' 
            };
        }
        
        // Eliminar el capítulo
        const queryResult = await executeQuery(db, 'DELETE FROM capitulos WHERE id = ?', [capituloId]);
        
        if (!queryResult.success) {
            return { 
                success: false, 
                error: queryResult.error?.message || 'Error al eliminar capítulo'
            };
        }
        
        return { 
            success: true, 
            message: 'Capítulo eliminado exitosamente',
            affectedRows: queryResult.result[0].affectedRows
        };
    } catch (error) {
        console.error('Error en deleteCapitulo:', error);
        return { success: false, error: 'Error interno del servidor' };
    }
};

/**
 * Actualiza las estadísticas de un capítulo (me_gustas, no_me_gustas, reproducciones)
 * @param {Object} db - Conexión a la base de datos
 * @param {number} animeId - ID del anime
 * @param {number} temporadaId - ID de la temporada
 * @param {number} capituloId - ID del capítulo
 * @param {Object} statsData - Datos de estadísticas a actualizar
 * @returns {Promise<Object>} - Resultado de la operación
 */
const updateCapituloStats = async (db, animeId, temporadaId, capituloId, statsData) => {
    try {
        // Validar la relación entre anime, temporada y capítulo
        const validationResult = await validateEntityRelationship(db, 'catalogo', animeId, 'temporadas', temporadaId, 'anime_id');
        if (!validationResult.success) {
            return validationResult;
        }
        
        // Verificar que el capítulo existe y pertenece a la temporada
        const capituloCheck = await checkEntityExists(db, 'capitulos', 'id', capituloId, 'temporada_id', temporadaId);
        if (!capituloCheck.success || !capituloCheck.exists) {
            return { 
                success: false, 
                error: !capituloCheck.success ? capituloCheck.error : 'Capítulo no encontrado para esta temporada y anime' 
            };
        }
        
        // Construir la consulta de actualización dinámicamente
        const fieldsToUpdate = {};
        if (statsData.me_gustas !== undefined) fieldsToUpdate.me_gustas = statsData.me_gustas;
        if (statsData.no_me_gustas !== undefined) fieldsToUpdate.no_me_gustas = statsData.no_me_gustas;
        if (statsData.reproducciones !== undefined) fieldsToUpdate.reproducciones = statsData.reproducciones;
        
        // Verificar si hay campos para actualizar
        const fieldKeys = Object.keys(fieldsToUpdate);
        if (fieldKeys.length === 0) {
            return { success: false, error: 'No se proporcionaron estadísticas para actualizar.' };
        }
        
        // Construir la consulta SQL
        const setClause = fieldKeys.map(key => `${key} = ?`).join(', ');
        const params = [...Object.values(fieldsToUpdate), capituloId];
        const query = `UPDATE capitulos SET ${setClause} WHERE id = ?`;
        
        // Ejecutar la consulta
        const queryResult = await executeQuery(db, query, params);
        
        if (!queryResult.success) {
            return { 
                success: false, 
                error: queryResult.error?.message || 'Error al actualizar estadísticas del capítulo', 
                details: queryResult.details 
            };
        }
        
        return { 
            success: true, 
            message: 'Estadísticas del capítulo actualizadas exitosamente'
        };
    } catch (error) {
        console.error('Error en updateCapituloStats:', error);
        return { success: false, error: 'Error interno del servidor' };
    }
};

module.exports = {
    initializeRouter,
    executeQuery,
    getDb: () => db,
    getAnimeWithSeasonsAndEpisodes,
    getTemporadaWithEpisodes,
    getCapitulo,
    checkEntityExists,
    validateEntityRelationship,
    handleErrorResponse,
    formatCapitulo,
    formatTemporada,
    getCapitulosForTemporadas,
    createCapitulo,
    updateCapitulo,
    deleteCapitulo,
    updateCapituloStats
};
const getDb = () => db;
export {
    initializeRouter,
    executeQuery,
    getDb,
    getAnimeWithSeasonsAndEpisodes,
    getTemporadaWithEpisodes,
    getCapitulo,
    checkEntityExists,
    validateEntityRelationship,
    handleErrorResponse,
    formatCapitulo,
    formatTemporada,
    getCapitulosForTemporadas,
    createCapitulo,
    updateCapitulo,
    deleteCapitulo,
    updateCapituloStats
};