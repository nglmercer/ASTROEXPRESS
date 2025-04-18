const mysql = require('mysql2/promise');
// Ensure dbValidator is correctly required relative to database.js
const { validateDatabaseStructure, repairDatabaseStructure } = require('./dbValidator');
const path = require('path');
const fs = require('fs').promises;

// Define database name and credentials securely (consider environment variables)
const DB_NAME = 'anime_db';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '1234'; // Replace with secure method
// Verify this path is correct for your project structure
const SQL_FILE_PATH = path.join(__dirname, '..', 'database.sql');

async function initializeDatabase() {
    let initialConnection;
    let db;

    try {
        console.log(`Iniciando conexión a MySQL en ${DB_HOST}...`);
        // 1. Connect to MySQL server
        initialConnection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
        });
        console.log('Conexión inicial a MySQL establecida.');

        // 2. Check if database exists, create if not
        const [dbs] = await initialConnection.query(`SHOW DATABASES LIKE '${DB_NAME}'`);
        if (dbs.length === 0) {
            console.log(`Base de datos '${DB_NAME}' no encontrada. Creando...`);
            await initialConnection.query(`CREATE DATABASE ${DB_NAME}`);
            console.log(`Base de datos '${DB_NAME}' creada exitosamente.`);

            // 3. Connect to the newly created database to run the SQL script
            await initialConnection.end(); // Close initial connection
            db = await mysql.createConnection({
                host: DB_HOST,
                user: DB_USER,
                password: DB_PASSWORD,
                database: DB_NAME,
                multipleStatements: true // IMPORTANT for running SQL script file
            });
            console.log(`Conectado a '${DB_NAME}'. Ejecutando script SQL inicial...`);

            try {
                const sql = await fs.readFile(SQL_FILE_PATH, 'utf8');
                await db.query(sql); // Execute the entire script
                console.log('Script SQL ejecutado exitosamente.');
            } catch (err) {
                console.error(`Error al ejecutar el script SQL desde ${SQL_FILE_PATH}:`, err);
                // Don't proceed if the initial setup script fails
                throw new Error(`Fallo al inicializar la estructura de la base de datos desde ${SQL_FILE_PATH}.`);
            }

        } else {
            // Database exists, just connect to it
            console.log(`Base de datos '${DB_NAME}' encontrada. Conectando...`);
            await initialConnection.end(); // Close initial connection
            db = await mysql.createConnection({
                host: DB_HOST,
                user: DB_USER,
                password: DB_PASSWORD,
                database: DB_NAME,
                multipleStatements: true // Keep enabled
            });
            console.log(`Conectado a '${DB_NAME}'.`);
        }


        // 4. Validate and potentially repair DB structure
        console.log('Verificando estructura de la base de datos...');
        const validationResult = await validateDatabaseStructure(db);

        if (!validationResult.valid) {
            console.warn('Se encontraron problemas en la estructura de la base de datos:');
            validationResult.errors.forEach(error => console.warn(`- ${error}`));

            // --- Repair Strategy ---

            // ***********************************************
            // *** CHANGE IS HERE: Enable Option A         ***
            // ***********************************************
            // Option A: Attempt automatic repair (use with caution, backup first!)
            console.log('Intentando reparar la estructura de la base de datos ejecutando el script SQL...');
            const repairResult = await repairDatabaseStructure(db); // Pass the connected db object

            if (repairResult.success) {
                console.log('Reparación intentada. Volviendo a validar...');
                 // Re-validate after attempting repair
                 const revalidationResult = await validateDatabaseStructure(db);
                 if (!revalidationResult.valid) {
                     // If still invalid after repair attempt, something is wrong
                     console.error('Persisten problemas en la estructura después del intento de reparación:');
                     revalidationResult.errors.forEach(error => console.error(`- ${error}`));
                     console.error('*** El script `database.sql` podría estar incompleto, incorrecto o la reparación falló por otra razón. Deteniendo la aplicación. ***');
                     process.exit(1); // Exit if repair failed and structure is critical
                 } else {
                     console.log('Estructura de la base de datos validada correctamente después de la reparación.');
                 }
            } else {
                // If the repair function itself threw an error (e.g., couldn't read file, SQL syntax error in script)
                console.error('Error durante el intento de reparación:', repairResult.error);
                 console.error('*** No se pudo ejecutar el script de reparación. Deteniendo la aplicación. ***');
                process.exit(1); // Exit if repair failed
            }


            // ***********************************************
            // *** CHANGE IS HERE: Disable Option B        ***
            // ***********************************************
            // Option B: Log errors and exit (Now Disabled by commenting out)
            /*
             console.error('*** La estructura de la base de datos no es válida y la reparación automática está desactivada o falló. ***');
             console.error('*** Por favor, revise los errores anteriores y corrija la base de datos manually o ajuste el script `database.sql`. Deteniendo la aplicación. ***');
             process.exit(1); // Exit because the structure is incorrect
            */


        } else {
            // Validation passed on the first try
            console.log('Estructura de la base de datos validada correctamente.');
        }

        console.log('Inicialización y verificación de la base de datos completada.');
        return db; // Return the connection

    } catch (error) {
        console.error('Fallo crítico durante la inicialización de la base de datos:', error);
        // Ensure connections are closed if they were opened
        if (db) await db.end().catch(e => console.error('Error cerrando conexión db:', e));
        if (initialConnection) await initialConnection.end().catch(e => console.error('Error cerrando conexión inicial:', e));
        process.exit(1); // Exit the application on critical failure
    }
}

module.exports = { initializeDatabase };