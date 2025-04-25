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

  /**
   * Guarda un nuevo registro con auto-incremento de IDs específicos
   * @param {string} tableName - Nombre de la tabla
   * @param {Object} data - Datos a insertar
   * @param {Array} idFields - Campos ID a auto-incrementar
   * @returns {Promise<Object>} Registro guardado
   */
  async guardarRegistro(tableName, data, idFields = ["id"]) {
    if (!await this.tableExists(tableName)) {
      throw new Error(`La tabla ${tableName} no existe`);
    }

    const columns = await this.getTableColumns(tableName);
    const validFields = columns.map(c => c.name);

    // Verificar si los IDs proporcionados ya existen
    for (const idField of idFields) {
      if (data[idField] && data[idField] !== 0) {
        const exists = await this._checkIdExists(tableName, idField, data[idField]);
        if (exists) {
          throw new Error(`El ID ${data[idField]} ya existe en la tabla ${tableName}`);
        }
      }
    }

    // Generar nuevos IDs para campos especificados
    const newData = { ...data };
    for (const idField of idFields) {
      if (newData[idField] === 0 || !newData.hasOwnProperty(idField)) {
        const maxId = await this._getMaxId(tableName, idField);
        newData[idField] = maxId + 1;
      }
    }

    return new Promise((resolve, reject) => {
      const db = this._open(sqlite3.OPEN_READWRITE);
      const fields = Object.keys(newData).filter(f => validFields.includes(f));
      const placeholders = fields.map(() => '?').join(', ');
      const sql = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`;

      db.run(sql, fields.map(f => newData[f]), function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ ...newData, rowid: this.lastID });
      });
    });
  }
  async _checkIdExists(tableName, idField, idValue) {
    return new Promise((resolve, reject) => {
      const db = this._open(sqlite3.OPEN_READONLY);
      const sql = `SELECT 1 FROM ${tableName} WHERE ${idField} = ? LIMIT 1`;
      db.get(sql, [idValue], (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(!!row);
      });
    });
  }
  /**
   * Actualiza un registro existente
   * @param {string} tableName - Nombre de la tabla
   * @param {Object} data - Datos a actualizar (debe contener al menos un ID)
   * @returns {Promise<Object>} Registro actualizado
   */
  async actualizarRegistro(tableName, data, idFields = ["id"]) {
    if (!await this.tableExists(tableName)) {
      throw new Error(`La tabla ${tableName} no existe`);
    }

    const columns = await this.getTableColumns(tableName);
    const validFields = columns.map(c => c.name);

    // Verificar IDs existentes
    const hasValidId = idFields.some(f => data[f] && data[f] !== 0);
    if (!hasValidId) throw new Error('Se requiere al menos un ID válido para actualizar');

    return new Promise((resolve, reject) => {
      const db = this._open(sqlite3.OPEN_READWRITE);

      // Separar campos de actualización y valores
      const updateFields = Object.keys(data)
        .filter(f => validFields.includes(f) && !idFields.includes(f));

      const updates = updateFields.map(f => `${f} = ?`).join(', ');
      const where = idFields.map(f => `${f} = ?`).join(' AND ');

      // Obtener valores en el orden correcto: primero updates, luego WHERE
      const updateValues = updateFields.map(f => data[f]);
      const whereValues = idFields.map(f => data[f]);

      const sql = `UPDATE ${tableName} SET ${updates} WHERE ${where}`;

      db.run(sql, [...updateValues, ...whereValues], function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ ...data, changes: this.changes });
      });
    });
  }

  async _getMaxId(tableName, idField) {
    return new Promise((resolve, reject) => {
      const db = this._open(sqlite3.OPEN_READONLY);
      const sql = `SELECT MAX(${idField}) as maxId FROM ${tableName}`;
      db.get(sql, [], (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row?.maxId || 0);
      });
    });
  }

  /**
   * Elimina un registro usando los campos ID especificados
   * @param {string} tableName - Nombre de la tabla
   * @param {Object} ids - Objeto con los IDs para identificar el registro
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async eliminarRegistro(tableName, ids, idFields = ["id"]) {
    if (!await this.tableExists(tableName)) {
      throw new Error(`La tabla ${tableName} no existe`);
    }

    const validIds = Object.entries(ids)
      .filter(([key, value]) => idFields.includes(key) && value !== 0);

    if (validIds.length === 0) {
      throw new Error('Se requiere al menos un ID válido para eliminar');
    }

    return new Promise((resolve, reject) => {
      const db = this._open(sqlite3.OPEN_READWRITE);
      const whereClause = validIds.map(([key]) => `${key} = ?`).join(' AND ');
      const sql = `DELETE FROM ${tableName} WHERE ${whereClause}`;

      db.run(sql, validIds.map(([, value]) => value), function (err) {
        db.close();
        if (err) return reject(err);
        resolve({ changes: this.changes });
      });
    });
  }
    /**
   * Obtiene registros con paginación y ordenamiento.
   * @param {string} tableName - Nombre de la tabla.
   * @param {number} [page=1] - Número de página (base 1).
   * @param {number} [limit=10] - Cantidad de registros por página.
   * @param {string} [orderByColumn='rowid'] - Columna por la cual ordenar. 'rowid' es el ID interno de SQLite. Usa 'id' o tu clave primaria si prefieres.
   * @param {'ASC' | 'DESC'} [orderDirection='ASC'] - Dirección del ordenamiento. 'ASC' para los primeros, 'DESC' para los últimos.
   * @returns {Promise<Array>} - Array de registros paginados.
   */
    async getRecordsWithPagination({tableName, page = 1, limit = 10, orderByColumn = 'rowid', orderDirection = 'DESC'}) {
      // Reutiliza la verificación de existencia de tabla si lo deseas
      // if (!await this.tableExists(tableName)) {
      //   throw new Error(`Table ${tableName} does not exist`);
      // }
  
      const validOrder = ['ASC', 'DESC'].includes(orderDirection.toUpperCase());
      if (!validOrder) {
        throw new Error("orderDirection debe ser 'ASC' o 'DESC'");
      }
      // Asegurar que page y limit sean números positivos
      const currentPage = Math.max(1, page);
      const currentLimit = Math.max(1, limit);
      const offset = (currentPage - 1) * currentLimit;
      const direction = orderDirection.toUpperCase();
  
      return new Promise((resolve, reject) => {
        // Es mejor usar READONLY para consultas SELECT si no modificas datos
        const db = this._open(sqlite3.OPEN_READONLY);
        // Asegúrate de que orderByColumn es un nombre de columna válido para evitar inyección SQL si viniera de input no confiable.
        // Para este ejemplo, asumimos que es seguro ya que viene del código o de una fuente controlada.
        const sql = `
          SELECT *
          FROM ${tableName}
          ORDER BY ${orderByColumn} ${direction}
          LIMIT ? OFFSET ?
        `;
  
        db.all(sql, [currentLimit, offset], (err, rows) => {
          db.close();
          if (err) return reject(err);
          resolve(rows || []); // Devuelve array vacío si no hay filas
        });
      });
    }
}
// Export singleton instance
export const dbController = new DatabaseController();

(async () => {

  /*
  const exists = await dbController.tableExists('audios');
  console.log('¿Existe tabla audios?', exists);

  const tablas = await dbController.listTables();
  //    console.log('Tablas en la BD:', tablas);
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

// Ejemplo de uso
/* (async () => {
  const ejemploData = {
    idCatalogo: 5070, // cuando es 0 genera el id
    nombreCatalogo: 'Ejemplo',
    tipoCatalogo: 1,
    estadoCatalogo: 1
  };

  try {
    // Guardar nuevo registro
    const guardado = await dbController.guardarRegistro('catalogos', ejemploData,["idCatalogo"]);
    console.log('Registro guardado:', guardado);

    // Actualizar registro
    // Debería actualizar solo el nombreCatalogo manteniendo el idCatalogo como condición WHERE
    const actualizado = await dbController.actualizarRegistro('catalogos', {
      idCatalogo: guardado.idCatalogo, // <- Este va al WHERE
      nombreCatalogo: 'Nuevo nombre'   // <- Este va al SET
    }, ["idCatalogo"]);
    console.log('Registro actualizado:', actualizado);
    // LUEGO LO ELIMINAMOS
    const eliminado = await dbController.eliminarRegistro('catalogos', {
      idCatalogo: guardado.idCatalogo
    });
    await dbController.eliminarRegistro('catalogos', {
      idCatalogo: 5072
    });
    await dbController.eliminarRegistro('catalogos', {
      idCatalogo: 5073
    });
    await dbController.eliminarRegistro('catalogos', {
      idCatalogo: 5074
    });
  } catch (error) {
    console.error('Error:', error);
  }
  */
  })(); 

