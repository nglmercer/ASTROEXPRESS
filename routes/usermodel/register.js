import { dbController } from '../backupdb.js';

export class RegisterModel {
  constructor() {}

  async registrarUsuario(usuario, clave, correo) {
    const results = await dbController.queryWithFilters('usuarios', { usuario, clave, correo });
    return results;
  }
}
