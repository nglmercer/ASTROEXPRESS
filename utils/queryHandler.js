/**
 * Módulo para manejar consultas SQL con validación previa
 */
const { validateQuery } = require('./dbValidator');

/**
 * Ejecuta una consulta SQL con validación previa
 * @param {Object} db - Conexión a la base de datos
 * @param {string} query - Consulta SQL a ejecutar
 * @param {Array} params - Parámetros de la consulta
 * @returns {Promise<Object>} - Resultado de la consulta o error
 */
async function executeQuery(db, query, params = []) {
    try {
        // Validar la consulta antes de ejecutarla
        const validationResult = await validateQuery(db, query, params);
        
        if (!validationResult.valid) {
            console.error('Error de validación SQL:', validationResult.error);
            return { 
                success: false, 
                error: validationResult.error,
                query,
                params
            };
        }
        
        // Ejecutar la consulta
        const result = await db.query(query, params);
        return { success: true, result };
    } catch (error) {
        console.error('Error al ejecutar consulta SQL:', error.message);
        console.error('Consulta:', query);
        console.error('Parámetros:', params);
        
        // Analizar el error para dar información más detallada
        let errorMessage = error.message;
        let errorDetails = {};
        
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            errorMessage = `Columna no encontrada: ${error.sqlMessage}`;
            errorDetails.suggestion = 'Verifique el nombre de las columnas en la consulta y asegúrese de que existan en la tabla';
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            errorMessage = `Tabla no encontrada: ${error.sqlMessage}`;
            errorDetails.suggestion = 'Verifique el nombre de la tabla y asegúrese de que exista en la base de datos';
        } else if (error.code === 'ER_DUP_ENTRY') {
            errorMessage = `Entrada duplicada: ${error.sqlMessage}`;
            errorDetails.suggestion = 'Ya existe un registro con la misma clave primaria o índice único';
        }
        
        return { 
            success: false, 
            error: errorMessage,
            details: errorDetails,
            originalError: error,
            query,
            params
        };
    }
}

/**
 * Ejecuta una transacción con múltiples consultas
 * @param {Object} db - Conexión a la base de datos
 * @param {Array} queries - Array de objetos {query, params}
 * @returns {Promise<Object>} - Resultado de la transacción
 */
async function executeTransaction(db, queries) {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();
        
        const results = [];
        
        for (const [index, { query, params }] of queries.entries()) {
            // Validar cada consulta
            const validationResult = await validateQuery(connection, query, params);
            
            if (!validationResult.valid) {
                throw new Error(`Error de validación en consulta #${index + 1}: ${validationResult.error}`);
            }
            
            const result = await connection.query(query, params);
            results.push(result);
        }
        
        await connection.commit();
        return { success: true, results };
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        
        console.error('Error en transacción SQL:', error.message);
        return { 
            success: false, 
            error: error.message,
            originalError: error
        };
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

module.exports = {
    executeQuery,
    executeTransaction
};