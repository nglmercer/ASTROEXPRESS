import { dbController } from '../backupdb.js';
import authService  from "./jwt.js";

export class LoginModel {
  constructor() {}

  async iniciarSesion({apodoUsuario, correoUsuario,claveUsuario}) {
    const results = await dbController.queryWithFilters('usuarios', { correoUsuario });
    if (!results || results.length === 0) {
      return null;
    }
    const user = results[0];
    const getToken = await authService.authenticateUser(user, claveUsuario);
    return getToken;
  }
}
// test