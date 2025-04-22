import { dbController } from './backupdb.js';

export class SubtitulosModel {
  constructor() {}

  async getByCapituloAndLanguage2(idCapitulo, lenguaje2) {
    const filters = { 
      idCapitulo,
      lenguaje2: `%${lenguaje2}%`,
      estado: ['!=', 6]
    };
    return await dbController.queryWithFilters('Subtitulos', filters);
  }

  async getAllByIdCapitulo(idCapitulo, ignoreEstado = false) {
    const filters = { idCapitulo };
    if (!ignoreEstado) {
      filters.estado = 1;
    }
    return await dbController.queryWithFilters('Subtitulos', filters);
  }

  async getAllByIdCapituloV2(idCapitulo, ignoreEstado = false) {
    const filters = { 
      idCapitulo,
      versiona: 2
    };
    if (!ignoreEstado) {
      filters.estado = 1;
    }
    return await dbController.queryWithFilters('Subtitulos', filters);
  }

  async updateById(id, nombre, porDefecto, autoSeleccionado, forzado, lenguaje, lenguaje2, ruta, estado, idCapitulo, version) {
    // Implementación de actualización
  }

  async deleteById(id) {
    return await dbController.queryWithFilters('Subtitulos', { id });
  }

  async getById(id) {
    return await dbController.getById('Subtitulos', id);
  }

  async add(nombre, porDefecto, autoSeleccionado, forzado, lenguaje, lenguaje2, ruta, estado, idCapitulo, version) {
    // Implementación de inserción
  }
}