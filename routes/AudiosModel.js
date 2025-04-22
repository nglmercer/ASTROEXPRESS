import { dbController } from './backupdb.js';

export class AudiosModel {
  constructor() {}

  async getAllByIdCapitulo(idCapitulo, ignoreEstado = false) {
    const filters = { idCapitulo };
    if (!ignoreEstado) {
      filters.estado = 1;
    }
    return await dbController.queryWithFilters('Audios', filters);
  }

  async getById(id) {
    return await dbController.getById('Audios', id);
  }

  async updateById(id, nombre, lenguaje, ruta, estado, idCapitulo) {
    const sql = `UPDATE Audios SET nombre = ?, lenguaje = ?, ruta = ?, estado = ?, idCapitulo = ? WHERE id = ?`;
    const params = [nombre, lenguaje, ruta, estado, idCapitulo, id];
    return await dbController.queryWithFilters('Audios', { id }, params);
  }

  async deleteById(id) {
    const sql = `DELETE FROM Audios WHERE id = ?`;
    return await dbController.queryWithFilters('Audios', { id });
  }

  async getByCapituloAndLanguage(idCapitulo, lenguaje) {
    const filters = { 
      idCapitulo,
      lenguaje: `%${lenguaje}%`,
      estado: ['!=', 6]
    };
    return await dbController.queryWithFilters('Audios', filters);
  }

  async add(nombre, lenguaje, ruta, estado, idCapitulo) {
    const sql = `INSERT INTO Audios (nombre, lenguaje, ruta, estado, idCapitulo) VALUES (?, ?, ?, ?, ?)`;
    const params = [nombre, lenguaje, ruta, estado, idCapitulo];
    // Implementación de inserción usando dbController
    // Retornar el ID del nuevo registro
  }
}