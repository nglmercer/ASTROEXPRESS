import { dbController } from './backupdb.js';

export class AudiosModel {
  constructor() {}

  async getAllByIdCapitulo(idCapitulo, ignoreEstado = false) {
    const existAudio = await dbController.tableExists('audios');
    const filters = { idCapitulo };
    if (!ignoreEstado) {
      filters.estado = 1;
    }
    const results =  await dbController.queryWithFilters('audios', filters);
    console.log("existAudio",existAudio,"results",results, filters);
    return results;
  }

  async getById(id) {
    const results = await dbController.getById('audios', id);
    return results;
  }

  async updateById(id, nombre, lenguaje, ruta, estado, idCapitulo) {
    const sql = `UPDATE audios SET nombre = ?, lenguaje = ?, ruta = ?, estado = ?, idCapitulo = ? WHERE id = ?`;
    const params = [nombre, lenguaje, ruta, estado, idCapitulo, id];
    return await dbController.queryWithFilters('audios', { id }, params);
  }

  async deleteById(id) {
    const sql = `DELETE FROM audios WHERE id = ?`;
    return await dbController.queryWithFilters('audios', { id });
  }

  async getByCapituloAndLanguage(idCapitulo, lenguaje) {
    const filters = { 
      idCapitulo,
      lenguaje: `%${lenguaje}%`,
      estado: ['!=', 6]
    };
    return await dbController.queryWithFilters('audios', filters);
  }

  async add(nombre, lenguaje, ruta, estado, idCapitulo) {
    const sql = `INSERT INTO audios (nombre, lenguaje, ruta, estado, idCapitulo) VALUES (?, ?, ?, ?, ?)`;
    const params = [nombre, lenguaje, ruta, estado, idCapitulo];
    // Implementación de inserción usando dbController
    // Retornar el ID del nuevo registro
  }
}