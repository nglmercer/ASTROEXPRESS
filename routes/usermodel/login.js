import { dbController } from '../backupdb.js';

export class LoginModel {
  constructor() {}

  async iniciarSesion(apodoUsuario, correoUsuario,claveUsuario) {
    const results = await dbController.queryWithFilters('usuarios', { apodoUsuario });
    return results;
  }
}
// test