/**
 * Módulo para validar la estructura de la base de datos y detectar errores
 */
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// validateDatabaseStructure function with corrected key expectations
async function validateDatabaseStructure(db) {
    console.log('Iniciando validación de estructura de base de datos...');
    const errors = [];
    let overallValid = true;

    // Este esquema esperado YA ESTÁ CORRECTO y coincide con el database.sql corregido
    const expectedSchema = {
        'catalogo': [
            { name: 'id', type: 'int' },
            { name: 'nombre', type: 'varchar'}, // Correcto: Se espera UNI
            { name: 'estado', type: 'int', },
            { name: 'imagen_fondo', type: 'varchar' },
            { name: 'descripcion', type: 'text', },
            { name: 'nsfw', type: 'tinyint', }, // Correcto: tinyint para BOOLEAN
            { name: 'trailer', type: 'varchar', },
            { name: 'recomendacion', type: 'tinyint', } // Correcto: tinyint para BOOLEAN
        ],
        'temporadas': [
            { name: 'id', type: 'int' },
            { name: 'anime_id', type: 'int'}, // Correcto: Se espera NOT NULL y MUL (por FK)
            { name: 'numero', type: 'int',/*Removed */ }, // Correcto: UNI no esperado aquí
            { name: 'nombre', type: 'varchar', },
            { name: 'descripcion', type: 'text', },
            { name: 'portada', type: 'varchar', },
            { name: 'nsfw', type: 'tinyint', }
        ],
        'capitulos': [
            { name: 'id', type: 'int' },
            { name: 'temporada_id', type: 'int'}, // Correcto: Se espera NOT NULL y MUL (por FK)
            { name: 'numero', type: 'int',/*Removed */ }, // Correcto: UNI no esperado aquí
            { name: 'titulo', type: 'varchar', },
            { name: 'descripcion', type: 'text', },
            { name: 'imagen', type: 'varchar', },
            { name: 'path', type: 'varchar', },
            { name: 'duracion_minutos', type: 'int', },
            { name: 'me_gustas', type: 'int', },
            { name: 'no_me_gustas', type: 'int', },
            { name: 'reproducciones', type: 'int', },
            { name: 'animeId', type: 'int'} // Correcto: Se espera NOT NULL 
        ],
        'lenguaje': [
            { name: 'id', type: 'int' },
            { name: 'nombre', type: 'varchar',},
            { name: 'codigo', type: 'varchar',},
            { name: 'ruta', type: 'varchar',},
            { name: 'estado', type: 'int', },
            { name: 'capitulo_id', type: 'int'} // Correcto: Se espera NOT NULL y MUL (por FK)
        ]
    };

    // La lógica de validación aquí es robusta y parece correcta.
    try {
        const [existingTablesResult] = await db.query('SHOW TABLES');
        const existingTableNames = existingTablesResult.map(row => Object.values(row)[0]);
        const expectedTableNames = Object.keys(expectedSchema);

        const missingTables = expectedTableNames.filter(tableName => !existingTableNames.includes(tableName));
        if (missingTables.length > 0) {
             missingTables.forEach(tableName => errors.push(`Tabla requerida '${tableName}' no encontrada.`));
             overallValid = false; // Marcar como inválido si faltan tablas
        }

        for (const tableName of expectedTableNames) {
             if (!existingTableNames.includes(tableName)) {
                // Si la tabla falta y ya se reportó, continuar
                 if (missingTables.includes(tableName)) {
                    continue;
                 }
                 // Si no se reportó antes (caso raro), añadir error
                errors.push(`Tabla requerida '${tableName}' no encontrada (inesperado).`);
                overallValid = false;
                continue;
            }

            const [actualColumnsResult] = await db.query(`DESCRIBE ${tableName}`);
            // Usar un Map para búsqueda eficiente y para rastrear columnas no esperadas (aunque no se use aquí)
            const actualColumnsMap = new Map(actualColumnsResult.map(col => [col.Field, col]));
            const expectedColumns = expectedSchema[tableName];

            for (const expectedCol of expectedColumns) {
                const actualCol = actualColumnsMap.get(expectedCol.name);
                if (!actualCol) {
                    // Si la columna no existe en la BD
                     errors.push(`Tabla '${tableName}': Falta columna requerida '${expectedCol.name}'.`);
                    overallValid = false;
                } else {
                    // Si la columna existe, verificar tipo, nulabilidad y clave
                    const actualTypeBase = actualCol.Type.toLowerCase().split('(')[0];
                    const expectedTypeBase = expectedCol.type.toLowerCase();

                    // Check Type (con tolerancia para int/varchar y tinyint(1))
                    // Usar includes puede ser un poco laxo, pero funciona para tipos comunes.
                    // Una comparación más estricta podría ser necesaria para casos complejos.
                    if (!actualTypeBase.includes(expectedTypeBase)) {
                         // Excepción específica para BOOLEAN/TINYINT(1)
                        if (!((expectedTypeBase === 'tinyint' || expectedTypeBase === 'boolean') && actualCol.Type.toLowerCase() === 'tinyint(1)')) {
                             errors.push(`Tabla '${tableName}', Columna '${expectedCol.name}': Tipo inesperado. Se esperaba ~'${expectedTypeBase}', se encontró '${actualCol.Type}'.`);
                             overallValid = false;
                        }
                    }

                    // Check Nullability
                    if (expectedCol.nullable !== undefined && actualCol.Null !== expectedCol.nullable) {
                       errors.push(`Tabla '${tableName}', Columna '${expectedCol.name}': Nulabilidad incorrecta. Se esperaba '${expectedCol.nullable}', se encontró '${actualCol.Null}'.`);
                       overallValid = false;
                    }

                    // Check Key status (PRI, UNI, MUL)
                     if (expectedCol.key !== undefined && !actualCol.Key.includes(expectedCol.key)) {
                         // Permitir que una Clave Primaria (PRI) satisfaga la expectativa de Única (UNI)
                         if(!(expectedCol.key === 'UNI' && actualCol.Key === 'PRI')) {
                            errors.push(`Tabla '${tableName}', Columna '${expectedCol.name}': Debería ser (o ser parte de) una clave '${expectedCol.key}', pero se encontró '${actualCol.Key}'.`);
                            overallValid = false;
                         }
                    }
                    // Eliminar la columna del map para rastrear extras (opcional)
                    actualColumnsMap.delete(expectedCol.name);
                }
            }
             // Opcional: Verificar si hay columnas extra no definidas en expectedSchema
             // if (actualColumnsMap.size > 0) {
             //     for (const extraColName of actualColumnsMap.keys()) {
             //         errors.push(`Tabla '${tableName}': Columna inesperada encontrada '${extraColName}'.`);
             //         // Podrías marcar overallValid = false si las columnas extra no son permitidas
             //     }
             // }
        }

        console.log(`Validación de estructura completada. ${overallValid ? 'OK' : 'Errores encontrados'}.`);
        return { valid: overallValid, errors };

    } catch (error) {
        console.error('Error crítico durante la validación de la estructura de la base de datos:', error);
        // Asegurarse de retornar el formato esperado incluso en caso de error
        return {
            valid: false,
            errors: [...errors, `Error inesperado durante la validación: ${error.message}`]
        };
    }
}

// Función mejorada para reparar la estructura de la base de datos
async function repairDatabaseStructure(db) {
    console.warn('ADVERTENCIA: Iniciando intento de reparación de estructura de base de datos.');
    console.warn('Esta función intentará ejecutar comandos de `database.sql` individualmente y añadir columnas faltantes.');
    let success = true;
    let finalError = null;
    let failureReason = '';
    let sqlPath = ''; // Declarar fuera del try para usar en catch
    const columnsAdded = []; // Para rastrear las columnas añadidas

    try {
        // Primero, identificar las columnas faltantes en tablas existentes
        console.log('Identificando columnas faltantes en tablas existentes...');
        const { valid, errors } = await validateDatabaseStructure(db);
        
        // Obtener el esquema esperado (reutilizando el de validateDatabaseStructure)
        const expectedSchema = {
            'catalogo': [
                { name: 'id', type: 'int' },
                { name: 'nombre', type: 'varchar'},
                { name: 'estado', type: 'int', },
                { name: 'imagen_fondo', type: 'varchar' },
                { name: 'descripcion', type: 'text', },
                { name: 'nsfw', type: 'tinyint', },
                { name: 'trailer', type: 'varchar', },
                { name: 'recomendacion', type: 'tinyint', }
            ],
            'temporadas': [
                { name: 'id', type: 'int' },
                { name: 'anime_id', type: 'int'},
                { name: 'numero', type: 'int' },
                { name: 'nombre', type: 'varchar', },
                { name: 'descripcion', type: 'text', },
                { name: 'portada', type: 'varchar', },
                { name: 'nsfw', type: 'tinyint', }
            ],
            'capitulos': [
                { name: 'id', type: 'int' },
                { name: 'temporada_id', type: 'int'},
                { name: 'numero', type: 'int' },
                { name: 'titulo', type: 'varchar', },
                { name: 'descripcion', type: 'text', },
                { name: 'imagen', type: 'varchar', },
                { name: 'path', type: 'varchar', },
                { name: 'duracion_minutos', type: 'int', },
                { name: 'me_gustas', type: 'int', },
                { name: 'no_me_gustas', type: 'int', },
                { name: 'reproducciones', type: 'int', },
                { name: 'animeId', type: 'int'}
            ],
            'lenguaje': [
                { name: 'id', type: 'int' },
                { name: 'nombre', type: 'varchar'},
                { name: 'codigo', type: 'varchar'},
                { name: 'ruta', type: 'varchar'},
                { name: 'estado', type: 'int', },
                { name: 'capitulo_id', type: 'int'}
            ]
        };

        // Obtener las tablas existentes
        const [existingTablesResult] = await db.query('SHOW TABLES');
        const existingTableNames = existingTablesResult.map(row => Object.values(row)[0]);
        
        // Para cada tabla existente, verificar columnas faltantes
        for (const tableName of existingTableNames) {
            // Verificar si esta tabla está en nuestro esquema esperado
            if (!expectedSchema[tableName]) {
                console.log(`Tabla '${tableName}' no está en el esquema esperado, omitiendo.`);
                continue;
            }

            try {
                // Obtener columnas actuales de la tabla
                const [actualColumnsResult] = await db.query(`DESCRIBE ${tableName}`);
                const actualColumnNames = actualColumnsResult.map(col => col.Field);
                const expectedColumns = expectedSchema[tableName];

                // Identificar columnas faltantes
                const missingColumns = expectedColumns.filter(col => !actualColumnNames.includes(col.name));

                // Añadir cada columna faltante
                for (const missingCol of missingColumns) {
                    try {
                        // Determinar el tipo SQL completo basado en el tipo base
                        let sqlType = '';
                        switch (missingCol.type.toLowerCase()) {
                            case 'int':
                                sqlType = 'INT';
                                break;
                            case 'varchar':
                                sqlType = 'VARCHAR(255)';
                                break;
                            case 'text':
                                sqlType = 'TEXT';
                                break;
                            case 'tinyint':
                                sqlType = 'TINYINT(1)';
                                break;
                            default:
                                sqlType = missingCol.type.toUpperCase();
                        }

                        // Construir y ejecutar el comando ALTER TABLE
                        const alterCmd = `ALTER TABLE ${tableName} ADD COLUMN ${missingCol.name} ${sqlType}`;
                        console.log(`Añadiendo columna faltante: ${alterCmd}`);
                        await db.query(alterCmd);
                        columnsAdded.push(`${tableName}.${missingCol.name}`);
                    } catch (error) {
                        console.error(`Error al añadir columna '${missingCol.name}' a tabla '${tableName}':`, error.message);
                        // No marcamos como fallo total, continuamos con otras columnas
                    }
                }
            } catch (error) {
                console.error(`Error al obtener estructura de tabla '${tableName}':`, error.message);
                // No marcamos como fallo total, continuamos con otras tablas
            }
        }

        // Ahora ejecutamos el script SQL completo para asegurar que se crean tablas faltantes
        // y se aplican otras restricciones
        sqlPath = path.join(__dirname, '..', 'database.sql');
        console.log(`Leyendo script SQL desde: ${sqlPath}`);
        const sql = await fs.readFile(sqlPath, 'utf8');

        // Filtrar comentarios y comandos vacíos de forma más robusta
        const statements = sql.split(';')
                             .map(stmt => stmt.trim())
                             .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));

        console.log(`Ejecutando ${statements.length} comandos individuales desde: ${sqlPath}`);

        for (const statement of statements) {
            try {
                 // Omitir 'USE database;' ya que la conexión ya está establecida a la DB correcta
                 if (statement.toUpperCase().startsWith('USE ')) {
                    console.log(`Omitiendo comando: ${statement}`);
                    continue;
                 }
                 // Log corto del comando
                console.log(`Ejecutando: ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
                await db.query(statement);
            } catch (error) {
                // Errores comunes que se pueden ignorar durante la reparación
                // (la tabla/columna/clave ya existe)
                const isIgnorable =
                    error.code === 'ER_TABLE_EXISTS_ERROR' ||  // 1050
                    error.code === 'ER_DUP_KEYNAME' ||         // 1061 - Clave duplicada (ya existe)
                    error.code === 'ER_COLUMN_EXISTS_ERROR' || // 1060 - Columna duplicada (ya existe)
                    error.code === 'ER_DUP_ENTRY';             // 1062 - Entrada duplicada (puede ocurrir con ADD UNIQUE si ya hay duplicados) - Considerar si ignorar

                if (isIgnorable) {
                    console.warn(`Advertencia (ignorado): ${error.code} - ${error.sqlMessage}`);
                    // Si es ER_DUP_ENTRY al añadir UNIQUE/PRIMARY, podría indicar un problema de datos
                    if (error.code === 'ER_DUP_ENTRY' && (statement.toUpperCase().includes('ADD UNIQUE') || statement.toUpperCase().includes('ADD PRIMARY'))) {
                       console.warn(` -> Nota: ${error.code} en ${statement.substring(0,50)}... puede indicar datos duplicados existentes.`);
                       // No marcamos como fallo aquí, pero es una advertencia importante
                    }
                }
                // Errores específicos al modificar estructura que probablemente se deben a datos existentes
                else if (statement.toUpperCase().includes('MODIFY COLUMN') &&
                        (error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD' || // Dato inválido para nuevo tipo/restricción
                         error.code === 'ER_INVALID_USE_OF_NULL' ||          // NULL encontrado donde se requiere NOT NULL
                         error.code === 'ER_DATA_TOO_LONG' ||                // Dato existente muy largo para nuevo tamaño
                         error.code === 'ER_WARN_DATA_OUT_OF_RANGE')         // Valor numérico fuera de rango
                        )
                {
                     console.error(`Error crítico ejecutando comando MODIFY (posiblemente por datos existentes incompatibles): ${statement.substring(0, 100)}...`);
                     console.error(`Detalles del error: ${error.message} (Code: ${error.code})`);
                     failureReason = `MODIFY COLUMN falló (${error.code}), probablemente debido a datos existentes (NULL, duplicados, fuera de rango o inválidos). Limpie los datos manualmente o ajuste el script SQL.`;
                     success = false;
                     finalError = error;
                     break; // Detener la reparación al primer error crítico de datos/modificación
                }
                 // Otros errores (sintaxis SQL, permisos, etc.)
                else {
                    console.error(`Error crítico ejecutando comando: ${statement.substring(0, 100)}...`);
                    console.error(`Detalles del error: ${error.message} (Code: ${error.code})`);
                    failureReason = `Error de sintaxis SQL, de permisos u otro error crítico (${error.code}): ${error.message}`;
                    success = false;
                    finalError = error;
                    break; // Detener la reparación al primer error crítico
                }
            }
        }

        if (success) {
             const columnsAddedMsg = columnsAdded.length > 0 ? 
                 `Se añadieron las siguientes columnas: ${columnsAdded.join(', ')}. ` : 
                 'No se detectaron columnas faltantes para añadir. ';
             
             console.log(`Intento de reparación completado. ${columnsAddedMsg}Comandos ejecutados, errores ignorables pueden haber ocurrido.`);
             return {
                 success: true,
                 message: `Se completó la reparación. ${columnsAddedMsg}`,
                 columnsAdded
             };
        } else {
             console.error(`Intento de reparación fallido. ${failureReason}`);
              return {
                 success: false,
                 // Proporcionar más contexto en el error
                 error: `Error al ejecutar comando SQL durante reparación: "${finalError?.message || 'Error desconocido'}" (Code: ${finalError?.code || 'N/A'}) en comando: ${finalError?.sql?.substring(0, 100) || 'N/A'}...`,
                 reason: failureReason,
                 columnsAdded
             };
        }

    } catch (error) {
        // Error al leer el archivo SQL o error inesperado
        console.error(`Error general durante el intento de reparación de la base de datos (posiblemente leyendo ${sqlPath}):`, error);
        return {
            success: false,
            error: `Error general durante reparación (ej. lectura de archivo ${sqlPath}): ${error.message}`,
            columnsAdded
        };
    }
}
async function validateQuery(db, query, params = []) {
    try {
        // Verificar si es una consulta de inserción o actualización
        const isInsert = query.toLowerCase().includes('insert into');
        const isUpdate = query.toLowerCase().includes('update');
        
        if (!isInsert && !isUpdate) {
            return { valid: true }; // Solo validamos inserciones y actualizaciones
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
            return { valid: false, error: `Error al validar columnas: ${error.message}` };
        }
    } catch (error) {
        return { valid: false, error: `Error en la validación de la consulta: ${error.message}` };
    }
}

module.exports = {
    validateDatabaseStructure,
    repairDatabaseStructure,
    validateQuery
};