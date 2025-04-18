/**
 * Módulo para verificar y diagnosticar errores en la base de datos
 */
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

/**
 * Verifica la estructura de la base de datos y compara con el esquema esperado
 * @param {Object} db - Conexión a la base de datos
 * @returns {Promise<Object>} - Resultado de la verificación
 */
async function checkDatabaseStructure(db) {
    try {
        console.log('Verificando estructura de la base de datos...');
        
        // Definir el esquema esperado de las tablas
        const expectedSchema = {
            'catalogo': [
                { name: 'id', type: 'int' },
                { name: 'nombre', type: 'varchar' },
                { name: 'imagen_fondo', type: 'varchar' },
                { name: 'estado', type: 'int' },
                { name: 'descripcion', type: 'text' },
                { name: 'nsfw', type: 'tinyint' },
                { name: 'trailer', type: 'varchar' },
                { name: 'recomendacion', type: 'tinyint' }
            ],
            'temporada': [
                { name: 'id', type: 'int' },
                { name: 'catalogo_id', type: 'int' },
                { name: 'nombre', type: 'varchar' },
                { name: 'portada', type: 'varchar' },
                { name: 'numero', type: 'int' }
            ],
            'capitulo': [
                { name: 'id', type: 'int' },
                { name: 'numero', type: 'int' },
                { name: 'temporada_id', type: 'int' },
                { name: 'reproducciones', type: 'int' }
            ],
            'lenguaje': [
                { name: 'id', type: 'int' },
                { name: 'nombre', type: 'varchar' },
                { name: 'codigo', type: 'varchar' },
                { name: 'ruta', type: 'varchar' },
                { name: 'estado', type: 'int' },
                { name: 'capitulo_id', type: 'int' }
            ]
        };

        const results = {};
        const errors = [];

        // Verificar cada tabla
        for (const tableName of Object.keys(expectedSchema)) {
            try {
                // Obtener la estructura actual de la tabla
                const [columns] = await db.query(`DESCRIBE ${tableName}`);
                const actualColumns = columns.map(col => ({
                    name: col.Field,
                    type: col.Type.split('(')[0].toLowerCase()
                }));

                // Verificar si todas las columnas esperadas existen
                const missingColumns = [];
                const expectedColumns = expectedSchema[tableName];

                for (const expectedCol of expectedColumns) {
                    const found = actualColumns.some(actualCol => 
                        actualCol.name === expectedCol.name && 
                        actualCol.type.includes(expectedCol.type)
                    );

                    if (!found) {
                        missingColumns.push(expectedCol.name);
                    }
                }

                results[tableName] = {
                    exists: true,
                    missingColumns,
                    valid: missingColumns.length === 0
                };

                if (missingColumns.length > 0) {
                    errors.push(`Tabla '${tableName}' tiene columnas faltantes o incorrectas: ${missingColumns.join(', ')}`);
                }
            } catch (error) {
                results[tableName] = {
                    exists: false,
                    error: error.message
                };
                errors.push(`Error al verificar tabla '${tableName}': ${error.message}`);
            }
        }

        return {
            valid: errors.length === 0,
            tables: results,
            errors
        };
    } catch (error) {
        console.error('Error durante la verificación de la base de datos:', error);
        return {
            valid: false,
            error: error.message
        };
    }
}

/**
 * Verifica una consulta SQL antes de ejecutarla
 * @param {Object} db - Conexión a la base de datos
 * @param {string} query - Consulta SQL a verificar
 * @param {Array} params - Parámetros de la consulta
 * @returns {Promise<Object>} - Resultado de la verificación
 */
async function checkQuery(db, query, params = []) {
    try {
        // Verificar si es una consulta de inserción o actualización
        const isInsert = query.toLowerCase().includes('insert into');
        const isUpdate = query.toLowerCase().includes('update');
        
        if (!isInsert && !isUpdate) {
            return { valid: true }; // Solo verificamos inserciones y actualizaciones
        }

        // Extraer nombre de la tabla
        let tableName = '';
        if (isInsert) {
            const match = query.match(/insert\s+into\s+([\w_]+)/i);
            if (match && match[1]) tableName = match[1];
        } else if (isUpdate) {
            const match = query.match(/update\s+([\w_]+)/i);
            if (match && match[1]) tableName = match[1];
        }

        if (!tableName) {
            return { valid: false, error: 'No se pudo determinar la tabla en la consulta' };
        }

        // Extraer nombres de columnas
        const columnMatch = isInsert 
            ? query.match(/\(([^)]+)\)\s+values/i)
            : query.match(/set\s+([^\s]+\s*=\s*[^,]+(?:,\s*[^\s]+\s*=\s*[^,]+)*)/i);

        if (!columnMatch) {
            return { valid: false, error: 'No se pudieron extraer las columnas de la consulta' };
        }

        let columns = [];
        if (isInsert) {
            columns = columnMatch[1].split(',').map(col => col.trim());
        } else {
            columns = columnMatch[1].split(',').map(col => col.split('=')[0].trim());
        }

        // Verificar si las columnas existen en la tabla
        try {
            const [tableInfo] = await db.query(`DESCRIBE ${tableName}`);
            const tableColumns = tableInfo.map(col => col.Field);
            
            const invalidColumns = columns.filter(col => !tableColumns.includes(col));
            
            if (invalidColumns.length > 0) {
                return { 
                    valid: false, 
                    error: `Las siguientes columnas no existen en la tabla ${tableName}: ${invalidColumns.join(', ')}`,
                    invalidColumns
                };
            }
            
            return { valid: true };
        } catch (error) {
            return { valid: false, error: `Error al verificar columnas: ${error.message}` };
        }
    } catch (error) {
        return { valid: false, error: `Error en la verificación de la consulta: ${error.message}` };
    }
}

/**
 * Intenta reparar la estructura de la base de datos según el archivo SQL
 * @param {Object} db - Conexión a la base de datos
 * @returns {Promise<Object>} - Resultado de la reparación
 */
async function repairDatabaseStructure(db) {
    try {
        console.log('Intentando reparar la estructura de la base de datos...');
        
        // Leer el archivo SQL
        const sqlPath = path.join(__dirname, '..', 'database.sql');
        const sql = await fs.readFile(sqlPath, 'utf8');
        
        // Dividir en declaraciones SQL
        const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
        
        const results = [];
        
        // Ejecutar cada declaración
        for (const statement of statements) {
            try {
                await db.query(statement);
                results.push({ success: true, statement });
            } catch (error) {
                // Ignorar errores de 'ya existe'
                if (!error.message.includes('already exists')) {
                    results.push({ 
                        success: false, 
                        statement, 
                        error: error.message 
                    });
                }
            }
        }
        
        return {
            success: true,
            message: 'Reparación de base de datos completada',
            details: results
        };
    } catch (error) {
        console.error('Error durante la reparación de la base de datos:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Ejecuta un diagnóstico completo de la base de datos
 * @param {Object} db - Conexión a la base de datos
 * @returns {Promise<Object>} - Resultado del diagnóstico
 */
async function runDiagnostic(db) {
    console.log('=== INICIANDO DIAGNÓSTICO DE BASE DE DATOS ===');
    
    try {
        // Verificar estructura
        const structureResult = await checkDatabaseStructure(db);
        
        if (!structureResult.valid) {
            console.log('Problemas encontrados en la estructura de la base de datos:');
            structureResult.errors.forEach(error => console.log(`- ${error}`));
            
            // Intentar reparar
            console.log('\nIntentando reparar problemas...');
            const repairResult = await repairDatabaseStructure(db);
            
            if (repairResult.success) {
                console.log('Reparación completada. Verificando nuevamente...');
                
                // Verificar nuevamente después de la reparación
                const recheck = await checkDatabaseStructure(db);
                
                if (recheck.valid) {
                    console.log('✅ Todos los problemas han sido resueltos');
                } else {
                    console.log('⚠️ Algunos problemas persisten después de la reparación:');
                    recheck.errors.forEach(error => console.log(`- ${error}`));
                }
                
                return {
                    fixed: recheck.valid,
                    initialProblems: structureResult.errors,
                    remainingProblems: recheck.errors
                };
            } else {
                console.log('❌ Error durante la reparación:', repairResult.error);
                return {
                    fixed: false,
                    initialProblems: structureResult.errors,
                    repairError: repairResult.error
                };
            }
        } else {
            console.log('✅ Estructura de la base de datos correcta');
            return { valid: true };
        }
    } catch (error) {
        console.error('Error durante el diagnóstico:', error);
        return {
            valid: false,
            error: error.message
        };
    }
}

module.exports = {
    checkDatabaseStructure,
    checkQuery,
    repairDatabaseStructure,
    runDiagnostic
};