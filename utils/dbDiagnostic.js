/**
 * Script de diagnóstico para verificar la estructura de la base de datos
 * Puede ejecutarse independientemente para detectar problemas
 */
const { initializeDatabase } = require('./database');
const { validateDatabaseStructure, repairDatabaseStructure } = require('./dbValidator');

/**
 * Ejecuta un diagnóstico completo de la base de datos
 */
async function runDiagnostic() {
    console.log('=== INICIANDO DIAGNÓSTICO DE BASE DE DATOS ===');
    console.log('Fecha y hora:', new Date().toLocaleString());
    console.log('-------------------------------------------');
    
    try {
        // Conectar a la base de datos
        console.log('Conectando a la base de datos...');
        const db = await initializeDatabase();
        
        // Validar estructura
        console.log('\nValidando estructura de tablas...');
        const validationResult = await validateDatabaseStructure(db);
        
        if (validationResult.valid) {
            console.log('✅ Estructura de base de datos correcta');
        } else {
            console.log('❌ Se encontraron problemas en la estructura:');
            validationResult.errors.forEach(error => console.log(`   - ${error}`));
            
            // Mostrar detalles por tabla
            console.log('\nDetalles por tabla:');
            for (const [tableName, tableInfo] of Object.entries(validationResult.tables)) {
                if (tableInfo.exists && tableInfo.valid) {
                    console.log(`   ✅ Tabla '${tableName}': Correcta`);
                } else if (tableInfo.exists && !tableInfo.valid) {
                    console.log(`   ⚠️ Tabla '${tableName}': Problemas con columnas: ${tableInfo.missingColumns.join(', ')}`);
                } else {
                    console.log(`   ❌ Tabla '${tableName}': No existe o error: ${tableInfo.error}`);
                }
            }
            
            // Preguntar si se desea reparar
            console.log('\n¿Desea intentar reparar la estructura? (s/n)');
            process.stdin.once('data', async (data) => {
                const answer = data.toString().trim().toLowerCase();
                
                if (answer === 's' || answer === 'si' || answer === 'y' || answer === 'yes') {
                    console.log('\nIniciando reparación...');
                    const repairResult = await repairDatabaseStructure(db);
                    
                    if (repairResult.success) {
                        console.log('✅ Reparación completada');
                        
                        // Volver a validar
                        console.log('\nVerificando estructura después de la reparación...');
                        const revalidationResult = await validateDatabaseStructure(db);
                        
                        if (revalidationResult.valid) {
                            console.log('✅ Estructura corregida correctamente');
                        } else {
                            console.log('⚠️ Persisten algunos problemas después de la reparación:');
                            revalidationResult.errors.forEach(error => console.log(`   - ${error}`));
                        }
                    } else {
                        console.log('❌ Error durante la reparación:', repairResult.error);
                    }
                } else {
                    console.log('Reparación cancelada');
                }
                
                // Cerrar conexión y terminar
                await db.end();
                console.log('\n=== DIAGNÓSTICO FINALIZADO ===');
                process.exit(0);
            });
        }
        
        // Si no hay errores, cerrar directamente
        if (validationResult.valid) {
            await db.end();
            console.log('\n=== DIAGNÓSTICO FINALIZADO ===');
            process.exit(0);
        }
    } catch (error) {
        console.error('\n❌ Error durante el diagnóstico:', error);
        console.error('Detalles del error:', error.stack);
        console.log('\n=== DIAGNÓSTICO FINALIZADO CON ERRORES ===');
        process.exit(1);
    }
}

// Ejecutar el diagnóstico si este archivo se ejecuta directamente
if (require.main === module) {
    runDiagnostic();
}

module.exports = { runDiagnostic };