import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbUrl = path.join(__dirname, "backup.db");

class DatabaseController {
    constructor() {
        this.dbUrl = dbUrl;
    }

    /**
     * Query database table with multiple filters
     * @param {string} tableName - Name of the table to query
     * @param {Object} filters - Object with column names and values to filter by
     * @returns {Promise} - Resolves with matching rows or rejects with error
     */
    async queryWithFilters(tableName, filters = {}) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbUrl, sqlite3.OPEN_READWRITE, (err) => {
                if (err) reject(new Error(`Failed to open database: ${err.message}`));
            });

            const filterEntries = Object.entries(filters);
            const whereClause = filterEntries.length 
                ? `WHERE ${filterEntries.map(([col]) => `${col} = ?`).join(' AND ')}`
                : '';
            const query = `SELECT * FROM ${tableName} ${whereClause}`;
            
            db.all(query, filterEntries.map(([_, value]) => value), (err, rows) => {
                db.close();
                if (err) reject(err);
                if (!rows || rows?.length === 0) resolve([]);
                console.log("rows", rows);
                resolve(rows?.length === 1 ? rows[0] : rows);
            });
        });
    }

    /**
     * Get records with pagination
     * @param {string} tableName - Name of the table
     * @param {number} limit - Number of records to return
     * @param {number} offset - Number of records to skip
     * @returns {Promise} - Resolves with array of records
     */
    async getRecords(tableName, limit = 10, offset = 0) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbUrl, sqlite3.OPEN_READWRITE, (err) => {
                if (err) reject(new Error(`Failed to open database: ${err.message}`));
            });

            const query = `SELECT * FROM ${tableName} LIMIT ? OFFSET ?`;
            db.all(query, [limit, offset], (err, rows) => {
                db.close();
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    /**
     * Get a single record by ID
     * @param {string} tableName - Name of the table
     * @param {number} id - ID of the record to fetch
     * @returns {Promise} - Resolves with single record object
     */
    async getById(tableName, id) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbUrl, sqlite3.OPEN_READWRITE, (err) => {
                if (err) reject(new Error(`Failed to open database: ${err.message}`));
            });

            const query = `SELECT * FROM ${tableName} WHERE id = ? LIMIT 1`;
            db.get(query, [id], (err, row) => {
                db.close();
                if (err) reject(err);
                resolve(row);
            });
        });
    }
}

// Initialize database
const db = new sqlite3.Database(dbUrl, (err) => {
    if (err) console.error('Error creating database:', err);
});

// Export controller instance
export const dbController = new DatabaseController();

// Usage examples:
// Get by multiple filters
 dbController.queryWithFilters('audios', { id: 1, type: 'mp3' })
 .then(console.log)
   .catch(console.error);

// Get first 10 records
 dbController.getRecords('audios', 10, 0)
 .then(console.log)
   .catch(console.error);

// Get by ID
dbController.getById('audios', 1)
   .then(console.log)
   .catch(console.error);
