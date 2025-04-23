import { dbController } from '../backupdb.js';

export class ResolucionesModel {
  constructor() {}

  async getAllByIdCapitulo(idCapitulo, ignoreEstado = false) {
    const filters = { idCapitulo };
    if (!ignoreEstado) {
      filters.estado = 1;
    }
    const existResolucion = await dbController.tableExists('resoluciones');
    const results = await dbController.queryWithFilters('resoluciones', filters);
    console.log("existResolucion",existResolucion,"results",results, filters);
    return results;
  }

  async getByCapituloAndResolution(idCapitulo, resolution) {
    const filters = { 
      idCapitulo,
      resolucion: `%${resolution}%`,
      estado: ['!=', 6]
    };
    return await dbController.queryWithFilters('resoluciones', filters);
  }

  async updateById(id, anchoDeBanda, promedioAnchoDeBanda, resolucion, ruta, estado, idCapitulo) {
    const filters = { id };
    const updateData = {
      anchoDeBanda,
      promedioAnchoDeBanda,
      resolucion,
      ruta,
      estado,
      idCapitulo
    };
    // Implementación de actualización
  }

  async deleteById(id) {
    return await dbController.queryWithFilters('resoluciones', { id });
  }

  async add(anchoDeBanda, promedioAnchoDeBanda, resolucion, ruta, estado, idCapitulo) {
    // Implementación de inserción
  }

  async getById(id) {
    return await dbController.getById('resoluciones', id);
  }
}