import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbUrl = path.join(__dirname, 'backup.db');

class DatabaseController {
  constructor() {
    this.dbUrl = dbUrl;
  }

  /**
   * Internal helper to open database
   * @param {number} mode - sqlite3.OPEN_READONLY or OPEN_READWRITE
   * @returns {sqlite3.Database}
   */
  _open(mode) {
    return new sqlite3.Database(this.dbUrl, mode, err => {
      if (err) throw new Error(`Failed to open database: ${err.message}`);
    });
  }

  /**
   * Query database table with multiple filters
   */
  async queryWithFilters(tableName, filters = {}) {
    // verificar con el metodo tableExists
    if (!await this.tableExists(tableName)) {
      return new Promise((resolve, reject) => {
        reject(new Error(`Table ${tableName} does not exist`));
      });
    }
    return new Promise((resolve, reject) => {
      const db = this._open(sqlite3.OPEN_READWRITE);
      const entries = Object.entries(filters);
      const where = entries.length
        ? `WHERE ${entries.map(([c]) => `${c} = ?`).join(' AND ')}`
        : '';
      const sql = `SELECT * FROM ${tableName} ${where}`;
      db.all(sql, entries.map(([, v]) => v), (err, rows) => {
        db.close();
        if (err) return reject(err);
        if (!rows || rows.length === 0) return resolve([]);
        resolve(rows.length === 1 ? rows[0] : rows);
      });
    });
  }

  /**
   * Get records with pagination
   */
  async getRecords(tableName, limit = 10, offset = 0) {
    return new Promise((resolve, reject) => {
      const db = this._open(sqlite3.OPEN_READWRITE);
      const sql = `SELECT * FROM ${tableName} LIMIT ? OFFSET ?`;
      db.all(sql, [limit, offset], (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  /**
   * Get a single record by ID
   */
  async getById(tableName, id) {
    return new Promise((resolve, reject) => {
      const db = this._open(sqlite3.OPEN_READWRITE);
      const sql = `SELECT * FROM ${tableName} WHERE id = ? LIMIT 1`;
      db.get(sql, [id], (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  /**
   * List all user tables in the database
   * @returns {Promise<Array<{name: string, sql: string}>>}
   */
  async listTables() {
    return new Promise((resolve, reject) => {
      const db = this._open(sqlite3.OPEN_READONLY);
      const sql = `
        SELECT name, sql
        FROM sqlite_master
        WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
      `;
      db.all(sql, [], (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  /**
   * Check if a table exists
   * @param {string} tableName
   * @returns {Promise<boolean>}
   */
  async tableExists(tableName) {
    const tables = await this.listTables();
    return tables.some(t => t.name === tableName);
  }

  /**
   * Get column information for a table
   * @param {string} tableName
   * @returns {Promise<Array<{cid: number, name: string, type: string, notnull: number, dflt_value: any, pk: number}>>}
   */
  async getTableColumns(tableName) {
    return new Promise((resolve, reject) => {
      const db = this._open(sqlite3.OPEN_READONLY);
      const sql = `PRAGMA table_info(${tableName})`;
      db.all(sql, [], (err, cols) => {
        db.close();
        if (err) return reject(err);
        resolve(cols);
      });
    });
  }

  /**
   * Get row count for a table
   * @param {string} tableName
   * @returns {Promise<number>}
   */
  async getRowCount(tableName) {
    return new Promise((resolve, reject) => {
      const db = this._open(sqlite3.OPEN_READONLY);
      const sql = `SELECT COUNT(*) AS count FROM ${tableName}`;
      db.get(sql, [], (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row.count);
      });
    });
  }

  /**
   * Busca registros que contengan una subcadena en una columna específica
   * @param {string} tableName - Nombre de la tabla
   * @param {string} column - Columna donde buscar
   * @param {string} substring - Subcadena a buscar
   * @returns {Promise<Array>}
   */
  async searchBySubstring(tableName, column, substring) {
    if (!await this.tableExists(tableName)) {
      throw new Error(`La tabla ${tableName} no existe`);
    }

    const columns = await this.getTableColumns(tableName);
    const validColumn = columns.some(col => col.name === column);
    
    if (!validColumn) {
      throw new Error(`La columna ${column} no existe en la tabla ${tableName}`);
    }

    return new Promise((resolve, reject) => {
      const db = this._open(sqlite3.OPEN_READONLY);
      const sql = `SELECT * FROM ${tableName} WHERE ${column} LIKE ?`;
      const searchTerm = `%${substring}%`;
      
      db.all(sql, [searchTerm], (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  /**
   * Search across all columns in a table for records containing a substring
   * @param {string} tableName - Name of the table to search
   * @param {string} substring - Substring to look for
   * @returns {Promise<Array>} Matching records
   */
  async searchAcrossAllColumns(tableName, substring) {
    if (!await this.tableExists(tableName)) {
      throw new Error(`Table ${tableName} does not exist`);
    }

    const columns = await this.getTableColumns(tableName);
    const searchTerm = `%${substring}%`;
    
    return new Promise((resolve, reject) => {
      const db = this._open(sqlite3.OPEN_READONLY);
      const conditions = columns.map(col => `${col.name} LIKE ?`).join(' OR ');
      const sql = `SELECT * FROM ${tableName} WHERE ${conditions}`;
      
      db.all(sql, columns.map(() => searchTerm), (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
}

// Export singleton instance
export const dbController = new DatabaseController();
(async () => {
    const exists = await dbController.tableExists('audios');
    console.log('¿Existe tabla audios?', exists);
    
    /*
    if (exists) {
      const cols = await dbController.getTableColumns('audios');
      console.log('Columnas de audios:', cols);
  
      const count = await dbController.getRowCount('audios');
      console.log('Total filas en audios:', count);
    }
  
    */
     const tablas = await dbController.listTables();
    console.log('Tablas en la BD:', tablas);
    // implementar un metodo para buscar en una tabla queryWithFilters si algun elemento incluye una subcadena de texto o contienen un elemento 
    
    // Ejemplo de uso del nuevo método
    if (exists) {
      const resultados = await dbController.searchBySubstring('audios', 'nombre', 'sonido');
      console.log('Resultados de búsqueda:', resultados);
    }
    // implementar si en una tabla existe un elemento que incluye un elemento y devolver todos las columnas o filas que contienen el elemento
    // Example usage of the new method
    if (exists) {
      const fullTextResults = await dbController.searchAcrossAllColumns('audios', 'sonido');
      console.log('Full text search results:', fullTextResults);
    }
  })();